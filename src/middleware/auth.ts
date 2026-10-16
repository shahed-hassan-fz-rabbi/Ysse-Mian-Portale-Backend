import { Request, Response, NextFunction } from "express"
import supabase from "../config/supabase.js"

export interface AuthUser {
  id: string
  email: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized", message: "Missing or invalid Authorization header" })
  }

  const token = authHeader.split(" ")[1]

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ error: "Unauthorized", message: "Invalid or expired token" })
    }

    req.user = { id: user.id, email: user.email || "" }
    next()
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized", message: "Authentication failed" })
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized", message: "Authentication required" })
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", req.user.id)
    .single()

  if (error || !profile) {
    return res.status(403).json({ error: "Forbidden", message: "Profile not found" })
  }

  if (profile.role !== "admin") {
    return res.status(403).json({ error: "Forbidden", message: "Admin access required" })
  }

  next()
}
