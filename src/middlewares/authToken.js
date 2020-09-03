export function authToken({ logger }) {
  return (req, res, next) => {
    logger.info('authToken', req.headers.authorization || '');
    next();
  }
}
