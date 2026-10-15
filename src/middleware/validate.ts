import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'

export function validate(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Validation Error',
      details: errors.array().map((err) => ({
        field: err.type === 'field' ? err.path : 'unknown',
        message: err.msg,
      })),
    })
    return
  }

  next()
}
