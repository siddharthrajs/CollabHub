import { createClient } from './client'
import { Profile } from '@/types/profile'

export async function getProfile(): Promise<Profile | null> {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Error getting user:', userError)
      return null
    }

    // Fetch the profile data
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }

    return data as Profile
  } catch (error) {
    console.error('Unexpected error fetching profile:', error)
    return null
  }
}

export async function updateProfile(profileData: Partial<Profile>): Promise<boolean> {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Error getting user:', userError)
      return false
    }

    // Update the profile data
    const { error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', user.id)

    if (error) {
      console.error('Error updating profile:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Unexpected error updating profile:', error)
    return false
  }
}

export async function getProfileById(userId: string): Promise<Profile | null> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile by ID:', error)
      return null
    }

    return data as Profile
  } catch (error) {
    console.error('Unexpected error fetching profile by ID:', error)
    return null
  }
}