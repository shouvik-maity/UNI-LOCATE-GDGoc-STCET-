'use client'

import { useState, useEffect } from 'react'
import { auth } from '@/firebase/config'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signup = async (email: string, password: string, name: string, phone: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      // Create user in MongoDB
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseUid: result.user.uid,
          email,
          name,
          phone,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create user profile')
      }

      router.push('/explore')
      return result.user
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      router.push('/explore')
      return result.user
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      router.push('/')
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  return { user, loading, signup, login, logout }
}
