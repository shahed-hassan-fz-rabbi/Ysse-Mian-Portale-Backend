export type UserRole = "user" | "admin"

export interface Profile {
  id: string
  full_name: string
  phone: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Department {
  id: string
  name: string
  slug: string
  description: string
  goals: string[]
  responsibilities: string[]
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  title: string
  description: string
  category: string
  recording_url: string | null
  resource_url: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface Announcement {
  id: string
  title: string
  body: string
  published_at: string | null
  is_published: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface InternshipOpportunity {
  id: string
  title: string
  department_id: string | null
  description: string
  requirements: string
  application_deadline: string | null
  status: "draft" | "published" | "closed"
  created_at: string
  updated_at: string
}

export interface InternshipApplication {
  id: string
  user_id: string
  opportunity_id: string
  cover_letter: string | null
  resume_url: string | null
  status: "submitted" | "under_review" | "shortlisted" | "interview" | "selected" | "rejected"
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  access_token: string
  user: {
    id: string
    email: string
    full_name: string
    role: UserRole
  }
}
