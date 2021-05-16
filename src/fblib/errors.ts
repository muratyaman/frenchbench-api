export class ErrBadRequest extends Error {
  // statusCode = 400;
  constructor(message = 'bad_request') {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ErrUnauthorized extends Error {
  // statusCode = 401;
  constructor(message = 'unauthorized') {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ErrForbidden extends Error {
  // statusCode = 403;
  constructor(message = 'forbidden') {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ErrNotFound extends Error {
  statusCode = 404;
  constructor(message = 'not_found') {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ErrUnknownAction extends Error {
  statusCode = 404;
  constructor(message = 'unknown_action') {
    super(message);
    this.name = this.constructor.name;
  }
}
