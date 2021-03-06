import 'dotenv/config'; // read .env file
import WebSocket from 'ws';
import { newUuid, log } from './lib';

export const MSG_KIND_SES    = 'ses'; // connected, server => session ID => client
export const MSG_KIND_GEO    = 'geo'; // geolocation update
export const MSG_KIND_JOINED = 'joined';
export const MSG_KIND_LEFT   = 'left';
export const MSG_KIND_CHAT   = 'chat';
//export const MSG_KIND_RELAY  = 'relay'; ??

export const USERNAME_FB = 'frenchbench';

export const newMsg = ({ kind, msg, ...rest }) => {
  return {
    kind,
    msg,
    id: newUuid(),
    ts: (new Date).toISOString(),
    ...rest,
  }
}

// TODO: for now let's use 'username' for prop 'by'; in future we need to use 'id', just in case username may be updated
export const newSesMsg    = (msg, ses) => newMsg({ kind: MSG_KIND_SES, msg, ses, by: USERNAME_FB });
export const newJoinedMsg = (user)     => newMsg({ kind: MSG_KIND_JOINED, msg: user.username + ' joined', by: USERNAME_FB });
export const newChatMsg   = (msg, by)  => newMsg({ kind: MSG_KIND_CHAT, msg, by });

export class FbHub {
  constructor(){
    this.clients = new Map();
  }
  add(sesId, ws, user) {
    return this.clients.set(sesId, { ws, user });
  }
  get(sesId) {
    return this.clients.get(sesId);
  }
  remove(sesId) {
    return this.clients.delete(sesId);
  }
  sendToNeighbours(msg, fromSesId) {
    // const fromClient = this.get(fromSesId);
    for (let [sesId, client] of this.clients) {
      // TODO: filter by geolocation
      //if (sesId !== fromSesId) { // except owner of msg
        client.ws.send(msg);
      //}
    }
  }
}

export async function newWebSocketServer({ config, securityMgr, api }) {

  const webSocketServer = new WebSocket.Server({ noServer: true });
  const hub = new FbHub();

  function onHttpUpgrade(request, socket, head) {
    log('onHttpUpgrade');
    const { user, error } = securityMgr.getSessionUser(request);
    log('onHttpUpgrade user', user);
    if (!user) {
      log('no user!');
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }
    log('upgrading websocket');
    function afterUpgrade(ws) {
      webSocketServer.emit('connection', ws, request, user);
    }
    webSocketServer.handleUpgrade(request, socket, head, afterUpgrade);
  }

  function broadcast(msg) {
    webSocketServer.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  }

  function onOpen() {
    log('wss open');
    //webSocketServer.send(Date.now());
    // TODO: add to hub
  }
  
  function onConnection(ws, request, user) {
    log('wss connection request', request);
    log('wss connection user', user);
    const ip1 = request.socket.remoteAddress;
    const forwardedFor = request.headers['x-forwarded-for'] || '';
    const ip2 = forwardedFor.split(/\s*,\s*/)[0];
    log('remoteAddress', ip1);
    log('x-forwarded-for', ip2);

    const sesId = newUuid();
    hub.add(sesId, ws, user);

    function onClose() {
      log('ws close');
      hub.remove(sesId);
    }

    function onMessage(msgJson) {
      log('ws message', msgJson);

      const msgObj = JSON.parse(msgJson);
      if (!msgObj) {
        log('ws message: msg invalid');
        return;
      }

      if (msgObj.ses && (msgObj.ses === sesId)) { // simple auth
        // ok
      } else {
        log('ws message: ses invalid');
        return;
      }

      //TODO: tell everyone nearby
      const client = hub.get(sesId);
      const owner = client.user;
      let gossipObj;

      switch (msgObj.kind) {
        case MSG_KIND_GEO:
          // @see https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPosition
          if (msgObj.geo) {
            const { timestamp = 0, coords = null } = msgObj.geo ?? {};
            if (timestamp && coords) {
              const { latitude, longitude, accuracy } = coords;
              const input = {
                lat: latitude,
                lon: longitude,
                geo_accuracy: accuracy,
              };
              // no 'await', ignore result
              api.usergeo_update_self({ user: owner, input });
            }
          }
          break;
        case MSG_KIND_JOINED:
          // TODO:
          break;
        case MSG_KIND_LEFT:
          // TODO:
          break;
        case MSG_KIND_CHAT:
          // TODO: prepare new msg
          gossipObj = newChatMsg(msgObj.msg, owner.username);
          hub.sendToNeighbours(JSON.stringify(gossipObj), sesId);
          break;
        default:
          break;
      }
    }

    ws.on('close', onClose);
    ws.on('message', onMessage);

    const sesMsgObj = newSesMsg('hi ' + user.username + '!', sesId);
    ws.send(JSON.stringify(sesMsgObj));

    // TODO: tell others near guest that s/he joined
    const joinedMsgObj = newJoinedMsg(user);
    broadcast(JSON.stringify(joinedMsgObj));
  }

  function onClose() {
    log('wss close');
  }

  webSocketServer.on('open', onOpen);
  webSocketServer.on('close', onClose);
  webSocketServer.on('connection', onConnection);

  return Promise.resolve({
    webSocketServer,
    onHttpUpgrade,
  });
}
