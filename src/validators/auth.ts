import { body } from "express-validator"

export const registerValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number"),
  body("full_name")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ max: 100 })
    .withMessage("Full name must be less than 100 characters"),
  body("phone")
    .optional()
    .trim()
    .matches(/^[\d\s\-+()]{7,20}$/)
    .withMessage("Invalid phone number format"),
]

export const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
]

export const forgotPasswordValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
]

export const resetPasswordValidation = [
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number"),
]

export const updateProfileValidation = [
  body("full_name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Full name cannot be empty")
    .isLength({ max: 100 })
    .withMessage("Full name must be less than 100 characters"),
  body("phone")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .matches(/^[\d\s\-+()]{7,20}$/)
    .withMessage("Invalid phone number format"),
]

export const applicationValidation = [
  body("opportunity_id").isUUID().withMessage("Valid opportunity ID is required"),
  body("cover_letter")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 5000 })
    .withMessage("Cover letter must be less than 5000 characters"),
  body("skills")
    .trim()
    .notEmpty()
    .withMessage("Skills are required")
    .isLength({ max: 3000 })
    .withMessage("Skills must be less than 3000 characters"),
]

export const updateApplicationStatusValidation = [
  body("status")
    .isIn(["submitted", "under_review", "shortlisted", "interview", "selected", "rejected"])
    .withMessage("Invalid status value"),
]
