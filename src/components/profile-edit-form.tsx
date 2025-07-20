"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Profile, ProfileFormData } from '@/types/profile'
import { updateProfile } from '@/lib/supabase/profiles'
import { X, Plus, Upload, User, Calendar, Link, Code, FileText } from 'lucide-react'

interface ProfileEditFormProps {
  profile: Profile
  onProfileUpdate: (updatedProfile: Profile) => void
  trigger?: React.ReactNode
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ 
  profile, 
  onProfileUpdate, 
  trigger 
}) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState<ProfileFormData>({
    username: profile.username,
    name: profile.name || '',
    bio: profile.bio || '',
    skills: profile.skills || [],
    linkedin_link: profile.linkedin_link || '',
    github_link: profile.github_link || '',
    twitter_link: profile.twitter_link || '',
    branch: profile.branch || '',
    batch_year: profile.batch_year || undefined,
    portfolio_url: profile.portfolio_url || '',
    avatar_url: profile.avatar_url || ''
  })

  const [newSkill, setNewSkill] = useState('')

  // Reset form when profile changes or dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        username: profile.username,
        name: profile.name || '',
        bio: profile.bio || '',
        skills: profile.skills || [],
        linkedin_link: profile.linkedin_link || '',
        github_link: profile.github_link || '',
        twitter_link: profile.twitter_link || '',
        branch: profile.branch || '',
        batch_year: profile.batch_year || undefined,
        portfolio_url: profile.portfolio_url || '',
        avatar_url: profile.avatar_url || ''
      })
      setError(null)
      setSuccess(false)
    }
  }, [profile, open])

  const handleInputChange = (field: keyof ProfileFormData, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills?.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim().toUpperCase()]
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills?.filter(skill => skill !== skillToRemove) || []
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Prepare data for update (remove empty strings and convert to null)
      const updateData: Partial<Profile> = {
        username: formData.username,
        name: formData.name || null,
        bio: formData.bio || null,
        skills: formData.skills && formData.skills.length > 0 ? formData.skills : null,
        linkedin_link: formData.linkedin_link || null,
        github_link: formData.github_link || null,
        twitter_link: formData.twitter_link || null,
        branch: formData.branch || null,
        batch_year: formData.batch_year || null,
        portfolio_url: formData.portfolio_url || null,
        avatar_url: formData.avatar_url || null,
        profile_completed: true // Mark profile as completed when updated
      }

      const success = await updateProfile(updateData)
      
      if (success) {
        // Update the profile with new data
        const updatedProfile: Profile = {
          ...profile,
          ...updateData
        }
        onProfileUpdate(updatedProfile)
        setSuccess(true)
        setTimeout(() => {
          setOpen(false)
          setSuccess(false)
        }, 1500)
      } else {
        setError('Failed to update profile. Please try again.')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Error updating profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const branches = [
    'Computer Science Engineering',
    'Information Technology',
    'Electronics and Communication Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Biotechnology',
    'Aerospace Engineering',
    'Other'
  ]

  const currentYear = new Date().getFullYear()
  const batchYears = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Edit Profile</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Edit Profile
          </DialogTitle>
          <DialogDescription>
            Update your profile information. All fields are optional except username.
          </DialogDescription>
        </DialogHeader>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
            Profile updated successfully!
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto pr-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Section */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-lg">
              <Avatar className="w-20 h-20">
                <AvatarImage src={formData.avatar_url} />
                <AvatarFallback>
                  {formData.name ? formData.name.slice(0, 2).toUpperCase() : (formData.username || 'U').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Label htmlFor="avatar_url" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Profile Picture URL
                </Label>
                <Input
                  id="avatar_url"
                  type="url"
                  placeholder="https://example.com/your-photo.jpg"
                  value={formData.avatar_url}
                  onChange={(e) => handleInputChange('avatar_url', e.target.value)}
                />
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Username *
                </Label>
                <Input
                  id="username"
                  required
                  placeholder="your-username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  placeholder="Your Full Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Bio
              </Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="min-h-20"
              />
            </div>

            {/* Academic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branch" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Branch
                </Label>
                <Select value={formData.branch} onValueChange={(value) => handleInputChange('branch', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="batch_year" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Batch Year
                </Label>
                <Select
                  value={formData.batch_year?.toString()}
                  onValueChange={(value) => handleInputChange('batch_year', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch year" />
                  </SelectTrigger>
                  <SelectContent>
                    {batchYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Skills
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.skills && formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <Link className="w-4 h-4" />
                Social Links
              </Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin_link">LinkedIn Profile</Label>
                  <Input
                    id="linkedin_link"
                    type="url"
                    placeholder="https://linkedin.com/in/your-profile"
                    value={formData.linkedin_link}
                    onChange={(e) => handleInputChange('linkedin_link', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="github_link">GitHub Profile</Label>
                  <Input
                    id="github_link"
                    type="url"
                    placeholder="https://github.com/your-username"
                    value={formData.github_link}
                    onChange={(e) => handleInputChange('github_link', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter_link">Twitter Profile</Label>
                  <Input
                    id="twitter_link"
                    type="url"
                    placeholder="https://twitter.com/your-username"
                    value={formData.twitter_link}
                    onChange={(e) => handleInputChange('twitter_link', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolio_url">Portfolio Website</Label>
                  <Input
                    id="portfolio_url"
                    type="url"
                    placeholder="https://your-portfolio.com"
                    value={formData.portfolio_url}
                    onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
        
        {/* Sticky Footer with Update Button */}
        <div className="sticky bottom-0 left-0 right-0 bg-transparent border-t p-4 mt-4 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ProfileEditForm