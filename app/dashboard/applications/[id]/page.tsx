import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ApplicationDetail from '@/components/applications/application-detail'

interface ApplicationPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ApplicationPage({ params }: ApplicationPageProps) {
  const supabase = await createClient()
  const { id } = await params

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
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !application) {
    notFound()
  }

  return <ApplicationDetail application={application} />
}