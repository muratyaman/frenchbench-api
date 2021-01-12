export class ErrBadRequest extends Error {
  constructor(message = 'bad_request') {
    super(message);
    this.name = this.constructor.name;
    //this.statusCode = 400;
  }
}

export class ErrUnauthorized extends Error {
  constructor(message = 'unauthorized') {
    super(message);
    this.name = this.constructor.name;
    //this.statusCode = 401;
  }
}

export class ErrForbidden extends Error {
  constructor(message = 'forbidden') {
    super(message);
    this.name = this.constructor.name;
    //this.statusCode = 403;
  }
}

export class ErrNotFound extends Error {
  constructor(message = 'not_found') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = 404;
  }
}

export class ErrUnknownAction extends Error {
  constructor(message = 'unknown_action') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = 404;
  }
}
