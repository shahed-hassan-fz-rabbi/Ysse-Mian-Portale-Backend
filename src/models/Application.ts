import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database.js'

type ApplicationStage =
  | 'Submitted'
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview'
  | 'Selected'
  | 'Rejected'
  | 'Onboarding'

interface ApplicationAttributes {
  id: string
  fullName: string
  email: string
  phone: string
  university: string
  fieldOfStudy: string
  preferredRole: string
  skills: string
  motivation: string
  resumeUrl: string | null
  currentStage: ApplicationStage
  createdAt: Date
  updatedAt: Date
}

interface ApplicationCreationAttributes
  extends Optional<ApplicationAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Application
  extends Model<ApplicationAttributes, ApplicationCreationAttributes>
  implements ApplicationAttributes
{
  declare id: string
  declare fullName: string
  declare email: string
  declare phone: string
  declare university: string
  declare fieldOfStudy: string
  declare preferredRole: string
  declare skills: string
  declare motivation: string
  declare resumeUrl: string | null
  declare currentStage: ApplicationStage
  declare createdAt: Date
  declare updatedAt: Date
}

Application.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    university: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fieldOfStudy: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    preferredRole: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    skills: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    motivation: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    resumeUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    currentStage: {
      type: DataTypes.ENUM(
        'Submitted',
        'Under Review',
        'Shortlisted',
        'Interview',
        'Selected',
        'Rejected',
        'Onboarding',
      ),
      allowNull: false,
      defaultValue: 'Submitted',
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'applications',
    timestamps: true,
  },
)

export default Application
