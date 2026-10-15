import { Router } from 'express'
import { body } from 'express-validator'
import {
  submitApplication,
  getApplicationStatus,
} from '../controllers/applicationController.js'
import { validate } from '../middleware/validate.js'

const router = Router()

const applicationValidation = [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('university').notEmpty().withMessage('University is required'),
  body('fieldOfStudy').notEmpty().withMessage('Field of study is required'),
  body('preferredRole').notEmpty().withMessage('Preferred role is required'),
  body('skills').notEmpty().withMessage('Skills are required'),
  body('motivation')
    .isLength({ min: 50 })
    .withMessage('Motivation must be at least 50 characters'),
]

router.post('/', applicationValidation, validate, submitApplication)
router.get('/:id/status', getApplicationStatus)

export default router
