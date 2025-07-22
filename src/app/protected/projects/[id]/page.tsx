"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  Crown, 
  Github, 
  Linkedin, 
  Twitter, 
  Globe,
} from 'lucide-react'
import { Project } from '@/types/project'
import { Profile } from '@/types/profile'
import { getProjectWithMembers } from '@/lib/supabase/projects'

interface ProjectMemberWithProfile {
  id: number
  project_id: number
  user_id: string
  joined_at: string
  role: 'leader' | 'member'
  profile: Profile
}

interface ProjectWithMembers extends Project {
  members: ProjectMemberWithProfile[]
  leader_profile: Profile
}

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<ProjectWithMembers | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const projectId = parseInt(params.id as string)

  useEffect(() => {
    async function fetchProject() {
      try {
        setLoading(true)
        const projectData = await getProjectWithMembers(projectId)
        
        if (!projectData) {
          setError('Project not found')
          return
        }
        
        setProject(projectData)
      } catch (err) {
        console.error('Error fetching project:', err)
        setError('Failed to load project')
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      fetchProject()
    }
  }, [projectId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const ProfileLinks = ({ profile }: { profile: Profile }) => (
    <div className="flex gap-2">
      {profile.github_link && (
        <Button
          variant="outline"
          size="sm"
          asChild
        >
          <a href={profile.github_link} target="_blank" rel="noopener noreferrer">
            <Github className="w-4 h-4" />
          </a>
        </Button>
      )}
      {profile.linkedin_link && (
        <Button
          variant="outline"
          size="sm"
          asChild
        >
          <a href={profile.linkedin_link} target="_blank" rel="noopener noreferrer">
            <Linkedin className="w-4 h-4" />
          </a>
        </Button>
      )}
      {profile.twitter_link && (
        <Button
          variant="outline"
          size="sm"
          asChild
        >
          <a href={profile.twitter_link} target="_blank" rel="noopener noreferrer">
            <Twitter className="w-4 h-4" />
          </a>
        </Button>
      )}
      {profile.portfolio_url && (
        <Button
          variant="outline"
          size="sm"
          asChild
        >
          <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer">
            <Globe className="w-4 h-4" />
          </a>
        </Button>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading project...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive mb-4">{error || 'Project not found'}</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Project Details</h1>
      </div>

      {/* Project Information */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{project.title}</CardTitle>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Created {formatDate(project.created_at)}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>Max {project.max_team_size} members</span>
                </div>
              </div>
            </div>
          </div>
          <CardDescription className="text-base leading-relaxed">
            {project.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Looking For */}
          {project.looking_for.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Looking for</h3>
              <div className="flex flex-wrap gap-2">
                {project.looking_for.map((role, index) => (
                  <Badge key={index} variant="secondary">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Leader */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Project Leader
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <div
              className="cursor-pointer"
              onClick={() => router.push(`/protected/profile/${project.leader_profile.id}`)}
            >
              <Avatar className="w-16 h-16 hover:ring-2 hover:ring-primary transition-all">
                <AvatarImage src={project.leader_profile.avatar_url || undefined} />
                <AvatarFallback>
                  {getInitials(project.leader_profile.name || project.leader_profile.username)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4
                    className="font-semibold text-lg cursor-pointer hover:text-primary transition-colors"
                    onClick={() => router.push(`/protected/profile/${project.leader_profile.id}`)}
                  >
                    {project.leader_profile.name || project.leader_profile.username}
                  </h4>
                  <p className="text-sm text-muted-foreground">@{project.leader_profile.username}</p>
                </div>
                <ProfileLinks profile={project.leader_profile} />
              </div>
              {project.leader_profile.bio && (
                <p className="text-sm text-muted-foreground mb-3">{project.leader_profile.bio}</p>
              )}
              {project.leader_profile.skills && project.leader_profile.skills.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {project.leader_profile.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      {project.members.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Members ({project.members.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {project.members.map((member, index) => (
                <div key={member.id}>
                  <div className="flex items-start gap-4">
                    <div
                      className="cursor-pointer"
                      onClick={() => router.push(`/protected/profile/${member.profile.id}`)}
                    >
                      <Avatar className="w-12 h-12 hover:ring-2 hover:ring-primary transition-all">
                        <AvatarImage src={member.profile.avatar_url || undefined} />
                        <AvatarFallback>
                          {getInitials(member.profile.name || member.profile.username)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h5
                            className="font-medium cursor-pointer hover:text-primary transition-colors"
                            onClick={() => router.push(`/protected/profile/${member.profile.id}`)}
                          >
                            {member.profile.name || member.profile.username}
                          </h5>
                          <p className="text-sm text-muted-foreground">@{member.profile.username}</p>
                          <p className="text-xs text-muted-foreground">
                            Joined {formatDate(member.joined_at)}
                          </p>
                        </div>
                        <ProfileLinks profile={member.profile} />
                      </div>
                      {member.profile.bio && (
                        <p className="text-sm text-muted-foreground mb-2">{member.profile.bio}</p>
                      )}
                      {member.profile.skills && member.profile.skills.length > 0 && (
                        <div>
                          <p className="text-xs font-medium mb-1">Skills:</p>
                          <div className="flex flex-wrap gap-1">
                            {member.profile.skills.map((skill, skillIndex) => (
                              <Badge key={skillIndex} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {index < project.members.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}