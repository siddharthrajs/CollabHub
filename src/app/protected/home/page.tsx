"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { getProjectsWithUserStatus, requestToJoinProject } from '@/lib/supabase/projects'
import { Project } from '@/types/project'
import ProjectCard from '@/components/ProjectCard'

type ProjectWithStatus = Project & { userRole: 'leader' | 'member' | 'pending' | null }

const HomePage = () => {
  const router = useRouter()
  const [projects, setProjects] = useState<ProjectWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [joiningProject, setJoiningProject] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const allProjects = await getProjectsWithUserStatus()
      setProjects(allProjects)
    } catch (err) {
      setError('Failed to load projects')
      console.error('Error loading projects:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewProject = (projectId: number) => {
    router.push(`/protected/projects/${projectId}`)
  }

  const handleRequestToJoin = async (projectId: number) => {
    try {
      setJoiningProject(projectId)
      const success = await requestToJoinProject(projectId)
      if (success) {
        // Optimistically update the UI
        setProjects(prev => prev.map(p => 
            p.id === projectId ? { ...p, userRole: 'pending' } : p
        ))
      } else {
        setError('Failed to send join request. Please try again.')
      }
    } catch (err) {
      setError('An unexpected error occurred while sending the join request.')
      console.error('Error requesting to join:', err)
    } finally {
      setJoiningProject(null)
    }
  }
  
  if (loading) {
    return (
      <div className="h-full flex flex-col justify-center items-center">
        <div className="text-lg">Loading projects...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex flex-col justify-center items-center">
        <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg text-center">
          <div className="text-lg font-semibold mb-2">Error</div>
          <div>{error}</div>
          <Button
            onClick={loadProjects}
            className="mt-4"
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Browse All Projects</h1>
          <p className="text-muted-foreground">
            Find an interesting project to join ({projects.length} total)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onViewProject={handleViewProject}
              onRequestToJoin={handleRequestToJoin}
              joiningProject={joiningProject}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default HomePage
