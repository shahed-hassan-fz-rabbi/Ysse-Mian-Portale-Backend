import { Router } from 'express'
import {
  getAllInternships,
  getInternshipById,
} from '../controllers/internshipController.js'

const router = Router()

router.get('/', getAllInternships)
router.get('/:id', getInternshipById)

export default router
