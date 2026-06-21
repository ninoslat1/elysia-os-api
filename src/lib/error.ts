export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, "NOT_FOUND");
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, "BAD_REQUEST");
  }
}
