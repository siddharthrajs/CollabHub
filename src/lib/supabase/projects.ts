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
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Error getting user:', userError)
      return []
    }

    // Fetch projects where user is leader
    const { data: leaderProjects, error: leaderError } = await supabase
      .from('projects')
      .select('*')
      .eq('leader', user.id)

    if (leaderError) {
      console.error('Error fetching leader projects:', leaderError)
      // Decide if we should return here or try to fetch member projects
      return []
    }

    // Fetch project memberships for the user
    const { data: memberships, error: memberError } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', user.id)

    if (memberError) {
      console.error('Error fetching member projects:', memberError)
      // Decide if we should return or just use leader projects
      return []
    }
    
    const memberProjectIds = memberships ? memberships.map(m => m.project_id) : []
    
    let memberProjects: Project[] = []
    if (memberProjectIds.length > 0) {
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .in('id', memberProjectIds)

      if (projectsError) {
        console.error('Error fetching projects by ID:', projectsError)
        // We can either return [] or just continue with leader projects
        return []
      }
      memberProjects = projects || []
    }

    // Combine and deduplicate
    const projectsMap = new Map<number, Project & { userRole: 'leader' | 'member' }>()

    // Add leader projects
    if (leaderProjects) {
      leaderProjects.forEach(p => {
        projectsMap.set(p.id, { ...p, userRole: 'leader' })
      })
    }

    // Add member projects, avoiding duplicates
    if (memberProjects) {
      memberProjects.forEach(p => {
        if (!projectsMap.has(p.id)) {
          projectsMap.set(p.id, { ...p, userRole: 'member' })
        }
      })
    }

    const allProjects = Array.from(projectsMap.values())

    // Sort projects by creation date
    allProjects.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    
    return allProjects
  } catch (error) {
    console.error('Unexpected error fetching user projects:', error)
    return []
  }
}
export async function getProjectsWithUserStatus(): Promise<(Project & { userRole: 'leader' | 'member' | 'pending' | null })[]> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Fetch all projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (projectsError) {
      console.error('Error fetching projects:', projectsError)
      return []
    }

    if (!user) {
      // If user is not logged in, return all projects without a specific role
      return projects.map(p => ({ ...p, userRole: null }))
    }

    // 2. Fetch all of the user's memberships
    const { data: memberships, error: membersError } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', user.id)

    if (membersError) {
      console.error('Error fetching memberships:', membersError)
      // Continue without membership data
    }
    
    const memberProjectIds = new Set(memberships?.map(m => m.project_id) || [])

    // 3. Fetch all of the user's pending join requests
    const { data: joinRequests, error: requestsError } = await supabase
      .from('join_requests')
      .select('project_id')
      .eq('user_id', user.id)
      .eq('status', 'pending')

    if (requestsError) {
      console.error('Error fetching join requests:', requestsError)
      // Continue without request data
    }

    const pendingRequestProjectIds = new Set(joinRequests?.map(r => r.project_id) || [])

    // 4. Combine the data
    const projectsWithStatus = projects.map(project => {
      let userRole: 'leader' | 'member' | 'pending' | null = null
      if (project.leader === user.id) {
        userRole = 'leader'
      } else if (memberProjectIds.has(project.id)) {
        userRole = 'member'
      } else if (pendingRequestProjectIds.has(project.id)) {
        userRole = 'pending'
      }
      return { ...project, userRole }
    })

    return projectsWithStatus
  } catch (error) {
    console.error('Unexpected error in getProjectsWithUserStatus:', error)
    return []
  }
}
export async function requestToJoinProject(projectId: number): Promise<boolean> {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Error getting user:', userError)
      return false
    }

    // Check if a request already exists
    const { data: existingRequest, error: requestError } = await supabase
      .from('join_requests')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .single()

    if (requestError && requestError.code !== 'PGRST116') { // Ignore 'Range not satisifiable' error
      console.error('Error checking for existing requests:', requestError)
      return false
    }
    
    if (existingRequest) {
      console.log('Join request already exists.')
      // We can consider this a success, as the user's intent is met.
      return true
    }

    const { error } = await supabase
      .from('join_requests')
      .insert({
        project_id: projectId,
        user_id: user.id,
        status: 'pending'
      })

    if (error) {
      console.error('Error creating join request:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Unexpected error creating join request:', error)
    return false
  }
}

export async function getProjectWithMembers(projectId: number) {
  try {
    const supabase = createClient()
    
    // Get the project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError) {
      console.error('Error fetching project:', projectError)
      return null
    }

    // Get the leader's profile
    const { data: leaderProfile, error: leaderError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', project.leader)
      .single()

    if (leaderError) {
      console.error('Error fetching leader profile:', leaderError)
      return null
    }

    // Get project members with their profiles using a join
    const { data: members, error: membersError } = await supabase
      .from('project_members')
      .select(`
        id,
        project_id,
        user_id,
        joined_at,
        role,
        profiles!project_members_user_id_fkey (
          id,
          username,
          name,
          bio,
          skills,
          linkedin_link,
          github_link,
          twitter_link,
          portfolio_url,
          avatar_url,
          branch,
          batch_year,
          profile_completed,
          created_at
        )
      `)
      .eq('project_id', projectId)

    if (membersError) {
      console.error('Error fetching project members:', membersError)
      // Don't return null, just continue with empty members array
    }

    // Transform the data to match expected structure
    const transformedMembers = (members || []).map(member => ({
      ...member,
      profile: member.profiles
    }))

    return {
      ...project,
      leader_profile: leaderProfile,
      members: transformedMembers
    }
  } catch (error) {
    console.error('Unexpected error fetching project with members:', error)
    return null
  }
}