"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { getUserProjectsWithRole, leaveProject } from '@/lib/supabase/projects'
import { Project } from '@/types/project'
import ProjectCard from '@/components/ProjectCard'

type ProjectWithRole = Project & { userRole: 'leader' | 'member' }

const ProjectsPage = () => {
  const router = useRouter()
  const [projects, setProjects] = useState<ProjectWithRole[]>([])
  const [loading, setLoading] = useState(true)
  const [leavingProject, setLeavingProject] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const userProjects = await getUserProjectsWithRole()
      setProjects(userProjects)
    } catch (err) {
      setError('Failed to load projects')
      console.error('Error loading projects:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewProject = (projectId: number) => {
    // Navigate to project details page (you can implement this route later)
    router.push(`/protected/projects/${projectId}`)
  }

  const handleLeaveProject = async (projectId: number) => {
    if (!confirm('Are you sure you want to leave this project? This action cannot be undone.')) {
      return
    }

    try {
      setLeavingProject(projectId)
      const success = await leaveProject(projectId)
      
      if (success) {
        // Remove the project from the local state
        setProjects(prev => prev.filter(p => p.id !== projectId))
      } else {
        setError('Failed to leave project. Please try again.')
      }
    } catch (err) {
      setError('An unexpected error occurred while leaving the project.')
      console.error('Error leaving project:', err)
    } finally {
      setLeavingProject(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col justify-center items-center">
        <div className="text-lg">Loading your projects...</div>
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

  if (projects.length === 0) {
    return (
      <div className="h-full flex flex-col justify-center items-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📋</div>
          <div className="text-xl font-semibold mb-2">No Projects Yet</div>
          <div className="text-muted-foreground mb-6">
            You haven&apos;t joined or created any projects yet.
          </div>
          <Button
            onClick={() => router.push('/protected/create-project')}
            className="mr-2"
          >
            Create Project
          </Button>
          <Button
            onClick={() => router.push('/protected/home')}
            variant="outline"
          >
            Browse Projects
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Projects</h1>
          <p className="text-muted-foreground">
            Projects you&apos;ve created or joined ({projects.length} total)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onViewProject={handleViewProject}
              onLeaveProject={handleLeaveProject}
              leavingProject={leavingProject}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProjectsPage