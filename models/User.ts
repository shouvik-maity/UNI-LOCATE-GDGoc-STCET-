import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  firebaseUid: string
  email: string
  name: string
  phone: string
  avatar?: string
  bio?: string
  role: 'user' | 'admin'
  lostItemsCount: number
  foundItemsCount: number
  successfulMatches: number
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    firebaseUid: {
      type: String,
      required: [true, 'Firebase UID is required'],
      unique: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    avatar: String,
    bio: String,
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    lostItemsCount: {
      type: Number,
      default: 0,
    },
    foundItemsCount: {
      type: Number,
      default: 0,
    },
    successfulMatches: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
)

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
