import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database.js'

interface DepartmentAttributes {
  id: string
  name: string
  shortName: string
  description: string
  goals: string[]
  responsibilities: string[]
  activities: string[]
  image: string
  headOfDepartment: string
  teamMembers: { name: string; role: string }[]
  createdAt: Date
  updatedAt: Date
}

interface DepartmentCreationAttributes
  extends Optional<DepartmentAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Department
  extends Model<DepartmentAttributes, DepartmentCreationAttributes>
  implements DepartmentAttributes
{
  declare id: string
  declare name: string
  declare shortName: string
  declare description: string
  declare goals: string[]
  declare responsibilities: string[]
  declare activities: string[]
  declare image: string
  declare headOfDepartment: string
  declare teamMembers: { name: string; role: string }[]
  declare createdAt: Date
  declare updatedAt: Date
}

Department.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shortName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    goals: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    responsibilities: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    activities: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    headOfDepartment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    teamMembers: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'departments',
    timestamps: true,
  },
)

export default Department
