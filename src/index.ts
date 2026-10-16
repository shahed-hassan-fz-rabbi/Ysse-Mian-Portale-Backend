import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import supabase from './config/supabase.js'
import { errorHandler } from './middleware/errorHandler.js'
import { notFoundHandler } from './middleware/notFound.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check with DB connection test
app.get('/api/health', async (_req, res) => {
  const health: {
    status: string
    timestamp: string
    database: string
    error?: string
  } = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'unknown',
  }

  try {
    const { error } = await supabase
      .from('departments')
      .select('id')
      .limit(1)

    if (error) {
      if (error.code === '42P01') {
        health.database = 'connected (table not found — run migrations)'
      } else {
        health.database = 'error'
        health.error = error.message
      }
    } else {
      health.database = 'connected'
    }
  } catch (err: any) {
    health.database = 'error'
    health.error = err.message
  }

  const statusCode = health.database === 'error' ? 503 : 200
  res.status(statusCode).json(health)
})

// Error handling
app.use(notFoundHandler)
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)
})

export default app
