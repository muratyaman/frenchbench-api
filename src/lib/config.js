import { FB_SECRET_COOKIE } from './constants';

export function newConfig(penv) {
  let { NODE_ENV, JWT_SECRET = null, AWS_S3_CLIENT_ID = null, AWS_S3_CLIENT_SECRET = null, ...otherSettings } = penv;
  
  if (!JWT_SECRET) throw new Error('JWT_SECRET undefined');
  if (!AWS_S3_CLIENT_ID) throw new Error('AWS_S3_CLIENT_ID undefined');
  if (!AWS_S3_CLIENT_SECRET) throw new Error('AWS_S3_CLIENT_SECRET undefined');

  const IS_PRODUCTION_MODE = NODE_ENV === 'production';

  return {
    ...penv,
    NODE_ENV,
    IS_PRODUCTION_MODE,

    version: 'v1.0.0',

    http: {
      port: penv.HTTP_PORT || 12000,
    },

    ws: {
      port: penv.WS_PORT || 13000,
    },

    jwt: {
      secret: penv.JWT_SECRET,
      credentialsRequired: false,
      algorithms: [ 'HS256' ],
    },

    cookies: {
      secretKeyName: FB_SECRET_COOKIE,
      sameSite: 'lax',
      secure: IS_PRODUCTION_MODE,
      maxAge: 72576000,
      httpOnly: true,
      path: '/',
    },

    log: {
      format: penv.LOG_FORMAT || '',
      file: penv.LOG_FILE || 'access.log',
      consoleOn: penv.NODE_ENV !== 'test',
    },

    s3: {
      accessKeyId:     AWS_S3_CLIENT_ID,
      secretAccessKey: AWS_S3_CLIENT_SECRET,
      Bucket:          penv.AWS_S3_BUCKET || 'frenchbench',
      Region:          penv.AWS_S3_REGION || 'eu-west-2',
      folders:         ['uploads', 'images'], // ==> '/uploads/images/[large|medium|small]/uuid.[jpg|jpeg|png]'
      ACL:             'public-read',
    },

    geo: {
      latDelta: Number.parseFloat(penv.GEO_LAT_DELTA || '0.01'),
      lonDelta: Number.parseFloat(penv.GEO_LON_DELTA || '0.01'),
    },
  };
}
