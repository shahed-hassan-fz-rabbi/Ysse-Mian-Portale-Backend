import { Router } from 'express'
import {
  getAllDepartments,
  getDepartmentById,
} from '../controllers/departmentController.js'

const router = Router()

router.get('/', getAllDepartments)
router.get('/:id', getDepartmentById)

export default router
