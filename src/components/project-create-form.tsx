"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ProjectFormData, COMMON_ROLES, COMMON_TAGS } from '@/types/project'
import { createProject } from '@/lib/supabase/projects'
import { X, Plus, Users, Target, Tag, FileText, Lightbulb } from 'lucide-react'

const ProjectCreateForm: React.FC = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    tags: [],
    looking_for: [],
    max_team_size: 3
  })

  const [newTag, setNewTag] = useState('')
  const [newRole, setNewRole] = useState('')

  const handleInputChange = (field: keyof ProjectFormData, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }))
  }

  const addRole = () => {
    if (newRole.trim() && !formData.looking_for.includes(newRole.trim())) {
      setFormData(prev => ({
        ...prev,
        looking_for: [...prev.looking_for, newRole.trim()]
      }))
      setNewRole('')
    }
  }

  const addCommonRole = (role: string) => {
    if (!formData.looking_for.includes(role)) {
      setFormData(prev => ({
        ...prev,
        looking_for: [...prev.looking_for, role]
      }))
    }
  }

  const removeRole = (roleToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      looking_for: prev.looking_for.filter(role => role !== roleToRemove)
    }))
  }

  const addCommonTag = (tag: string) => {
    if (!formData.tags?.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag]
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validation
    if (!formData.title.trim()) {
      setError('Project title is required')
      setLoading(false)
      return
    }

    if (!formData.description.trim()) {
      setError('Project description is required')
      setLoading(false)
      return
    }

    if (formData.looking_for.length === 0) {
      setError('Please specify at least one role you are looking for')
      setLoading(false)
      return
    }

    if (formData.max_team_size < 3 || formData.max_team_size > 9) {
      setError('Team size must be between 3 and 9 members')
      setLoading(false)
      return
    }

    try {
      const project = await createProject(formData)
      
      if (project) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/protected/projects')
        }, 1500)
      } else {
        setError('Failed to create project. Please try again.')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Error creating project:', err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center">
        <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg text-center">
          <div className="text-lg font-semibold mb-2">Project Created Successfully!</div>
          <div>Redirecting to projects page...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full flex flex-col items-center justify-start py-8">
      <div className="w-full max-w-4xl px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <Lightbulb className="w-8 h-8" />
            Create New Project
          </h1>
          <p className="text-muted-foreground">
            Start a new project and find team members to collaborate with
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Project Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2 text-base font-semibold">
              <FileText className="w-4 h-4" />
              Project Title *
            </Label>
            <Input
              id="title"
              required
              placeholder="Enter your project title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="text-lg"
            />
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2 text-base font-semibold">
              <FileText className="w-4 h-4" />
              Project Description *
            </Label>
            <Textarea
              id="description"
              required
              placeholder="Describe your project, its goals, and what you want to build..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="min-h-32 text-base"
            />
          </div>

          {/* Team Size */}
          <div className="space-y-2">
            <Label htmlFor="max_team_size" className="flex items-center gap-2 text-base font-semibold">
              <Users className="w-4 h-4" />
              Maximum Team Size *
            </Label>
            <Select
              value={formData.max_team_size.toString()}
              onValueChange={(value) => handleInputChange('max_team_size', parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 7 }, (_, i) => i + 3).map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size} members
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Including yourself as the project leader
            </p>
          </div>

          {/* Looking For (Required Roles) */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2 text-base font-semibold">
              <Target className="w-4 h-4" />
              Looking For (Roles/Skills) *
            </Label>
            
            {/* Common Roles */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Quick Add Common Roles:</Label>
              <div className="flex flex-wrap gap-2">
                {COMMON_ROLES.slice(0, 8).map((role) => (
                  <Button
                    key={role}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addCommonRole(role)}
                    disabled={formData.looking_for.includes(role)}
                    className="text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {role}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Role Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Add a custom role or skill"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRole())}
              />
              <Button type="button" onClick={addRole} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Selected Roles */}
            {formData.looking_for.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Selected Roles:</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.looking_for.map((role, index) => (
                    <Badge key={index} variant="default" className="flex items-center gap-1">
                      {role}
                      <button
                        type="button"
                        onClick={() => removeRole(role)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Project Tags (Optional) */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2 text-base font-semibold">
              <Tag className="w-4 h-4" />
              Project Tags (Optional)
            </Label>
            
            {/* Common Tags */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Quick Add Common Tags:</Label>
              <div className="flex flex-wrap gap-2">
                {COMMON_TAGS.slice(0, 10).map((tag) => (
                  <Button
                    key={tag}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addCommonTag(tag)}
                    disabled={formData.tags?.includes(tag)}
                    className="text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {tag}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Tag Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Add a custom tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Selected Tags */}
            {formData.tags && formData.tags.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Selected Tags:</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {loading ? 'Creating Project...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProjectCreateForm