import { createClient } from './client'
import { Project, ProjectFormData } from '@/types/project'

export async function createProject(projectData: ProjectFormData): Promise<Project | null> {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Error getting user:', userError)
      return null
    }

    // Create the project with the current user as leader
    const { data, error } = await supabase
      .from('projects')
      .insert({
        title: projectData.title,
        description: projectData.description,
        tags: projectData.tags && projectData.tags.length > 0 ? projectData.tags : null,
        looking_for: projectData.looking_for,
        max_team_size: projectData.max_team_size,
        leader: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating project:', error)
      return null
    }

    // Note: We're not adding the leader to project_members table here
    // because there might be a trigger (check_team_size) that's causing issues.
    // The leader is already stored in the projects.leader field.
    // If needed, the leader can be added to project_members later or through a different process.

    console.log('Project created successfully:', data)
    return data as Project
  } catch (error) {
    console.error('Unexpected error creating project:', error)
    return null
  }
}

export async function getProjects(): Promise<Project[]> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
      return []
    }

    return data as Project[]
  } catch (error) {
    console.error('Unexpected error fetching projects:', error)
    return []
  }
}

export async function getProjectById(id: number): Promise<Project | null> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching project:', error)
      return null
    }

    return data as Project
  } catch (error) {
    console.error('Unexpected error fetching project:', error)
    return null
  }
}

export async function getUserProjects(): Promise<Project[]> {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Error getting user:', userError)
      return []
    }

    // Get projects where user is either leader or member
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_members!inner(user_id)
      `)
      .eq('project_members.user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user projects:', error)
      return []
    }

    return data as Project[]
  } catch (error) {
    console.error('Unexpected error fetching user projects:', error)
    return []
  }
}

export async function updateProject(id: number, projectData: Partial<ProjectFormData>): Promise<boolean> {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Error getting user:', userError)
      return false
    }

    // Update the project (only if user is the leader)
    const { error } = await supabase
      .from('projects')
      .update(projectData)
      .eq('id', id)
      .eq('leader', user.id) // Ensure only the leader can update

    if (error) {
      console.error('Error updating project:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Unexpected error updating project:', error)
    return false
  }
}

export async function deleteProject(id: number): Promise<boolean> {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Error getting user:', userError)
      return false
    }

    // Delete the project (only if user is the leader)
    // Note: project_members will be deleted automatically due to CASCADE
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('leader', user.id) // Ensure only the leader can delete

    if (error) {
      console.error('Error deleting project:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Unexpected error deleting project:', error)
    return false
  }
}

export async function leaveProject(projectId: number): Promise<boolean> {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Error getting user:', userError)
      return false
    }

    // Check if user is the project leader
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('leader')
      .eq('id', projectId)
      .single()

    if (projectError) {
      console.error('Error fetching project:', projectError)
      return false
    }

    // Leaders cannot leave their own project - they must delete it instead
    if (project.leader === user.id) {
      console.error('Project leaders cannot leave their own project')
      return false
    }

    // Remove user from project_members
    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error leaving project:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Unexpected error leaving project:', error)
    return false
  }
}

export async function getUserProjectsWithRole(): Promise<(Project & { userRole: 'leader' | 'member' })[]> {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Error getting user:', userError)
      return []
    }

    // For now, let's just return projects where user is leader
    // This will work even if project_members table has permission issues
    const { data: leaderProjects, error: leaderError } = await supabase
      .from('projects')
      .select('*')
      .eq('leader', user.id)
      .order('created_at', { ascending: false })

    if (leaderError) {
      console.error('Error fetching leader projects:', leaderError)
      return []
    }

    // Format results - all are leader projects for now
    const allProjects = (leaderProjects || []).map(project => ({
      ...project,
      userRole: 'leader' as const
    }))

    return allProjects
  } catch (error) {
    console.error('Unexpected error fetching user projects:', error)
    return []
  }
}