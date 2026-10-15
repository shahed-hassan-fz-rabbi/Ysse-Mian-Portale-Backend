import { Request, Response } from 'express'
import ContactMessage from '../models/ContactMessage.js'

export async function submitContactForm(req: Request, res: Response) {
  const { name, email, subject, message } = req.body

  const contactMessage = await ContactMessage.create({
    name,
    email,
    subject,
    message,
  })

  res.status(201).json({
    message: 'Message sent successfully',
    contactMessage,
  })
}
