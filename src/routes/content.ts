import { Router } from "express"
import {
  getDepartments,
  getDepartmentById,
  getCourses,
  getCourseById,
  getAnnouncements,
  getInternships,
  getInternshipById,
  adminGetDepartments,
  adminCreateDepartment,
  adminUpdateDepartment,
  adminDeleteDepartment,
  adminGetCourses,
  adminCreateCourse,
  adminUpdateCourse,
  adminDeleteCourse,
  adminGetAnnouncements,
  adminCreateAnnouncement,
  adminUpdateAnnouncement,
  adminDeleteAnnouncement,
  adminGetInternships,
  adminCreateInternship,
  adminUpdateInternship,
  adminDeleteInternship,
} from "../controllers/contentController.js"
import { getTeamMembers } from "../controllers/teamMembersController.js"
import { getSiteSettings } from "../controllers/siteSettingsController.js"
import { requireAuth, requireAdmin } from "../middleware/auth.js"
import { validate } from "../middleware/validate.js"
import { rateLimit } from "../middleware/rateLimit.js"
import {
  uuidParam,
  departmentValidation,
  courseValidation,
  announcementValidation,
  internshipValidation,
} from "../validators/admin.js"

const router = Router()

// Public routes (published content only)
router.get("/departments", getDepartments)
router.get("/departments/:id", getDepartmentById)
router.get("/courses", getCourses)
router.get("/courses/:id", getCourseById)
router.get("/announcements", getAnnouncements)
router.get("/internships", getInternships)
router.get("/internships/:id", getInternshipById)
router.get("/team-members", getTeamMembers)
router.get("/settings", getSiteSettings)

// Admin routes — server-side authorization + validation on every mutation
const adminWriteLimiter = rateLimit({ windowMs: 60_000, max: 60 })

router.get("/admin/departments", requireAuth, requireAdmin, adminGetDepartments)
router.post("/admin/departments", requireAuth, requireAdmin, adminWriteLimiter, departmentValidation, validate, adminCreateDepartment)
router.put("/admin/departments/:id", requireAuth, requireAdmin, adminWriteLimiter, uuidParam, departmentValidation, validate, adminUpdateDepartment)
router.delete("/admin/departments/:id", requireAuth, requireAdmin, adminWriteLimiter, uuidParam, validate, adminDeleteDepartment)

router.get("/admin/courses", requireAuth, requireAdmin, adminGetCourses)
router.post("/admin/courses", requireAuth, requireAdmin, adminWriteLimiter, courseValidation, validate, adminCreateCourse)
router.put("/admin/courses/:id", requireAuth, requireAdmin, adminWriteLimiter, uuidParam, courseValidation, validate, adminUpdateCourse)
router.delete("/admin/courses/:id", requireAuth, requireAdmin, adminWriteLimiter, uuidParam, validate, adminDeleteCourse)

router.get("/admin/announcements", requireAuth, requireAdmin, adminGetAnnouncements)
router.post("/admin/announcements", requireAuth, requireAdmin, adminWriteLimiter, announcementValidation, validate, adminCreateAnnouncement)
router.put("/admin/announcements/:id", requireAuth, requireAdmin, adminWriteLimiter, uuidParam, announcementValidation, validate, adminUpdateAnnouncement)
router.delete("/admin/announcements/:id", requireAuth, requireAdmin, adminWriteLimiter, uuidParam, validate, adminDeleteAnnouncement)

router.get("/admin/internships", requireAuth, requireAdmin, adminGetInternships)
router.post("/admin/internships", requireAuth, requireAdmin, adminWriteLimiter, internshipValidation, validate, adminCreateInternship)
router.put("/admin/internships/:id", requireAuth, requireAdmin, adminWriteLimiter, uuidParam, internshipValidation, validate, adminUpdateInternship)
router.delete("/admin/internships/:id", requireAuth, requireAdmin, adminWriteLimiter, uuidParam, validate, adminDeleteInternship)

export default router
