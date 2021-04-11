import { Request, Response } from 'express';
import { IFactory } from '../../../factory';
import { ErrUnauthorized, ERR_NO_FILE_UPLOADED, log, newUuid } from '../../../lib';

export interface IApiUploadHandler {
  (req: Request, res: Response): Promise<void>;
}

export function makeApiUploadHandler({ fileMgr, securityMgr }: IFactory): IApiUploadHandler {

  // handle '/api/upload'
  async function handleApiUpload(req: Request, res: Response): Promise<void> {
    const t1 = new Date();
    
    const rid = newUuid();
    req['id'] = rid;
    log(rid, '/api/upload request START');

    let data = null, error = null;
    try {

      const { user = null, error: tokenError = null } = securityMgr.getSessionUser(req);
      if (!user) { // require a valid JWT cookie
        if (tokenError) throw new ErrUnauthorized(tokenError);
        throw new ErrUnauthorized();
      }

      const { files, fields } = await fileMgr.receiveFiles(req);
      const { fb_file } = files || {};
      if (!fb_file) throw new Error(ERR_NO_FILE_UPLOADED);
      
      fileMgr.checkFileType(fb_file);
      fileMgr.checkFileSize(fb_file);
      fileMgr.pruneFileName(fb_file);

      const asset_id  = newUuid();
      const file_name = asset_id + fileMgr.getFileExt(fb_file.path);
      const readBuffer = await fileMgr.readStreamToBuffer(fb_file.path); // read from disk once

      // upload small (we will use small version first later)
      fileMgr.resizeAndUpload(readBuffer, file_name, 'small'); // do it in background

      // upload medium
      fileMgr.resizeAndUpload(readBuffer, file_name, 'medium'); // do it in background

      // upload large
      const s3dataLarge = await fileMgr.resizeAndUpload(readBuffer, file_name, 'large');
      
      // TODO: delete temp file: fb_file.path

      data = { ...s3dataLarge, asset_id, file_name, file_type: fb_file.type, file_size: fb_file.size };
    } catch (err) {
      error = err.message;
    }

    const t2 = new Date();
    const delta = t2.getTime() - t1.getTime();
    log(rid, '/api/upload request END', delta, 'ms');
    
    // try to send status 200, always! HTTP is merely a way of talking to backend; no need for a RESTful service.
    res.setHeader('x-fb-time-ms', delta);
    res.setHeader('x-req-id', rid);
    res.json({ data, error });
  }

  return handleApiUpload;
}
