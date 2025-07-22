"use client"

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getProfileById } from '@/lib/supabase/profiles'
import { getProfile } from '@/lib/supabase/profiles'
import { Profile } from '@/types/profile'
import { Github, Linkedin, Twitter, ExternalLink, Calendar, User, ArrowLeft } from 'lucide-react'
import ProfileEditForm from '@/components/profile-edit-form'
import { useParams, useRouter } from 'next/navigation'

import React, { useState, useEffect } from 'react'

const DynamicProfilePage = () => {
  const params = useParams()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageOpen, setImageOpen] = useState<boolean>(false)

  const userId = params.id as string
  const isOwnProfile = currentUser?.id === userId

  const openImage = () => setImageOpen(!imageOpen)

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile)
  }

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch the profile to display
        const profileData = await getProfileById(userId)
        
        // Fetch current user's profile to check if it's their own profile
        const currentUserData = await getProfile()
        
        if (profileData) {
          setProfile(profileData)
        } else {
          setError('Profile not found')
        }
        
        if (currentUserData) {
          setCurrentUser(currentUserData)
        }
      } catch (err) {
        setError('Failed to load profile')
        console.error('Error fetching profile:', err)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchProfiles()
    }
  }, [userId])

  if (loading) {
    return (
      <div className='min-h-full flex flex-col justify-center items-center'>
        <div className="w-full flex justify-between m-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className='text-2xl'>Profile</h1>
          </div>
          <Button disabled>Loading...</Button>
        </div>
        <Card className='w-full max-w-full border-white bg-transparent overflow-y-auto'>
          <CardHeader>
            <div className='flex flex-col sm:flex-row items-center gap-4 justify-center w-full border'>
              <div className="flex flex-col items-center sm:items-start">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="size-20 rounded-full" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className='min-h-full flex flex-col justify-center items-center'>
        <div className="w-full flex justify-between m-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className='text-2xl'>Profile</h1>
          </div>
        </div>
        <Card className='w-full max-w-full border-white bg-transparent overflow-y-auto'>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-red-500 mb-4">{error || 'Profile not found'}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='max-h-full flex flex-col justify-center items-center'>
      <div className="w-full flex justify-between m-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className='text-2xl'>
            {isOwnProfile ? 'Your Profile' : `${profile.name || profile.username}'s Profile`}
          </h1>
        </div>
        {isOwnProfile && (
          <ProfileEditForm
            profile={profile}
            onProfileUpdate={handleProfileUpdate}
          />
        )}
      </div>
      <Card className='w-full max-w-full max-h-screen border-white bg-transparent overflow-y-auto'>
        <CardHeader>
          <div className='flex flex-col sm:flex-row items-center gap-4 justify-center w-full border rounded-lg p-4'>
            <div className="flex flex-col items-center sm:items-start">
              <h2 className="text-xl font-semibold">{profile.name || 'No Name'}</h2>
              <p className="text-muted-foreground">@{profile.username}</p>
              {!profile.profile_completed && (
                <Badge variant="outline" className="mt-2 text-yellow-600 border-yellow-600">
                  Profile Incomplete
                </Badge>
              )}
            </div>
            <Avatar className='bg-muted size-20 cursor-pointer' onClick={openImage}>
              <AvatarImage src={profile.avatar_url || ""} />
              <AvatarFallback>
                {profile.name ? profile.name.slice(0, 2).toUpperCase() : (profile.username || 'U').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:flex-wrap gap-6 md:gap-8">
            {/* Left Column */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Bio Section */}
              {profile.bio && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    About
                  </h3>
                  <p className="text-muted-foreground">{profile.bio}</p>
                </div>
              )}

              {/* Academic Info */}
              {(profile.branch || profile.batch_year) && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Academic Information
                  </h3>
                  <div className="space-y-2">
                    {profile.branch && (
                      <p><span className="font-medium">Branch:</span> {profile.branch}</p>
                    )}
                    {profile.batch_year && (
                      <p><span className="font-medium">Batch Year:</span> {profile.batch_year}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Skills Section */}
              {profile.skills && profile.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="flex-1 min-w-0 space-y-6 md:max-w-sm">
              {/* Social Links */}
              {(profile.linkedin_link || profile.github_link || profile.twitter_link || profile.portfolio_url) && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Links</h3>
                  <div className="space-y-2">
                    {profile.linkedin_link && (
                      <a
                        href={profile.linkedin_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn Profile
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {profile.github_link && (
                      <a
                        href={profile.github_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        <Github className="w-4 h-4" />
                        GitHub Profile
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {profile.twitter_link && (
                      <a
                        href={profile.twitter_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-600 transition-colors"
                      >
                        <Twitter className="w-4 h-4" />
                        Twitter Profile
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {profile.portfolio_url && (
                      <a
                        href={profile.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Portfolio Website
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Profile Metadata */}
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Profile created: {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DynamicProfilePage