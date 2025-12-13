
import mongoose, { Schema, Document } from 'mongoose'

export interface IMatch extends Document {
  lostItemId: string
  foundItemId: string
  matchScore: number
  similarities: string[]
  differences: string[]
  confidence: 'high' | 'medium' | 'low'
  productDetails: {
    brand?: string
    model?: string
    color?: string
    condition?: string
    uniqueIdentifiers: string[]
  }
  recommendation: string
  lostItemUserId: string
  foundItemUserId: string
  status: 'pending' | 'confirmed' | 'rejected' | 'resolved'
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const MatchSchema = new Schema<IMatch>(
  {
    lostItemId: {
      type: String,
      required: true,
    },
    foundItemId: {
      type: String,
      required: true,
    },
    matchScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    similarities: [
      {
        type: String,
      },
    ],
    differences: [
      {
        type: String,
      },
    ],
    confidence: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    productDetails: {
      brand: String,
      model: String,
      color: String,
      condition: String,
      uniqueIdentifiers: [String],
    },
    recommendation: {
      type: String,
      default: '',
    },
    lostItemUserId: {
      type: String,
      required: true,
    },
    foundItemUserId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'resolved'],
      default: 'pending',
    },
    notes: String,
  },
  { timestamps: true }
)

export default mongoose.models.Match || mongoose.model<IMatch>('Match', MatchSchema)
