import { Request, Response } from "express"
import supabase from "../config/supabase.js"
import { logAdminAction } from "../middleware/auditLogger.js"

// Public: Get published departments
export async function getDepartments(req: Request, res: Response) {
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .eq("is_published", true)
    .order("name", { ascending: true })

  if (error) {
    return res.status(400).json({ error: "Failed to fetch departments" })
  }

  res.json(data)
}

export async function getDepartmentById(req: Request, res: Response) {
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .eq("id", req.params.id)
    .eq("is_published", true)
    .single()

  if (error || !data) {
    return res.status(404).json({ error: "Department not found" })
  }

  res.json(data)
}

// Public: Get published courses
export async function getCourses(req: Request, res: Response) {
  const { category, search } = req.query
  let query = supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  if (category && category !== "All") {
    query = query.eq("category", String(category).slice(0, 100))
  }

  const term = String(search || "")
    .replace(/[,()]/g, " ")
    .trim()
    .slice(0, 100)
  if (term) {
    query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`)
  }

  const { data, error } = await query

  if (error) {
    return res.status(400).json({ error: "Failed to fetch courses" })
  }

  res.json(data)
}

export async function getCourseById(req: Request, res: Response) {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", req.params.id)
    .eq("is_published", true)
    .single()

  if (error || !data) {
    return res.status(404).json({ error: "Course not found" })
  }

  res.json(data)
}

// Public: Get published announcements
export async function getAnnouncements(_req: Request, res: Response) {
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false })

  if (error) {
    return res.status(400).json({ error: "Failed to fetch announcements" })
  }

  res.json(data)
}

// Public: Get published internship opportunities
export async function getInternships(req: Request, res: Response) {
  const { data, error } = await supabase
    .from("internship_opportunities")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })

  if (error) {
    return res.status(400).json({ error: "Failed to fetch internships" })
  }

  res.json(data)
}

export async function getInternshipById(req: Request, res: Response) {
  const { data, error } = await supabase
    .from("internship_opportunities")
    .select("*")
    .eq("id", req.params.id)
    .eq("status", "published")
    .single()

  if (error || !data) {
    return res.status(404).json({ error: "Internship not found" })
  }

  res.json(data)
}

// Admin: CRUD for departments
export async function adminGetDepartments(_req: Request, res: Response) {
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .order("name", { ascending: true })

  if (error) {
    return res.status(400).json({ error: "Failed to fetch departments" })
  }

  res.json(data)
}

export async function adminCreateDepartment(req: Request, res: Response) {
  const { name, slug, description, department_head, goals, responsibilities, is_published } = req.body

  const { data, error } = await supabase
    .from("departments")
    .insert({
      name,
      slug,
      description,
      department_head: department_head || null,
      goals: goals || [],
      responsibilities: responsibilities || [],
      is_published: is_published || false,
    })
    .select()
    .single()

  if (error) {
    return res.status(400).json({ error: "Failed to create department", message: error.message })
  }

  await logAdminAction(
    { adminId: (req as any).user.id, action: "create", entityType: "department", entityId: data.id },
    req.ip,
  )

  res.status(201).json(data)
}

export async function adminUpdateDepartment(req: Request, res: Response) {
  const { name, slug, description, department_head, goals, responsibilities, is_published } = req.body

  const updates: Record<string, unknown> = {}
  if (name !== undefined) updates.name = name
  if (slug !== undefined) updates.slug = slug
  if (description !== undefined) updates.description = description
  if (department_head !== undefined) updates.department_head = department_head || null
  if (goals !== undefined) updates.goals = goals
  if (responsibilities !== undefined) updates.responsibilities = responsibilities
  if (is_published !== undefined) updates.is_published = is_published

  const { data, error } = await supabase
    .from("departments")
    .update(updates)
    .eq("id", req.params.id)
    .select()
    .single()

  if (error) {
    return res.status(400).json({ error: "Failed to update department", message: error.message })
  }

  await logAdminAction(
    { adminId: (req as any).user.id, action: "update", entityType: "department", entityId: req.params.id },
    req.ip,
  )

  res.json(data)
}

export async function adminDeleteDepartment(req: Request, res: Response) {
  const { error } = await supabase
    .from("departments")
    .delete()
    .eq("id", req.params.id)

  if (error) {
    return res.status(400).json({ error: "Failed to delete department" })
  }

  await logAdminAction(
    { adminId: (req as any).user.id, action: "delete", entityType: "department", entityId: req.params.id },
    req.ip,
  )

  res.json({ message: "Department deleted" })
}

// Admin: CRUD for courses
export async function adminGetCourses(_req: Request, res: Response) {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return res.status(400).json({ error: "Failed to fetch courses" })
  }

  res.json(data)
}

export async function adminCreateCourse(req: Request, res: Response) {
  const { title, description, category, thumbnail_url, recording_url, resource_url, is_published } = req.body

  const { data, error } = await supabase
    .from("courses")
    .insert({
      title,
      description,
      category,
      thumbnail_url: thumbnail_url || null,
      recording_url,
      resource_url,
      is_published: is_published || false,
    })
    .select()
    .single()

  if (error) {
    return res.status(400).json({ error: "Failed to create course", message: error.message })
  }

  await logAdminAction(
    { adminId: (req as any).user.id, action: "create", entityType: "course", entityId: data.id },
    req.ip,
  )

  res.status(201).json(data)
}

export async function adminUpdateCourse(req: Request, res: Response) {
  const { title, description, category, thumbnail_url, recording_url, resource_url, is_published } = req.body

  const updates: Record<string, unknown> = {}
  if (title !== undefined) updates.title = title
  if (description !== undefined) updates.description = description
  if (category !== undefined) updates.category = category
  if (thumbnail_url !== undefined) updates.thumbnail_url = thumbnail_url || null
  if (recording_url !== undefined) updates.recording_url = recording_url || null
  if (resource_url !== undefined) updates.resource_url = resource_url || null
  if (is_published !== undefined) updates.is_published = is_published

  const { data, error } = await supabase
    .from("courses")
    .update(updates)
    .eq("id", req.params.id)
    .select()
    .single()

  if (error) {
    return res.status(400).json({ error: "Failed to update course", message: error.message })
  }

  await logAdminAction(
    { adminId: (req as any).user.id, action: "update", entityType: "course", entityId: req.params.id },
    req.ip,
  )

  res.json(data)
}

export async function adminDeleteCourse(req: Request, res: Response) {
  const { error } = await supabase.from("courses").delete().eq("id", req.params.id)

  if (error) {
    return res.status(400).json({ error: "Failed to delete course" })
  }

  await logAdminAction(
    { adminId: (req as any).user.id, action: "delete", entityType: "course", entityId: req.params.id },
    req.ip,
  )

  res.json({ message: "Course deleted" })
}

// Admin: CRUD for announcements
export async function adminGetAnnouncements(_req: Request, res: Response) {
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return res.status(400).json({ error: "Failed to fetch announcements" })
  }

  res.json(data)
}

export async function adminCreateAnnouncement(req: Request, res: Response) {
  const { title, slug, body, is_published, published_at } = req.body
  const userId = (req as any).user.id

  const { data, error } = await supabase
    .from("announcements")
    .insert({
      title,
      slug: slug || null,
      body,
      is_published: is_published || false,
      published_at: is_published ? published_at || new Date().toISOString() : null,
      created_by: userId,
    })
    .select()
    .single()

  if (error) {
    return res.status(400).json({ error: "Failed to create announcement", message: error.message })
  }

  await logAdminAction(
    { adminId: userId, action: "create", entityType: "announcement", entityId: data.id },
    req.ip,
  )

  res.status(201).json(data)
}

export async function adminUpdateAnnouncement(req: Request, res: Response) {
  const { title, slug, body, is_published, published_at } = req.body

  const { data: current } = await supabase
    .from("announcements")
    .select("is_published, published_at")
    .eq("id", req.params.id)
    .single()

  const updates: Record<string, unknown> = {}
  if (title !== undefined) updates.title = title
  if (slug !== undefined) updates.slug = slug || null
  if (body !== undefined) updates.body = body
  if (is_published !== undefined) {
    updates.is_published = is_published
    if (is_published) {
      // Set the publication date the first time it is published; keep it stable afterwards
      updates.published_at =
        published_at || current?.published_at || new Date().toISOString()
    } else {
      updates.published_at = null
    }
  } else if (published_at !== undefined) {
    updates.published_at = published_at
  }

  const { data, error } = await supabase
    .from("announcements")
    .update(updates)
    .eq("id", req.params.id)
    .select()
    .single()

  if (error) {
    return res.status(400).json({ error: "Failed to update announcement", message: error.message })
  }

  await logAdminAction(
    { adminId: (req as any).user.id, action: "update", entityType: "announcement", entityId: req.params.id },
    req.ip,
  )

  res.json(data)
}

export async function adminDeleteAnnouncement(req: Request, res: Response) {
  const { error } = await supabase.from("announcements").delete().eq("id", req.params.id)

  if (error) {
    return res.status(400).json({ error: "Failed to delete announcement" })
  }

  await logAdminAction(
    { adminId: (req as any).user.id, action: "delete", entityType: "announcement", entityId: req.params.id },
    req.ip,
  )

  res.json({ message: "Announcement deleted" })
}

// Admin: CRUD for internship opportunities
export async function adminGetInternships(_req: Request, res: Response) {
  const { data, error } = await supabase
    .from("internship_opportunities")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return res.status(400).json({ error: "Failed to fetch internships" })
  }

  res.json(data)
}

export async function adminCreateInternship(req: Request, res: Response) {
  const { title, description, requirements, application_deadline, status } = req.body

  const { data, error } = await supabase
    .from("internship_opportunities")
    .insert({
      title,
      description,
      requirements,
      application_deadline: application_deadline || null,
      status: status || "draft",
    })
    .select()
    .single()

  if (error) {
    return res.status(400).json({ error: "Failed to create internship", message: error.message })
  }

  await logAdminAction(
    { adminId: (req as any).user.id, action: "create", entityType: "internship_opportunity", entityId: data.id },
    req.ip,
  )

  res.status(201).json(data)
}

export async function adminUpdateInternship(req: Request, res: Response) {
  const { title, description, requirements, application_deadline, status } = req.body

  const updates: Record<string, unknown> = {}
  if (title !== undefined) updates.title = title
  if (description !== undefined) updates.description = description
  if (requirements !== undefined) updates.requirements = requirements
  if (application_deadline !== undefined) updates.application_deadline = application_deadline || null
  if (status !== undefined) updates.status = status

  const { data, error } = await supabase
    .from("internship_opportunities")
    .update(updates)
    .eq("id", req.params.id)
    .select()
    .single()

  if (error) {
    return res.status(400).json({ error: "Failed to update internship", message: error.message })
  }

  await logAdminAction(
    { adminId: (req as any).user.id, action: "update", entityType: "internship_opportunity", entityId: req.params.id },
    req.ip,
  )

  res.json(data)
}

export async function adminDeleteInternship(req: Request, res: Response) {
  const { error } = await supabase.from("internship_opportunities").delete().eq("id", req.params.id)

  if (error) {
    return res.status(400).json({ error: "Failed to delete internship" })
  }

  await logAdminAction(
    { adminId: (req as any).user.id, action: "delete", entityType: "internship_opportunity", entityId: req.params.id },
    req.ip,
  )

  res.json({ message: "Internship deleted" })
}
