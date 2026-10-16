import { Router } from "express"
import {
  getMyApplications,
  submitApplication,
} from "../controllers/applicationController.js"
import { requireAuth } from "../middleware/auth.js"
import { validate } from "../middleware/validate.js"
import { applicationValidation } from "../validators/auth.js"

const router = Router()

router.get("/my", requireAuth, getMyApplications)
router.post("/", requireAuth, applicationValidation, validate, submitApplication)

export default router
