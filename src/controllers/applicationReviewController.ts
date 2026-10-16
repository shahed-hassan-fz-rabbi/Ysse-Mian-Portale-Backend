import { Request, Response } from "express"
import supabase from "../config/supabase.js"
import { logAdminAction } from "../middleware/auditLogger.js"

const VALID_STATUSES: string[] = ["submitted", "under_review", "shortlisted", "interview", "selected", "rejected"]

/** Allowed status transitions (terminal states cannot be left). */
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  submitted: ["submitted", "under_review", "shortlisted", "rejected"],
  under_review: ["under_review", "shortlisted", "interview", "rejected"],
  shortlisted: ["shortlisted", "interview", "rejected"],
  interview: ["interview", "selected", "rejected"],
  selected: ["selected"],
  rejected: ["rejected"],
}

function sanitizeSearch(value: unknown): string {
  return String(value || "")
    .replace(/[,()]/g, " ")
    .trim()
    .slice(0, 100)
}

// Admin: Get applications with filters, search, and pagination
export async function adminGetApplicationsDetailed(req: Request, res: Response) {
  const { status, opportunity_id, search, page = "1", limit = "20" } = req.query
  const pageNum = Math.max(1, parseInt(page as string) || 1)
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20))
  const offset = (pageNum - 1) * limitNum

  let query = supabase
    .from("internship_applications")
    .select("*, internship_opportunities(title), profiles(full_name, email)", { count: "exact" })
    .order("created_at", { ascending: false })

  if (status && status !== "all") {
    if (!VALID_STATUSES.includes(status as string)) {
      return res.status(400).json({ error: "Invalid status filter" })
    }
    query = query.eq("status", status)
  }

  if (opportunity_id && opportunity_id !== "all") {
    query = query.eq("opportunity_id", opportunity_id)
  }

  const term = sanitizeSearch(search)
  if (term) {
    query = query.or(`cover_letter.ilike.%${term}%,skills.ilike.%${term}%`)
  }

  const { data, error, count } = await query.range(offset, offset + limitNum - 1)

  if (error) {
    return res.status(400).json({ error: "Failed to fetch applications", message: error.message })
  }

  res.json({ applications: data, total: count || 0, page: pageNum, limit: limitNum })
}

// Admin: Get single application with reviews and history
export async function adminGetApplicationById(req: Request, res: Response) {
  const { data: application, error } = await supabase
    .from("internship_applications")
    .select("*, internship_opportunities(title, description), profiles(full_name, email, phone)")
    .eq("id", req.params.id)
    .single()

  if (error || !application) {
    return res.status(404).json({ error: "Application not found" })
  }

  const { data: reviews } = await supabase
    .from("application_reviews")
    .select("*, profiles(full_name)")
    .eq("application_id", req.params.id)
    .order("created_at", { ascending: false })

  const { data: history } = await supabase
    .from("application_status_history")
    .select("*, profiles(full_name)")
    .eq("application_id", req.params.id)
    .order("created_at", { ascending: false })

  res.json({ ...application, reviews: reviews || [], history: history || [] })
}

// Admin: Update application status with history tracking
export async function adminUpdateApplicationStatusDetailed(req: Request, res: Response) {
  const { status, note } = req.body
  const adminId = (req as any).user.id

  // Get current application
  const { data: current, error: fetchError } = await supabase
    .from("internship_applications")
    .select("*")
    .eq("id", req.params.id)
    .single()

  if (fetchError || !current) {
    return res.status(404).json({ error: "Application not found" })
  }

  // Validate status value and transition
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: "Invalid status" })
  }

  const allowed = ALLOWED_TRANSITIONS[current.status] || []
  if (!allowed.includes(status)) {
    return res.status(400).json({
      error: "Invalid status transition",
      message: `Cannot move an application from "${current.status}" to "${status}"`,
    })
  }

  // Update application
  const { data, error } = await supabase
    .from("internship_applications")
    .update({
      status,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", req.params.id)
    .select()
    .single()

  if (error) {
    return res.status(400).json({ error: "Failed to update application", message: error.message })
  }

  // Record status history
  await supabase.from("application_status_history").insert({
    application_id: req.params.id,
    old_status: current.status,
    new_status: status,
    changed_by: adminId,
    note: note || null,
  })

  // Add review note if provided
  if (note) {
    await supabase.from("application_reviews").insert({
      application_id: req.params.id,
      reviewer_id: adminId,
      note,
    })
  }

  await logAdminAction(
    {
      adminId,
      action: "change_status",
      entityType: "internship_application",
      entityId: req.params.id,
      details: { from: current.status, to: status },
    },
    req.ip,
  )

  res.json({ message: "Application updated", application: data })
}

// Admin: Get audit logs
export async function adminGetAuditLogs(req: Request, res: Response) {
  const { page = "1", limit = "50" } = req.query
  const pageNum = parseInt(page as string) || 1
  const limitNum = parseInt(limit as string) || 50
  const offset = (pageNum - 1) * limitNum

  const { data, error, count } = await supabase
    .from("admin_audit_logs")
    .select("*, profiles(full_name)")
    .order("created_at", { ascending: false })
    .range(offset, offset + limitNum - 1)

  if (error) {
    return res.status(400).json({ error: "Failed to fetch audit logs", message: error.message })
  }

  res.json({ logs: data, total: count, page: pageNum, limit: limitNum })
}
