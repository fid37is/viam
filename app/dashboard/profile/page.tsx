import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileSettings from '@/components/profile/profile-settings'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Profile Settings
        </h1>
        <p className="text-gray-600">
          Manage your account and job search preferences
        </p>
      </div>

      <ProfileSettings profile={profile} user={user} />
    </div>
  )
}