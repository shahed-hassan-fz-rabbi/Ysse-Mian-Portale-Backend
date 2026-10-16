import { Request, Response } from "express"
import supabase from "../config/supabase.js"
import { logAdminAction } from "../middleware/auditLogger.js"

const DEFAULT_SETTINGS = {
  hero_heading: "Empowering Young People to Create Positive Social Change",
  hero_description: "",
  hero_image_url: null,
  featured_heading: "",
  featured_description: "",
  featured_image_url: null,
  about_heading: "",
  about_description: "",
  about_image_url: null,
  contact_email: null,
  contact_phone: null,
  contact_address: null,
  facebook_url: null,
  twitter_url: null,
  linkedin_url: null,
  instagram_url: null,
  footer_text: null,
}

const EDITABLE_FIELDS = Object.keys(DEFAULT_SETTINGS) as (keyof typeof DEFAULT_SETTINGS)[]

export async function getSiteSettings(_req: Request, res: Response) {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .single()

  if (error || !data) {
    // No settings row yet — return defaults so the UI can still render
    return res.json({ id: 1, ...DEFAULT_SETTINGS })
  }

  res.json(data)
}

export async function updateSiteSettings(req: Request, res: Response) {
  const adminId = (req as any).user.id

  // Whitelist: only known settings fields are persisted
  const updates: Record<string, unknown> = {}
  for (const field of EDITABLE_FIELDS) {
    if (field in req.body) {
      updates[field] = req.body[field] === "" ? null : req.body[field]
    }
  }
  updates.hero_heading = updates.hero_heading ?? DEFAULT_SETTINGS.hero_heading

  const { data, error } = await supabase
    .from("site_settings")
    .upsert({
      id: 1,
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return res.status(400).json({ error: "Failed to update settings", message: error.message })
  }

  await logAdminAction(
    {
      adminId,
      action: "update_settings",
      entityType: "site_settings",
      details: { fields: Object.keys(updates) },
    },
    req.ip,
  )

  res.json({ message: "Settings updated", settings: data })
}
