import { Router } from "express"
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js"
import { requireAuth } from "../middleware/auth.js"
import { validate } from "../middleware/validate.js"
import { rateLimit } from "../middleware/rateLimit.js"
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateProfileValidation,
} from "../validators/auth.js"

const router = Router()

// Rate limits for sensitive endpoints (per IP)
const authLimiter = rateLimit({ windowMs: 15 * 60_000, max: 30, message: "Too many attempts, please try again later." })
const strictLimiter = rateLimit({ windowMs: 15 * 60_000, max: 10, message: "Too many attempts, please try again later." })

router.post("/register", strictLimiter, registerValidation, validate, register)
router.post("/login", authLimiter, loginValidation, validate, login)
router.post("/logout", requireAuth, logout)
router.get("/me", requireAuth, getMe)
router.patch("/profile", requireAuth, updateProfileValidation, validate, updateProfile)
router.post("/forgot-password", strictLimiter, forgotPasswordValidation, validate, forgotPassword)
router.post("/reset-password", strictLimiter, resetPasswordValidation, validate, resetPassword)

export default router
