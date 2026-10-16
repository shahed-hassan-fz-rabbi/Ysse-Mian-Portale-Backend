import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import supabase, { isConfigured } from "./config/supabase.js"
import authRoutes from "./routes/auth.js"
import contentRoutes from "./routes/content.js"
import applicationRoutes from "./routes/applications.js"
import adminRoutes from "./routes/admin.js"
import contactRoutes from "./routes/contact.js"
import { errorHandler } from "./middleware/errorHandler.js"
import { notFoundHandler } from "./middleware/notFound.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
// CORS allowlist. FRONTEND_URL accepts a single origin or a comma-separated
// list (e.g. the deployed Vercel URL plus the localhost dev origin).
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      // Same-origin / server-to-server requests have no Origin header
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(null, false)
      }
    },
    credentials: true,
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// PostgREST reports a missing table as a schema-cache error rather than
// Postgres code 42P01, so match both forms.
const isTableMissing = (error: { code?: string; message?: string }): boolean =>
  error.code === "42P01" ||
  error.code === "PGRST205" ||
  (error.message || "").includes("schema cache")

// Health check with DB connection test
app.get("/api/health", async (_req, res) => {
  const health: {
    status: string
    timestamp: string
    database: string
    error?: string
  } = {
    status: "ok",
    timestamp: new Date().toISOString(),
    database: "unknown",
  }

  if (!isConfigured) {
    health.database = "misconfigured"
    health.error = "Supabase credentials are placeholders. Update .env with real values."
    return res.status(503).json(health)
  }

  try {
    const { error } = await supabase
      .from("departments")
      .select("id")
      .limit(1)

    if (error) {
      if (isTableMissing(error)) {
        health.database = "connected (table not found — run migrations)"
      } else {
        health.database = "error"
        health.error = error.message
      }
    } else {
      health.database = "connected"
    }
  } catch (err: any) {
    const msg = err.message || String(err)
    if (msg.includes("fetch failed") || msg.includes("ENOTFOUND") || msg.includes("ECONNREFUSED")) {
      health.database = "unreachable"
      health.error = "Cannot reach Supabase. Check your SUPABASE_URL."
    } else {
      health.database = "error"
      health.error = msg
    }
  }

  const statusCode =
    health.database === "connected" || health.database === "connected (table not found — run migrations)"
      ? 200
      : 503
  res.status(statusCode).json(health)
})

// Database health endpoint
app.get("/api/health/database", async (_req, res) => {
  if (!isConfigured) {
    return res.status(503).json({ status: "misconfigured", message: "Supabase credentials not configured" })
  }

  try {
    const { data, error } = await supabase.from("departments").select("id").limit(1)
    if (error) {
      if (isTableMissing(error)) {
        return res.json({ status: "connected", message: "Database reachable, tables not yet created" })
      }
      return res.status(500).json({ status: "error", message: error.message })
    }
    res.json({ status: "connected", message: "Database connected successfully" })
  } catch (err: any) {
    res.status(503).json({ status: "unreachable", message: err.message })
  }
})

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/content", contentRoutes)
app.use("/api/applications", applicationRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/contact", contactRoutes)

// Error handling
app.use(notFoundHandler)
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)
  console.log(`API Database health: http://localhost:${PORT}/api/health/database`)
})

export default app
