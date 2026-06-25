export type ObjectType =
  | 'thought' | 'research' | 'project' | 'person'
  | 'event'   | 'link'     | 'document' | 'protocol'
  | 'device'  | 'software' | 'world'

export interface KefirObject {
  id: string
  user_id: string
  type: ObjectType
  title: string
  content: string | null
  content_html: string | null
  tags: string[]
  status: string
  parent_id: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface UserProfile {
  id: string
  auth_id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

export const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
