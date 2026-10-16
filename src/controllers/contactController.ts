import { Request, Response } from "express"
import supabase from "../config/supabase.js"
import { logAdminAction } from "../middleware/auditLogger.js"

const VALID_MESSAGE_STATUSES: string[] = ["new", "read", "archived"]

/** PostgREST reports a missing table as a schema-cache error rather than 42P01. */
function isTableMissing(error: { code?: string; message?: string } | null): boolean {
  return (
    !!error &&
    (error.code === "42P01" ||
      error.code === "PGRST205" ||
      (error.message || "").includes("schema cache"))
  )
}

// Public: receive a contact message from the site contact form
export async function submitContactMessage(req: Request, res: Response) {
  const { name, email, subject, message } = req.body

  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    subject,
    message,
    ip_address: req.ip || null,
  })

  if (error) {
    if (isTableMissing(error)) {
      // Missing migration — say exactly what is needed instead of a vague 500
      return res.status(503).json({
        error: "Contact storage is not configured yet",
        message: "Run backend/migrations/004_contact_messages.sql in the Supabase SQL Editor, then try again.",
      })
    }
    return res.status(500).json({ error: "Failed to send message", message: error.message })
  }

  res.status(201).json({ message: "Message sent successfully" })
}

// Admin: paged list with status filter
export async function adminGetContactMessages(req: Request, res: Response) {
  const { status, page = "1", limit = "20" } = req.query
  const pageNum = Math.max(1, parseInt(page as string) || 1)
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20))
  const offset = (pageNum - 1) * limitNum

  let query = supabase
    .from("contact_messages")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limitNum - 1)

  if (status && status !== "all") {
    if (!VALID_MESSAGE_STATUSES.includes(status as string)) {
      return res.status(400).json({ error: "Invalid status filter" })
    }
    query = query.eq("status", status)
  }

  const { data, error, count } = await query

  if (error) {
    if (isTableMissing(error)) {
      return res.status(503).json({
        error: "Not configured",
        message: "Run backend/migrations/004_contact_messages.sql first.",
      })
    }
    return res.status(400).json({ error: "Failed to fetch messages", message: error.message })
  }

  res.json({ messages: data || [], total: count || 0, page: pageNum, limit: limitNum })
}

// Admin: update message status (new → read/archived), audit-logged
export async function adminUpdateContactMessage(req: Request, res: Response) {
  const { status } = req.body
  const adminId = (req as any).user.id

  const { data, error } = await supabase
    .from("contact_messages")
    .update({ status })
    .eq("id", req.params.id)
    .select()
    .single()

  if (error) {
    return res.status(400).json({ error: "Failed to update message", message: error.message })
  }

  await logAdminAction(
    {
      adminId,
      action: "update",
      entityType: "contact_message",
      entityId: req.params.id,
      details: { new_status: status },
    },
    req.ip,
  )

  res.json({ message: "Message updated", messageData: data })
}
