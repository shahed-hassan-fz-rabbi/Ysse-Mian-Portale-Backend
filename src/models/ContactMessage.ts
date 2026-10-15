import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database.js'

interface ContactMessageAttributes {
  id: string
  name: string
  email: string
  subject: string
  message: string
  createdAt: Date
  updatedAt: Date
}

interface ContactMessageCreationAttributes
  extends Optional<ContactMessageAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class ContactMessage
  extends Model<ContactMessageAttributes, ContactMessageCreationAttributes>
  implements ContactMessageAttributes
{
  declare id: string
  declare name: string
  declare email: string
  declare subject: string
  declare message: string
  declare createdAt: Date
  declare updatedAt: Date
}

ContactMessage.init(
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'contact_messages',
    timestamps: true,
  },
)

export default ContactMessage
