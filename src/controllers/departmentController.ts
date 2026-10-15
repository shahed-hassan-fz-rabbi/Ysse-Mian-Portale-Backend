import { Request, Response } from 'express'
import Department from '../models/Department.js'

export async function getAllDepartments(_req: Request, res: Response) {
  const departments = await Department.findAll({
    order: [['name', 'ASC']],
  })
  res.json(departments)
}

export async function getDepartmentById(req: Request, res: Response) {
  const department = await Department.findByPk(req.params.id)

  if (!department) {
    res.status(404).json({ error: 'Department not found' })
    return
  }

  res.json(department)
}
