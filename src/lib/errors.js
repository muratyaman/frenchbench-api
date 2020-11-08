export class ErrBadRequest extends Error {
  constructor(message = 'Bad Request') {
    super(message);
    this.name = this.constructor.name;
    //this.statusCode = 400;
  }
}

export class ErrUnauthorized extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = this.constructor.name;
    //this.statusCode = 401;
  }
}

export class ErrForbidden extends Error {
  constructor(message = 'Forbidden') {
    super(message);
    this.name = this.constructor.name;
    //this.statusCode = 403;
  }
}

export class ErrNotFound extends Error {
  constructor(message = 'Not Found') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = 404;
  }
}
