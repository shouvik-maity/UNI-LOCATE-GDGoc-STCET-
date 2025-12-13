import mongoose, { Schema, Document } from 'mongoose'


export interface IAIAnalysis {
  colors: string[]
  objects: string[]
  brands: string[]
  condition: string
  estimatedValue: string
  categoryConfidence: number
  textFeatures: string[]
  imageHash: string
  confidenceScore: number
  analysisTimestamp: Date
}

export interface ILostItem extends Document {
  title: string
  description: string
  category: string
  image: string
  location: string
  dateLost: Date
  userId: string
  userName: string
  userEmail: string
  userPhone: string
  status: 'open' | 'claimed' | 'resolved' | 'returned'
  aiAnalysis?: IAIAnalysis
  aiMatches: {
    foundItemId: string
    matchScore: number
    confidence: number
    matchedFeatures: string[]
    createdAt: Date
  }[]
  createdAt: Date
  updatedAt: Date
}

const LostItemSchema = new Schema<ILostItem>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title for the lost item'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: ['Electronics', 'Accessories', 'Clothing', 'Books', 'Bags', 'Jewelry', 'Documents', 'Other'],
    },
    image: {
      type: String,
      required: [true, 'Please upload an image'],
    },
    location: {
      type: String,
      required: [true, 'Please specify where item was lost'],
    },
    dateLost: {
      type: Date,
      required: [true, 'Please specify when item was lost'],
    },
    userId: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    userPhone: {
      type: String,
      required: [true, 'Please provide a contact phone number'],
    },

    status: {
      type: String,
      enum: ['open', 'claimed', 'resolved', 'returned'],
      default: 'open',
    },
    aiAnalysis: {
      colors: [String],
      objects: [String],
      brands: [String],
      condition: String,
      estimatedValue: String,
      categoryConfidence: Number,
      textFeatures: [String],
      imageHash: String,
      confidenceScore: Number,
      analysisTimestamp: Date,
    },
    aiMatches: [
      {
        foundItemId: {
          type: Schema.Types.ObjectId,
          ref: 'FoundItem',
        },
        matchScore: Number,
        confidence: Number,
        matchedFeatures: [String],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
)


export default mongoose.models.LostItem || mongoose.model<ILostItem>('LostItem', LostItemSchema)

// Create indexes for better performance
if (mongoose.connection.readyState === 1) {
  LostItemSchema.index({ userId: 1, createdAt: -1 })
  LostItemSchema.index({ status: 1, createdAt: -1 })
  LostItemSchema.index({ category: 1 })
  LostItemSchema.index({ location: 1 })
  
  // Compound index for admin queries
  LostItemSchema.index({ userId: 1, status: 1, createdAt: -1 })
}
