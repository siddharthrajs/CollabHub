"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, LogOut, Users, Calendar, Crown, User, UserPlus } from 'lucide-react'
import { Project } from '@/types/project'

type ProjectWithRole = Project & { userRole: 'leader' | 'member' | 'pending' | null }

interface ProjectCardProps {
  project: ProjectWithRole;
  onViewProject: (projectId: number) => void;
  onLeaveProject?: (projectId: number) => void;
  onRequestToJoin?: (projectId: number) => void;
  leavingProject?: number | null;
  joiningProject?: number | null;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onViewProject,
  onLeaveProject,
  onRequestToJoin,
  leavingProject,
  joiningProject,
}) => {
  const router = useRouter()

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    router.push(`/protected/projects/${project.id}`)
  }

  const handleViewProject = () => {
    router.push(`/protected/projects/${project.id}`)
  }
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Card
      className="w-full max-w-sm hover:shadow-md transition-shadow flex flex-col h-full cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 line-clamp-2 leading-tight">
              {project.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              {project.userRole === 'leader' ? (
                <Badge variant="default" className="flex items-center gap-1 text-xs">
                  <Crown className="w-3 h-3" />
                  Leader
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                  <User className="w-3 h-3" />
                  Member
                </Badge>
              )}
              {project.userRole === 'pending' && (
                <Badge variant="outline" className="flex items-center gap-1 text-xs">
                  <UserPlus className="w-3 h-3" />
                  Request Sent
                </Badge>
              )}
            </div>
          </div>
        </div>
        <CardDescription className="line-clamp-3 text-sm">
          {project.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col justify-between flex-1 space-y-4 pt-0">
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
        <div className="flex flex-col gap-2 pt-2 mt-auto">
          {project.userRole === null && onRequestToJoin && (
             <Button
                onClick={() => onRequestToJoin(project.id)}
                variant="default"
                size="sm"
                className="w-full"
                disabled={joiningProject === project.id}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {joiningProject === project.id ? 'Sending Request...' : 'Request to Join'}
              </Button>
          )}
          
          {(project.userRole === 'leader' || project.userRole === 'member') && (
            <div className="flex gap-2">
              <Button
                onClick={handleViewProject}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
              
              {project.userRole === 'member' && onLeaveProject && (
                <Button
                  onClick={() => onLeaveProject(project.id)}
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
          )}

          {project.userRole === 'pending' && (
            <Button variant="outline" size="sm" disabled className="w-full">
              <UserPlus className="w-4 h-4 mr-2" />
              Request Sent
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ProjectCard