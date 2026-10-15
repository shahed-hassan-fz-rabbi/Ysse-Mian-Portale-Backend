import { Request, Response } from 'express'
import Internship from '../models/Internship.js'

export async function getAllInternships(_req: Request, res: Response) {
  const internships = await Internship.findAll({
    order: [['createdAt', 'DESC']],
  })
  res.json(internships)
}

export async function getInternshipById(req: Request, res: Response) {
  const internship = await Internship.findByPk(req.params.id)

  if (!internship) {
    res.status(404).json({ error: 'Internship not found' })
    return
  }

  res.json(internship)
}
