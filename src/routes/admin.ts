import { Router } from "express"
import {
  getDashboard,
  getUsers,
  updateUserRole,
} from "../controllers/adminController.js"
import {
  getSiteSettings,
  updateSiteSettings,
} from "../controllers/siteSettingsController.js"
import {
  adminGetTeamMembers,
  adminCreateTeamMember,
  adminUpdateTeamMember,
  adminDeleteTeamMember,
} from "../controllers/teamMembersController.js"
import {
  adminGetApplicationsDetailed,
  adminGetApplicationById,
  adminUpdateApplicationStatusDetailed,
  adminGetAuditLogs,
} from "../controllers/applicationReviewController.js"
import {
  adminGetContactMessages,
  adminUpdateContactMessage,
} from "../controllers/contactController.js"
import { requireAuth, requireAdmin } from "../middleware/auth.js"
import { validate } from "../middleware/validate.js"
import { rateLimit } from "../middleware/rateLimit.js"
import {
  uuidParam,
  roleUpdateValidation,
  statusUpdateValidation,
  siteSettingsValidation,
  teamMemberValidation,
  contactStatusValidation,
} from "../validators/admin.js"

const router = Router()

// Every route below requires a valid Supabase access token AND admin role
router.use(requireAuth, requireAdmin)

const adminWriteLimiter = rateLimit({ windowMs: 60_000, max: 60 })

// Dashboard
router.get("/dashboard", getDashboard)

// Users
router.get("/users", getUsers)
router.patch("/users/:id/role", adminWriteLimiter, roleUpdateValidation, validate, updateUserRole)

// Site Settings
router.get("/settings", getSiteSettings)
router.put("/settings", adminWriteLimiter, siteSettingsValidation, validate, updateSiteSettings)

// Team Members
router.get("/team-members", adminGetTeamMembers)
router.post("/team-members", adminWriteLimiter, teamMemberValidation, validate, adminCreateTeamMember)
router.put("/team-members/:id", adminWriteLimiter, uuidParam, teamMemberValidation, validate, adminUpdateTeamMember)
router.delete("/team-members/:id", adminWriteLimiter, uuidParam, validate, adminDeleteTeamMember)

// Applications (search, filter, pagination, status history)
router.get("/applications", adminGetApplicationsDetailed)
router.get("/applications/:id", uuidParam, validate, adminGetApplicationById)
router.patch("/applications/:id/status", adminWriteLimiter, statusUpdateValidation, validate, adminUpdateApplicationStatusDetailed)

// Audit Logs
router.get("/audit-logs", adminGetAuditLogs)

// Contact Messages
router.get("/contact-messages", adminGetContactMessages)
router.patch(
  "/contact-messages/:id",
  adminWriteLimiter,
  uuidParam,
  contactStatusValidation,
  validate,
  adminUpdateContactMessage,
)

export default router
