import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ApplicationDetail from '@/components/applications/application-detail';

interface ApplicationPageProps {
  params: {
    id: string
  }
}

export default async function ApplicationPage({ params }: ApplicationPageProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Fetch application
  const { data: application, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error || !application) {
    notFound()
  }

  return <ApplicationDetail application={application} />
}