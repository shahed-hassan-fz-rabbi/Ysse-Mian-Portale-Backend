import { Router } from "express"
import { submitContactMessage } from "../controllers/contactController.js"
import { rateLimit } from "../middleware/rateLimit.js"
import { validate } from "../middleware/validate.js"
import { contactValidation } from "../validators/auth.js"

const router = Router()

const contactLimiter = rateLimit({
  windowMs: 15 * 60_000,
  max: 10,
  message: "Too many messages. Please try again later.",
})

// Public: everyone can send a message; strict rate limit + validation
router.post("/", contactLimiter, contactValidation, validate, submitContactMessage)

export default router
