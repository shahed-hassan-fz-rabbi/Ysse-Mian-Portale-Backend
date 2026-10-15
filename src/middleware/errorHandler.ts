import { Request, Response, NextFunction } from 'express'

interface HttpError extends Error {
  statusCode?: number
}

export function errorHandler(
  err: HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error('Error:', err.message)

  const statusCode = err.statusCode || 500
  const message =
    process.env.NODE_ENV === 'production'
      ? 'An internal server error occurred.'
      : err.message

  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal Server Error' : 'Error',
    message,
  })
}
