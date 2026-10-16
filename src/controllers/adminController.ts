import { Request, Response } from "express"
import supabase from "../config/supabase.js"
import { logAdminAction } from "../middleware/auditLogger.js"

function sanitizeSearch(value: unknown): string {
  return String(value || "")
    .replace(/[,()]/g, " ")
    .trim()
    .slice(0, 100)
}

export async function getDashboard(_req: Request, res: Response) {
  try {
    const [
      totalUsers,
      totalDepartments,
      totalTeamMembers,
      publishedCourses,
      publishedAnnouncements,
      openInternships,
      totalApplications,
      awaitingReview,
      recentApps,
      recentActivity,
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("departments").select("*", { count: "exact", head: true }),
      supabase.from("team_members").select("*", { count: "exact", head: true }),
      supabase.from("courses").select("*", { count: "exact", head: true }).eq("is_published", true),
      supabase.from("announcements").select("*", { count: "exact", head: true }).eq("is_published", true),
      supabase.from("internship_opportunities").select("*", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("internship_applications").select("*", { count: "exact", head: true }),
      supabase
        .from("internship_applications")
        .select("*", { count: "exact", head: true })
        .in("status", ["submitted", "under_review"]),
      supabase
        .from("internship_applications")
        .select("id, status, created_at, internship_opportunities(title), profiles(full_name)")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("admin_audit_logs")
        .select("id, action, entity_type, created_at, profiles(full_name)")
        .order("created_at", { ascending: false })
        .limit(5),
    ])

    res.json({
      counts: {
        totalUsers: totalUsers.count || 0,
        totalDepartments: totalDepartments.count || 0,
        totalTeamMembers: totalTeamMembers.count || 0,
        publishedCourses: publishedCourses.count || 0,
        publishedAnnouncements: publishedAnnouncements.count || 0,
        openInternships: openInternships.count || 0,
        totalApplications: totalApplications.count || 0,
        awaitingReview: awaitingReview.count || 0,
      },
      recentApplications: recentApps.data || [],
      recentActivity: recentActivity.data || [],
    })
  } catch (err) {
    console.error("[Dashboard] Failed to load:", err)
    res.status(500).json({ error: "Failed to load dashboard data" })
  }
}

export async function getUsers(req: Request, res: Response) {
  const page = Math.max(1, parseInt(req.query.page as string) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20))
  const offset = (page - 1) * limit
  const search = sanitizeSearch(req.query.search)

  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`)
  }

  const { data, error, count } = await query

  if (error) {
    return res.status(400).json({ error: "Failed to fetch users", message: error.message })
  }

  res.json({ users: data, total: count || 0, page, limit })
}

export async function updateUserRole(req: Request, res: Response) {
  const { id } = req.params
  const { role } = req.body
  const adminId = (req as any).user.id

  if (id === adminId) {
    return res.status(400).json({ error: "You cannot change your own role" })
  }

  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" })
  }

  // Prevent removing the last remaining admin
  if (role === "user") {
    const { count: adminCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin")

    const { data: target } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", id)
      .single()

    if (target?.role === "admin" && (adminCount || 0) <= 1) {
      return res.status(400).json({ error: "Cannot demote the last remaining admin" })
    }
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return res.status(400).json({ error: "Failed to update role", message: error.message })
  }

  await logAdminAction(
    {
      adminId,
      action: "update_role",
      entityType: "profile",
      entityId: id,
      details: { new_role: role },
    },
    req.ip,
  )

  res.json({ message: "Role updated", user: data })
}
