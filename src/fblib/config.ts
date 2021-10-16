import { FB_SECRET_COOKIE } from './constants';

export function newConfig(penv: IProcessEnv): IConfig {
  const { NODE_ENV, JWT_SECRET, AWS_S3_CLIENT_ID, AWS_S3_CLIENT_SECRET } = penv;

  if (!JWT_SECRET) throw new Error('JWT_SECRET undefined');
  if (!AWS_S3_CLIENT_ID) throw new Error('AWS_S3_CLIENT_ID undefined');
  if (!AWS_S3_CLIENT_SECRET) throw new Error('AWS_S3_CLIENT_SECRET undefined');

  const IS_PRODUCTION_MODE = NODE_ENV === 'production';

  return {
    IS_PRODUCTION_MODE,

    version: 'v1.0.0',

    http: {
      port: Number.parseInt(penv.HTTP_PORT ?? '12000'),
    },

    ws: {
      port: Number.parseInt(penv.WS_PORT ?? '13000'),
    },

    jwt: {
      secret: penv.JWT_SECRET ?? '',
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
      format: penv?.LOG_FORMAT ?? '',
      file: penv?.LOG_FILE ?? 'access.log',
      consoleOn: penv?.NODE_ENV !== 'test',
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

    smtp: {
      transportOptions: {
        host: penv.SMTP_HOST,
        port: Number.parseInt(penv.SMTP_PORT || '587'),
        secure: 0 != Number.parseInt(penv.SMTP_USE_TLS || '0'),
        auth: {
          user: penv.SMTP_USER,
          pass: penv.SMTP_PASSWORD,
        },
      },
      emailFrom: penv.SMTP_EMAIL_FROM,
    },
  };
}

export interface IProcessEnv extends NodeJS.ProcessEnv {
  NODE_ENV?: string;

  LOG_FORMAT?: string;
  LOG_FILE?: string;

  HTTP_PORT?: string;

  // WebSockets
  WS_PORT?: string;

  // Database settings
  DB_CLIENT?: string;

  PGHOST?: string;
  PGUSER?: string;
  PGDATABASE?: string;
  PGPASSWORD?: string;
  PGPORT?: string;

  JWT_SECRET?: string;

  GEO_LAT_DELTA?: string;
  GEO_LON_DELTA?: string;

  AWS_S3_CLIENT_ID?: string;
  AWS_S3_CLIENT_SECRET?: string;
  AWS_S3_BUCKET?: string;
  AWS_S3_REGION?: string;

  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USE_TLS?: string;
  SMTP_USER?: string;
  SMTP_PASSWORD?: string;
  SMTP_EMAIL_FROM?: string;
}

export interface IConfig {
  IS_PRODUCTION_MODE: boolean;

  version: string;

  http: {
    port: number;
  };

  ws: {
    port: number;
  };

  jwt: {
    secret: string;
    credentialsRequired: boolean;
    algorithms: string[];
  };

  cookies: {
    secretKeyName: string;
    sameSite: string;
    secure: boolean;
    maxAge: number;
    httpOnly: boolean;
    path: string;
  };

  log: {
    format: string;
    file: string;
    consoleOn: boolean;
  };

  s3: {
    accessKeyId: string;
    secretAccessKey: string;
    Bucket: string;
    Region: string;
    folders: string[],
    ACL: string;
  };

  geo: {
    latDelta: number;
    lonDelta: number;
  };

  smtp: {
    transportOptions: {
      host: string;
      port: number;
      secure: boolean;
      auth: {
        user: string;
        pass: string;
      };
    };
    emailFrom: string;
  };
}
