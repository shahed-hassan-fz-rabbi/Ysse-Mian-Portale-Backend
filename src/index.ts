import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { sequelize } from './config/database.js'
import departmentsRouter from './routes/departments.js'
import coursesRouter from './routes/courses.js'
import internshipsRouter from './routes/internships.js'
import applicationsRouter from './routes/applications.js'
import contactRouter from './routes/contact.js'
import { errorHandler } from './middleware/errorHandler.js'
import { notFoundHandler } from './middleware/notFound.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/departments', departmentsRouter)
app.use('/api/courses', coursesRouter)
app.use('/api/internships', internshipsRouter)
app.use('/api/applications', applicationsRouter)
app.use('/api/contact', contactRouter)

// Error handling
app.use(notFoundHandler)
app.use(errorHandler)

// Database connection and server start
async function startServer() {
  try {
    await sequelize.authenticate()
    console.log('Database connection established.')

    // Sync models (in production, use migrations instead)
    await sequelize.sync({ alter: true })
    console.log('Database models synchronized.')

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to connect to database:', error)
    console.log('Server will start without database connection.')

    // Start server even without DB for development
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (without database)`)
    })
  }
}

startServer()

export default app
