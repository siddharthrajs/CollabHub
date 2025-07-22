"use client"

import { getProfile } from '@/lib/supabase/profiles'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

const ProfilePage = () => {
  const router = useRouter()

  useEffect(() => {
    const redirectToUserProfile = async () => {
      try {
        const profileData = await getProfile()
        
        if (profileData) {
          // Redirect to the user's own dynamic profile page
          router.replace(`/protected/profile/${profileData.id}`)
        } else {
          // If no profile found, stay on this page or redirect to an error page
          console.error('No profile found')
        }
      } catch (err) {
        console.error('Error fetching profile for redirect:', err)
      }
    }

    redirectToUserProfile()
  }, [router])

  // Show a simple loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading your profile...</p>
      </div>
    </div>
  )
}

export default ProfilePage
