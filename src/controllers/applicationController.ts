import { Request, Response } from 'express'
import Application from '../models/Application.js'

export async function submitApplication(req: Request, res: Response) {
  const {
    fullName,
    email,
    phone,
    university,
    fieldOfStudy,
    preferredRole,
    skills,
    motivation,
  } = req.body

  const application = await Application.create({
    fullName,
    email,
    phone,
    university,
    fieldOfStudy,
    preferredRole,
    skills,
    motivation,
    resumeUrl: null,
    currentStage: 'Submitted',
  })

  res.status(201).json({
    message: 'Application submitted successfully',
    application,
  })
}

export async function getApplicationStatus(req: Request, res: Response) {
  const application = await Application.findByPk(req.params.id)

  if (!application) {
    res.status(404).json({ error: 'Application not found' })
    return
  }

  res.json(application)
}
