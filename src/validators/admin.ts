import { body, param } from "express-validator"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const URL_CHECK = { protocols: ["http", "https"], require_toplevel: true }

export const uuidParam = [param("id").matches(UUID).withMessage("Valid ID is required")]

// Departments
export const departmentValidation = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 150 }),
  body("slug").trim().matches(SLUG).withMessage("Slug must be lowercase letters, numbers and hyphens").isLength({ max: 150 }),
  body("description").trim().notEmpty().withMessage("Description is required").isLength({ max: 5000 }),
  body("department_head").optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 150 }),
  body("goals").optional({ nullable: true }).isArray().withMessage("Goals must be a list"),
  body("responsibilities").optional({ nullable: true }).isArray().withMessage("Responsibilities must be a list"),
  body("is_published").optional().isBoolean().withMessage("is_published must be a boolean"),
]

// Courses
export const courseValidation = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 200 }),
  body("description").trim().notEmpty().withMessage("Description is required").isLength({ max: 5000 }),
  body("category").trim().notEmpty().withMessage("Category is required").isLength({ max: 100 }),
  body("recording_url").optional({ nullable: true, checkFalsy: true }).isURL(URL_CHECK).withMessage("Recording URL must be a valid URL"),
  body("resource_url").optional({ nullable: true, checkFalsy: true }).isURL(URL_CHECK).withMessage("Resource URL must be a valid URL"),
  body("thumbnail_url").optional({ nullable: true, checkFalsy: true }).isURL(URL_CHECK).withMessage("Thumbnail URL must be a valid URL"),
  body("is_published").optional().isBoolean().withMessage("is_published must be a boolean"),
]

// Announcements
export const announcementValidation = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 200 }),
  body("slug").optional({ nullable: true, checkFalsy: true }).trim().matches(SLUG).withMessage("Slug must be lowercase letters, numbers and hyphens").isLength({ max: 200 }),
  body("body").trim().notEmpty().withMessage("Content is required").isLength({ max: 20000 }),
  body("is_published").optional().isBoolean().withMessage("is_published must be a boolean"),
]

// Internship opportunities
export const internshipValidation = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 200 }),
  body("description").trim().notEmpty().withMessage("Description is required").isLength({ max: 10000 }),
  body("requirements").trim().notEmpty().withMessage("Requirements are required").isLength({ max: 10000 }),
  body("application_deadline").optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage("Deadline must be a valid date"),
  body("status").optional().isIn(["draft", "published", "closed"]).withMessage("Status must be draft, published or closed"),
]

// Team members
export const teamMemberValidation = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 150 }),
  body("designation").trim().notEmpty().withMessage("Designation is required").isLength({ max: 150}),
  body("department_id").optional({ nullable: true, checkFalsy: true }).matches(UUID).withMessage("department_id must be a valid ID"),
  body("bio").optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 3000 }),
  body("photo_url").optional({ nullable: true, checkFalsy: true }).isURL(URL_CHECK).withMessage("Photo URL must be a valid URL"),
  body("display_order").optional().isInt({ min: 0, max: 10000 }).withMessage("display_order must be a number"),
  body("is_published").optional().isBoolean().withMessage("is_published must be a boolean"),
]

// Site settings
export const siteSettingsValidation = [
  body("hero_heading").optional({ nullable: true }).trim().isLength({ max: 300 }).withMessage("Hero heading too long"),
  body("hero_description").optional({ nullable: true }).trim().isLength({ max: 2000 }),
  body("hero_image_url").optional({ nullable: true, checkFalsy: true }).isURL(URL_CHECK),
  body("featured_heading").optional({ nullable: true }).trim().isLength({ max: 300 }),
  body("featured_description").optional({ nullable: true }).trim().isLength({ max: 2000 }),
  body("featured_image_url").optional({ nullable: true, checkFalsy: true }).isURL(URL_CHECK),
  body("about_heading").optional({ nullable: true }).trim().isLength({ max: 300 }),
  body("about_description").optional({ nullable: true }).trim().isLength({ max: 5000 }),
  body("about_image_url").optional({ nullable: true, checkFalsy: true }).isURL(URL_CHECK),
  body("contact_email").optional({ nullable: true, checkFalsy: true }).isEmail().withMessage("Invalid contact email"),
  body("contact_phone").optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 50 }),
  body("contact_address").optional({ nullable: true }).trim().isLength({ max: 500 }),
  body("facebook_url").optional({ nullable: true, checkFalsy: true }).isURL(URL_CHECK),
  body("twitter_url").optional({ nullable: true, checkFalsy: true }).isURL(URL_CHECK),
  body("linkedin_url").optional({ nullable: true, checkFalsy: true }).isURL(URL_CHECK),
  body("instagram_url").optional({ nullable: true, checkFalsy: true }).isURL(URL_CHECK),
  body("footer_text").optional({ nullable: true }).trim().isLength({ max: 1000 }),
]

// User role change
export const roleUpdateValidation = [
  param("id").matches(UUID).withMessage("Valid user ID is required"),
  body("role").isIn(["user", "admin"]).withMessage("Role must be user or admin"),
]

// Application status change
export const statusUpdateValidation = [
  param("id").matches(UUID).withMessage("Valid application ID is required"),
  body("status")
    .isIn(["submitted", "under_review", "shortlisted", "interview", "selected", "rejected"])
    .withMessage("Invalid status value"),
  body("note").optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 2000 }).withMessage("Note too long"),
]
