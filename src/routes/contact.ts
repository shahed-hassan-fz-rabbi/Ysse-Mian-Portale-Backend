import { Router } from 'express'
import { body } from 'express-validator'
import { submitContactForm } from '../controllers/contactController.js'
import { validate } from '../middleware/validate.js'

const router = Router()

const contactValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('message').notEmpty().withMessage('Message is required'),
]

router.post('/', contactValidation, validate, submitContactForm)

export default router
