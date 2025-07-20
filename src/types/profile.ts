export interface Profile {
  id: string
  created_at: string
  username: string
  name: string | null
  bio: string | null
  skills: string[] | null
  linkedin_link: string | null
  github_link: string | null
  twitter_link: string | null
  branch: string | null
  batch_year: number | null
  portfolio_url: string | null
  avatar_url: string | null
  profile_completed: boolean
}

export interface ProfileFormData {
  username: string
  name?: string
  bio?: string
  skills?: string[]
  linkedin_link?: string
  github_link?: string
  twitter_link?: string
  branch?: string
  batch_year?: number
  portfolio_url?: string
  avatar_url?: string
}