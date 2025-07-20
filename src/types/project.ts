export interface Project {
  id: number
  created_at: string
  title: string
  description: string
  tags: string[] | null
  looking_for: string[]
  max_team_size: number
  leader: string
}

export interface ProjectFormData {
  title: string
  description: string
  tags?: string[]
  looking_for: string[]
  max_team_size: number
}

export interface ProjectMember {
  id: number
  project_id: number
  user_id: string
  joined_at: string
  role: 'leader' | 'member'
}

// Common skills/roles that users might be looking for
export const COMMON_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'UI/UX Designer',
  'Mobile Developer',
  'DevOps Engineer',
  'Data Scientist',
  'Machine Learning Engineer',
  'Product Manager',
  'QA Engineer',
  'Technical Writer',
  'Business Analyst',
  'Marketing Specialist',
  'Graphic Designer'
] as const

// Common project tags/categories
export const COMMON_TAGS = [
  'Web Development',
  'Mobile App',
  'Machine Learning',
  'AI',
  'Data Science',
  'Blockchain',
  'IoT',
  'Game Development',
  'E-commerce',
  'Social Media',
  'Education',
  'Healthcare',
  'Finance',
  'Entertainment',
  'Productivity',
  'Open Source',
  'Startup',
  'Research'
] as const