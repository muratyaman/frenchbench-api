import express from 'express';
import jwtMiddleware from 'express-jwt';
import responseTime from 'response-time';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import { v4 as newUuid } from 'uuid';
import { ErrForbidden, ErrUnauthorized } from './errors';

// prepare middleware
export const middleware = ({ config }) => {

  const requestIdAndTs = (req, res, next) => {
    req.id = newUuid();
    req.ts = new Date();
    // console.debug('new request', req.id, req.ts);
    next();
  };

  const loginRequired = (req, res, next) => {
    const { user = null } = req;
    if (!user) throw new ErrUnauthorized();
    next();
  };

  const paramIdIsCurrentUserId = (req, res, next) => {
    // e.g. you can only update your own record
    const { user = {} } = req;
    const { id = null } = req.params; // URL params e.g. '/users/:id'
    if (user && user.id) {
      if (id && user.id === id) {
        // ok
      } else {
        throw new ErrForbidden();
      }
    } else {
      throw new ErrUnauthorized();
    }
  };

  const errHandler = (err, req, res, next) => {
    if (err.statusCode) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: err });//err.message });
  };

  const timeTaken       = responseTime();
  const jsonBody        = express.json();
  const cookies         = cookieParser();
  const forms           = express.urlencoded({ extended: true });
  const accessLogs      = morgan('combined');
  const securityHeaders = helmet();
  const jwtToken        = jwtMiddleware(config.jwt);

  return {
    requestIdAndTs,
    timeTaken,
    loginRequired,
    paramIdIsCurrentUserId,
    jsonBody,
    cookies,
    forms,
    accessLogs,
    securityHeaders,
    jwtToken,
    errHandler, // use as last middleware
  }
}