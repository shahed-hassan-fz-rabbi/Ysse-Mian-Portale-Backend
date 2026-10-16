import { Request, Response } from "express"
import supabase from "../config/supabase.js"

export async function register(req: Request, res: Response) {
  const { email, password, full_name, phone } = req.body

  const { data: existingUser } = await supabase.auth.admin.listUsers()
  if (existingUser?.users?.some((u: any) => u.email === email)) {
    return res.status(409).json({ error: "Conflict", message: "Email already registered" })
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, role: "user" },
    },
  })

  if (error) {
    return res.status(400).json({ error: "Registration failed", message: error.message })
  }

  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      full_name,
      phone: phone || null,
      role: "user",
    })

    if (profileError) {
      return res.status(500).json({ error: "Profile creation failed" })
    }
  }

  res.status(201).json({
    message: "Registration successful. Please check your email to confirm your account.",
    user: data.user,
    session: data.session,
  })
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return res.status(401).json({ error: "Invalid credentials", message: "Invalid email or password" })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single()

  res.json({
    message: "Login successful",
    user: {
      id: data.user.id,
      email: data.user.email,
      full_name: profile?.full_name || data.user.user_metadata?.full_name || "",
      role: profile?.role || "user",
    },
    session: data.session,
  })
}

export async function logout(req: Request, res: Response) {
  await supabase.auth.signOut()
  res.json({ message: "Logout successful" })
}

export async function getMe(req: Request, res: Response) {
  const userId = (req as any).user.id

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (error || !profile) {
    return res.status(404).json({ error: "Profile not found" })
  }

  res.json(profile)
}

export async function updateProfile(req: Request, res: Response) {
  const userId = (req as any).user.id
  const { full_name, phone } = req.body

  const updates: any = {}
  if (full_name !== undefined) updates.full_name = full_name
  if (phone !== undefined) updates.phone = phone

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single()

  if (error) {
    return res.status(400).json({ error: "Update failed", message: error.message })
  }

  res.json({ message: "Profile updated", profile: data })
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173"

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${frontendUrl}/reset-password`,
  })

  if (error) {
    return res.status(400).json({ error: "Request failed", message: error.message })
  }

  res.json({ message: "If an account exists with this email, a password reset link has been sent." })
}

export async function resetPassword(req: Request, res: Response) {
  const { password } = req.body

  const { data, error } = await supabase.auth.updateUser({ password })

  if (error) {
    return res.status(400).json({ error: "Reset failed", message: error.message })
  }

  res.json({ message: "Password reset successful", user: data.user })
}
