import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database.js'

interface CourseResource {
  id: string
  title: string
  type: 'video' | 'document' | 'link'
  url: string
  description: string
}

interface CourseAttributes {
  id: string
  title: string
  description: string
  category: string
  duration: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  format: 'Recorded' | 'Live' | 'Self-paced'
  department: string
  image: string
  resources: CourseResource[]
  topics: string[]
  createdAt: Date
  updatedAt: Date
}

interface CourseCreationAttributes
  extends Optional<CourseAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Course
  extends Model<CourseAttributes, CourseCreationAttributes>
  implements CourseAttributes
{
  declare id: string
  declare title: string
  declare description: string
  declare category: string
  declare duration: string
  declare level: 'Beginner' | 'Intermediate' | 'Advanced'
  declare format: 'Recorded' | 'Live' | 'Self-paced'
  declare department: string
  declare image: string
  declare resources: CourseResource[]
  declare topics: string[]
  declare createdAt: Date
  declare updatedAt: Date
}

Course.init(
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
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    level: {
      type: DataTypes.ENUM('Beginner', 'Intermediate', 'Advanced'),
      allowNull: false,
    },
    format: {
      type: DataTypes.ENUM('Recorded', 'Live', 'Self-paced'),
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resources: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    topics: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'courses',
    timestamps: true,
  },
)

export default Course
