import { Request, Response } from "express"
import supabase from "../config/supabase.js"

// Get current user's applications (with the opportunity title for display)
export async function getMyApplications(req: Request, res: Response) {
  const userId = (req as any).user.id

  const { data, error } = await supabase
    .from("internship_applications")
    .select("*, internship_opportunities(title)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    return res.status(400).json({ error: "Failed to fetch applications" })
  }

  res.json(data)
}

// Submit a new application
export async function submitApplication(req: Request, res: Response) {
  const userId = (req as any).user.id
  const { opportunity_id, cover_letter, resume_url, skills } = req.body

  // Check if opportunity exists and is published
  const { data: opportunity, error: oppError } = await supabase
    .from("internship_opportunities")
    .select("*")
    .eq("id", opportunity_id)
    .eq("status", "published")
    .single()

  if (oppError || !opportunity) {
    return res.status(404).json({ error: "Opportunity not found or not available" })
  }

  // Server-side deadline enforcement: published opportunities whose deadline
  // has passed can no longer be applied to, no matter what the frontend sends
  if (
    opportunity.application_deadline &&
    new Date(opportunity.application_deadline).getTime() < Date.now()
  ) {
    return res
      .status(400)
      .json({ error: "This opportunity closed on its application deadline" })
  }

  // Check for duplicate application
  const { data: existing } = await supabase
    .from("internship_applications")
    .select("id")
    .eq("user_id", userId)
    .eq("opportunity_id", opportunity_id)
    .single()

  if (existing) {
    return res.status(409).json({ error: "You have already applied to this opportunity" })
  }

  const { data, error } = await supabase
    .from("internship_applications")
    .insert({
      user_id: userId,
      opportunity_id,
      cover_letter: cover_letter || null,
      resume_url: resume_url || null,
      skills,
      status: "submitted",
    })
    .select()
    .single()

  if (error) {
    return res.status(400).json({ error: "Failed to submit application" })
  }

  res.status(201).json(data)
}
