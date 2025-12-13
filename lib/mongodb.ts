

import mongoose, { Connection } from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || ''

if (!MONGODB_URI) {
  console.warn('⚠️ MONGODB_URI environment variable is not set. Database operations will fail.')
}

interface MongooseCache {
  conn: Connection | null
  promise: Promise<typeof mongoose> | null
  connectionState: 'disconnected' | 'connected' | 'connecting' | 'disconnecting'
  lastConnectionTime: Date | null
  reconnectAttempts: number
  maxReconnectAttempts: number
}

// Extend global namespace to cache mongoose connection
declare global {
  // eslint-disable-next-line no-unused-vars
  var mongoose: MongooseCache | undefined
}

let cached: MongooseCache = global.mongoose || { 
  conn: null, 
  promise: null, 
  connectionState: 'disconnected',
  lastConnectionTime: null,
  reconnectAttempts: 0,
  maxReconnectAttempts: 3
}

if (!global.mongoose) {
  global.mongoose = cached
}


// Connection health check
export async function checkConnectionHealth(): Promise<boolean> {
  try {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      // Simple ping using mongoose connection
      await mongoose.connection.db.admin().ping()
      return true
    }
    return false
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}

// Get connection status
export function getConnectionStatus(): { 
  connected: boolean
  state: string
  lastConnectionTime: Date | null
  reconnectAttempts: number
} {
  const isConnected = cached.conn?.readyState === 1 || mongoose.connection.readyState === 1
  return {
    connected: isConnected,
    state: cached.connectionState,
    lastConnectionTime: cached.lastConnectionTime,
    reconnectAttempts: cached.reconnectAttempts
  }
}

// Enhanced connection with retry logic and health monitoring
async function connectDB(): Promise<typeof mongoose> {
  // If already connected, return existing connection
  if (cached.conn || mongoose.connection.readyState === 1) {
    // Check if connection is still healthy
    const isHealthy = await checkConnectionHealth()
    if (isHealthy) {
      cached.conn = mongoose.connection
      return mongoose
    } else {
      console.log('🔄 Existing connection unhealthy, attempting to reconnect...')
      cached.conn = null
      cached.connectionState = 'disconnected'
    }
  }

  // If connection is in progress, wait for it
  if (cached.promise) {
    try {
      cached.conn = mongoose.connection
      return mongoose
    } catch (error) {
      console.error('Previous connection attempt failed:', error)
      cached.promise = null
    }
  }

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is required')
  }

  cached.connectionState = 'connecting'
  
  // Configure connection options for better stability
  const mongooseOptions = {
    bufferCommands: false,
    // Serverless and production optimizations
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4, // Use IPv4, skip trying IPv6
    retryWrites: true,
    retryReads: true,
  } as mongoose.ConnectOptions

  const connectWithRetry = async (attempt: number = 1): Promise<typeof mongoose> => {
    try {
      console.log(`🔗 Attempting database connection (attempt ${attempt}/${cached.maxReconnectAttempts})`)
      
      cached.promise = mongoose.connect(MONGODB_URI, mongooseOptions)
      await cached.promise
      
      // Connection successful
      cached.conn = mongoose.connection
      cached.connectionState = 'connected'
      cached.lastConnectionTime = new Date()
      cached.reconnectAttempts = 0
      
      console.log('✅ MongoDB connected successfully')
      
      // Set up connection event listeners
      mongoose.connection.on('error', (error: any) => {
        console.error('❌ MongoDB connection error:', error)
        cached.connectionState = 'disconnected'
      })
      
      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB disconnected')
        cached.connectionState = 'disconnected'
      })
      
      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected')
        cached.connectionState = 'connected'
        cached.reconnectAttempts = 0
      })
      
      return mongoose
      
    } catch (error) {
      console.error(`❌ MongoDB connection failed (attempt ${attempt}):`, error)
      cached.connectionState = 'disconnected'
      cached.promise = null
      
      if (attempt < cached.maxReconnectAttempts) {
        cached.reconnectAttempts = attempt
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000
        console.log(`⏳ Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        return connectWithRetry(attempt + 1)
      } else {
        cached.reconnectAttempts = cached.maxReconnectAttempts
        throw new Error(`Failed to connect to MongoDB after ${cached.maxReconnectAttempts} attempts: ${error}`)
      }
    }
  }

  try {
    return await connectWithRetry()
  } catch (error) {
    cached.connectionState = 'disconnected'
    throw error
  }
}

// Graceful disconnect function
export async function disconnectDB(): Promise<void> {
  try {
    if (mongoose.connection.readyState !== 0) {
      cached.connectionState = 'disconnecting'
      await mongoose.disconnect()
      cached.conn = null
      cached.promise = null
      cached.connectionState = 'disconnected'
      console.log('🔌 MongoDB disconnected gracefully')
    }
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error)
  }
}

// Auto-reconnect on process termination
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    await disconnectDB()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    await disconnectDB()
    process.exit(0)
  })
}

export default connectDB
