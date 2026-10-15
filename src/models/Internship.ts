import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database.js'

interface InternshipAttributes {
  id: string
  title: string
  department: string
  description: string
  responsibilities: string[]
  requirements: string[]
  duration: string
  location: string
  deadline: string
  isDemo: boolean
  image: string
  createdAt: Date
  updatedAt: Date
}

interface InternshipCreationAttributes
  extends Optional<InternshipAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Internship
  extends Model<InternshipAttributes, InternshipCreationAttributes>
  implements InternshipAttributes
{
  declare id: string
  declare title: string
  declare department: string
  declare description: string
  declare responsibilities: string[]
  declare requirements: string[]
  declare duration: string
  declare location: string
  declare deadline: string
  declare isDemo: boolean
  declare image: string
  declare createdAt: Date
  declare updatedAt: Date
}

Internship.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    responsibilities: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    requirements: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deadline: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isDemo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'internships',
    timestamps: true,
  },
)

export default Internship
