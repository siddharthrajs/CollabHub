"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getUserProjectsWithRole, leaveProject } from '@/lib/supabase/projects'
import { Project } from '@/types/project'
import { Eye, LogOut, Users, Calendar, Crown, User } from 'lucide-react'

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

        <div className="flex gap-4">
          {projects.map((project) => (
            <Card key={project.id} className=" hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 line-clamp-2">
                      {project.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      {project.userRole === 'leader' ? (
                        <Badge variant="default" className="flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          Leader
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          Member
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <CardDescription className="line-clamp-3">
                  {project.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="w-sm flex flex-col justify-between space-y-4">
                {/* Project Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {project.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Project Info */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>Max {project.max_team_size}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(project.created_at)}</span>
                  </div>
                </div>

                {/* Looking For */}
                {project.looking_for.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Looking for:</div>
                    <div className="flex flex-wrap gap-1">
                      {project.looking_for.slice(0, 2).map((role, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                      {project.looking_for.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{project.looking_for.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleViewProject(project.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Project
                  </Button>
                  
                  {project.userRole === 'member' && (
                    <Button
                      onClick={() => handleLeaveProject(project.id)}
                      variant="destructive"
                      size="sm"
                      disabled={leavingProject === project.id}
                      className="flex-1"
                    >
                      <LogOut className="w-4 h-4 mr-1" />
                      {leavingProject === project.id ? 'Leaving...' : 'Leave'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProjectsPage