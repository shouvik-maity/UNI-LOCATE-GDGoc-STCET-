// Environment Variable Validation and Configuration Management
import { z } from 'zod'

// Define the environment variable schema
const envSchema = z.object({
  // Database
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  
  // AI Service (Gemini)
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  
  // Authentication
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  

  // Optional configurations
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().positive()).default(3000),
  
  // Firebase (if using)
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().optional(),
  
  // Email service (if using)
  EMAIL_SERVER_HOST: z.string().optional(),
  EMAIL_SERVER_PORT: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().positive()).optional(),
  EMAIL_SERVER_USER: z.string().optional(),
  EMAIL_SERVER_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
})

// Environment validation result type
export interface EnvValidationResult {
  isValid: boolean
  errors: string[]
  env: z.infer<typeof envSchema>
  warnings: string[]
}

// Environment variable status
export interface EnvStatus {
  variable: string
  status: 'missing' | 'invalid' | 'valid'
  value?: string
  description: string
}

// Validate environment variables
export function validateEnvironment(): EnvValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  try {
    // Validate required variables
    const env = envSchema.parse(process.env)
    
    // Check for common configuration issues
    if (env.NODE_ENV === 'production') {
      if (!env.NEXTAUTH_URL.startsWith('https://')) {
        warnings.push('NEXTAUTH_URL should use HTTPS in production')
      }
      
      if (env.MONGODB_URI.includes('localhost')) {
        warnings.push('Using localhost MongoDB URI in production is not recommended')
      }
    }
    
    // Validate Firebase configuration consistency
    const firebaseVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    ]
    
    const hasFirebaseConfig = firebaseVars.every(varName => process.env[varName])
    
    if (hasFirebaseConfig) {
      const missingFirebaseVars = firebaseVars.filter(varName => !process.env[varName])
      if (missingFirebaseVars.length > 0) {
        warnings.push(`Incomplete Firebase configuration: ${missingFirebaseVars.join(', ')}`)
      }
    }
    
    return {
      isValid: true,
      errors,
      env,
      warnings
    }
  } catch (error) {


    if (error instanceof z.ZodError) {
      error.issues.forEach((err: any) => {
        errors.push(`${err.path.join('.')}: ${err.message}`)
      })
    } else {
      errors.push(`Validation failed: ${error}`)
    }
    
    return {
      isValid: false,
      errors,
      env: {} as z.infer<typeof envSchema>,
      warnings
    }
  }
}

// Check individual environment variable status
export function checkEnvVariableStatus(): EnvStatus[] {
  const variables = [
    {
      name: 'MONGODB_URI',
      description: 'MongoDB connection string',
      required: true
    },
    {
      name: 'GEMINI_API_KEY',
      description: 'Google Gemini AI API key',
      required: true
    },
    {
      name: 'NEXTAUTH_SECRET',
      description: 'NextAuth.js secret for session encryption',
      required: true
    },
    {
      name: 'NEXTAUTH_URL',
      description: 'Base URL for NextAuth.js',
      required: true
    },
    {
      name: 'NODE_ENV',
      description: 'Application environment (development/production)',
      required: false
    },
    {
      name: 'NEXT_PUBLIC_FIREBASE_API_KEY',
      description: 'Firebase API key (public)',
      required: false
    },
    {
      name: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      description: 'Firebase authentication domain (public)',
      required: false
    },
    {
      name: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      description: 'Firebase project ID (public)',
      required: false
    }
  ]

  return variables.map(variable => {
    const value = process.env[variable.name]
    
    if (!value) {
      return {
        variable: variable.name,
        status: variable.required ? 'missing' : 'missing',
        description: variable.description
      }
    }
    
    // Basic validation for specific variables
    if (variable.name === 'NEXTAUTH_URL' && !isValidUrl(value)) {
      return {
        variable: variable.name,
        status: 'invalid',
        value: value.substring(0, 20) + '...',
        description: variable.description
      }
    }
    
    if (variable.name === 'EMAIL_FROM' && !isValidEmail(value)) {
      return {
        variable: variable.name,
        status: 'invalid',
        value: value.substring(0, 20) + '...',
        description: variable.description
      }
    }
    
    return {
      variable: variable.name,
      status: 'valid',
      value: value.length > 20 ? value.substring(0, 20) + '...' : value,
      description: variable.description
    }
  })
}

// Helper functions
function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Health check for environment setup
export function performHealthCheck(): {
  status: 'healthy' | 'degraded' | 'unhealthy'
  checks: Array<{
    name: string
    status: 'pass' | 'fail' | 'warning'
    message: string
  }>
} {
  const checks = []
  const validation = validateEnvironment()
  

  // Environment validation check
  if (validation.isValid) {
    checks.push({
      name: 'Environment Variables',
      status: 'pass' as const,
      message: 'All required environment variables are valid'
    })
  } else {
    checks.push({
      name: 'Environment Variables',
      status: 'fail' as const,
      message: `Environment validation failed: ${validation.errors.join(', ')}`
    })
  }
  
  // Warnings check
  if (validation.warnings.length > 0) {
    checks.push({
      name: 'Configuration Warnings',
      status: 'warning' as const,
      message: validation.warnings.join('; ')
    })
  }
  
  // Database connection check
  if (process.env.MONGODB_URI) {
    checks.push({
      name: 'Database Configuration',
      status: 'pass' as const,
      message: 'MongoDB URI is configured'
    })
  } else {
    checks.push({
      name: 'Database Configuration',
      status: 'fail' as const,
      message: 'MongoDB URI is missing'
    })
  }
  
  // AI service check
  if (process.env.GEMINI_API_KEY) {
    checks.push({
      name: 'AI Service Configuration',
      status: 'pass' as const,
      message: 'Gemini API key is configured'
    })
  } else {
    checks.push({
      name: 'AI Service Configuration',
      status: 'fail' as const,
      message: 'Gemini API key is missing'
    })
  }
  
  // Determine overall status
  const hasFailures = checks.some(check => check.status === 'fail')
  const hasWarnings = checks.some(check => check.status === 'warning')
  
  let status: 'healthy' | 'degraded' | 'unhealthy'
  if (hasFailures) {
    status = 'unhealthy'
  } else if (hasWarnings) {
    status = 'degraded'
  } else {
    status = 'healthy'
  }
  
  return { status, checks }
}

// Configuration object with safe defaults
export const config = {
  // Database
  mongodb: {
    uri: process.env.MONGODB_URI || '',
  },
  
  // AI Service
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
  },
  
  // Authentication
  nextAuth: {
    secret: process.env.NEXTAUTH_SECRET || '',
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },
  
  // Environment
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  
  // Firebase (if configured)
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  },
  
  // Email (if configured)
  email: {
    host: process.env.EMAIL_SERVER_HOST || '',
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587', 10),
    user: process.env.EMAIL_SERVER_USER || '',
    password: process.env.EMAIL_SERVER_PASSWORD || '',
    from: process.env.EMAIL_FROM || '',
  },
}

// Export validation result for use in startup
export const envValidation = validateEnvironment()
