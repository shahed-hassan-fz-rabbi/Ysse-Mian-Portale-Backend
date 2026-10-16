import { Request, Response } from "express"
import supabase from "../config/supabase.js"
import { logAdminAction } from "../middleware/auditLogger.js"

// Public: Get published team members
export async function getTeamMembers(_req: Request, res: Response) {
  const { data, error } = await supabase
    .from("team_members")
    .select("*, departments(name)")
    .eq("is_published", true)
    .order("display_order", { ascending: true })

  if (error) {
    return res.status(400).json({ error: "Failed to fetch team members" })
  }

  res.json(data)
}

// Admin: Get all team members
export async function adminGetTeamMembers(_req: Request, res: Response) {
  const { data, error } = await supabase
    .from("team_members")
    .select("*, departments(name)")
    .order("display_order", { ascending: true })

  if (error) {
    return res.status(400).json({ error: "Failed to fetch team members" })
  }

  res.json(data)
}

// Admin: Create team member
export async function adminCreateTeamMember(req: Request, res: Response) {
  const { department_id, name, designation, bio, photo_url, display_order, is_published } = req.body

  const { data, error } = await supabase
    .from("team_members")
    .insert({
      department_id: department_id || null,
      name,
      designation,
      bio: bio || null,
      photo_url: photo_url || null,
      display_order: display_order || 0,
      is_published: is_published || false,
    })
    .select()
    .single()

  if (error) {
    return res.status(400).json({ error: "Failed to create team member", message: error.message })
  }

  await logAdminAction(
    { adminId: (req as any).user.id, action: "create", entityType: "team_member", entityId: data.id },
    req.ip,
  )

  res.status(201).json(data)
}

// Admin: Update team member
export async function adminUpdateTeamMember(req: Request, res: Response) {
  const { department_id, name, designation, bio, photo_url, display_order, is_published } = req.body

  const { data, error } = await supabase
    .from("team_members")
    .update({
      department_id: department_id || null,
      name,
      designation,
      bio: bio || null,
      photo_url: photo_url || null,
      display_order: display_order || 0,
      is_published: is_published || false,
    })
    .eq("id", req.params.id)
    .select()
    .single()

  if (error) {
    return res.status(400).json({ error: "Failed to update team member" })
  }

  await logAdminAction(
    { adminId: (req as any).user.id, action: "update", entityType: "team_member", entityId: req.params.id },
    req.ip,
  )

  res.json(data)
}

// Admin: Delete team member
export async function adminDeleteTeamMember(req: Request, res: Response) {
  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("id", req.params.id)

  if (error) {
    return res.status(400).json({ error: "Failed to delete team member" })
  }

  await logAdminAction(
    { adminId: (req as any).user.id, action: "delete", entityType: "team_member", entityId: req.params.id },
    req.ip,
  )

  res.json({ message: "Team member deleted" })
}
