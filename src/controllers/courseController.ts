import { Request, Response } from 'express'
import Course from '../models/Course.js'

export async function getAllCourses(req: Request, res: Response) {
  const { category, level, format, search } = req.query

  const where: Record<string, unknown> = {}

  if (category && category !== 'All') {
    where.category = category
  }

  if (level && level !== 'All') {
    where.level = level
  }

  if (format && format !== 'All') {
    where.format = format
  }

  if (search) {
    const { Op } = await import('sequelize')
    where[Op.or as unknown as string] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
    ]
  }

  const courses = await Course.findAll({
    where,
    order: [['title', 'ASC']],
  })

  res.json(courses)
}

export async function getCourseById(req: Request, res: Response) {
  const course = await Course.findByPk(req.params.id)

  if (!course) {
    res.status(404).json({ error: 'Course not found' })
    return
  }

  res.json(course)
}
