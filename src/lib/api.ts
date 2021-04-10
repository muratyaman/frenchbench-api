import * as _ from './constants';
import { IConfig } from './config';
import { ErrForbidden, ErrUnauthorized } from './errors';
import { SecurityService } from './SecurityService';
import { EmailService } from './EmailService';
import { IDb } from './db';
import {
  AdvertService, ArticleService, AssetService, EchoService, HealthService,
  PostService, UserService, VerificationService,
} from './apiExt';

export type IApi = ReturnType<typeof newApi>;

export function newApi(
  config: IConfig,
  securityMgr: SecurityService,
  emailMgr: EmailService,
  db: IDb,
) {

  const echoService   = new EchoService();
  const healthService = new HealthService();

  const assetService   = new AssetService(db);
  const userService    = new UserService(config, db, securityMgr, assetService);
  const advertService  = new AdvertService(db, assetService, userService);
  const postService    = new PostService(db, assetService, userService);
  const articleService = new ArticleService(db, assetService);
  const verifService   = new VerificationService(db, emailMgr);

  const actionsProtected = [
    'signout',
    'me',
    'user_retrieve_self',
    'usercontact_update',
    'usercontact_update_self',
    'usergeo_update',
    'usergeo_update_self',
    'verify_email_start',
    'verify_email_finish',
    'post_create', 'post_update', 'post_delete',
    'advert_create', 'advert_update', 'advert_delete',
    'article_update',
    'asset_create', 'asset_delete',
    'entity_asset_create', 'entity_asset_delete',
  ];
  const actionsForUser = [
    'usergeo_update',
    'usercontact_update',
  ];
  const actionsForSelf = [
    'me',
    'user_retrieve_self',
    'usergeo_update_self',
    'usercontact_update_self',
  ];
  const actionsForOwners = [
    'post_update',
    'post_delete',
    'article_update',
    'article_delete',
    'asset_delete',
    'entity_asset_delete',
    'advert_update',
    'advert_delete',
  ];

  function _isAllowed({ action = '', user = null, id = null, input = {}, rowFound = null, tokenError = null }) {
    let protect = false;
    if (actionsProtected.includes(action)) {
      protect = true;
      if (!user) { // required: user { id }
        if (tokenError) throw new ErrUnauthorized(tokenError);
        throw new ErrUnauthorized(); // early decision
      }
    }
    if (protect && actionsForUser.includes(action)) { // extra check
      if (user.id !== id) throw new ErrForbidden();
    }
    if (protect && actionsForSelf.includes(action)) { // extra check
      if (!user) throw new ErrForbidden();
    }
    if (protect && actionsForOwners.includes(action) && rowFound) { // extra check
      if (user.id !== rowFound.created_by) throw new ErrForbidden();
    }
    return !protect;
  }

  return {
    _isAllowed,

    echo: echoService.echo,
    health: healthService.health,

    ...userService._api(),
    ...verifService._api(),
    ...postService._api(),
    ...advertService._api(),
    ...articleService._api(),
    ...assetService._api(),
  };
}
