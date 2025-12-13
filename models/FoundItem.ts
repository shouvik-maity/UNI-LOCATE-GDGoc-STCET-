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

export interface IFoundItem extends Document {
  title: string
  description: string
  category: string
  image: string
  location: string
  dateFound: Date
  userId: string
  userName: string
  userEmail: string
  userPhone: string
  status: 'available' | 'claimed' | 'archived' | 'returned'
  aiAnalysis?: IAIAnalysis
  aiMatches: {
    lostItemId: string
    matchScore: number
    confidence: number
    matchedFeatures: string[]
    createdAt: Date
  }[]
  createdAt: Date
  updatedAt: Date
}

const FoundItemSchema = new Schema<IFoundItem>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title for the found item'],
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
      required: [true, 'Please specify where item was found'],
    },
    dateFound: {
      type: Date,
      required: [true, 'Please specify when item was found'],
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
      enum: ['available', 'claimed', 'archived', 'returned'],
      default: 'available',
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
        lostItemId: {
          type: Schema.Types.ObjectId,
          ref: 'LostItem',
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


export default mongoose.models.FoundItem || mongoose.model<IFoundItem>('FoundItem', FoundItemSchema)

// Create indexes for better performance
if (mongoose.connection.readyState === 1) {
  FoundItemSchema.index({ userId: 1, createdAt: -1 })
  FoundItemSchema.index({ status: 1, createdAt: -1 })
  FoundItemSchema.index({ category: 1 })
  FoundItemSchema.index({ location: 1 })
  
  // Compound index for admin queries
  FoundItemSchema.index({ userId: 1, status: 1, createdAt: -1 })
}
