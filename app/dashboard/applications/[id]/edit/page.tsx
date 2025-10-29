import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditApplicationForm from '@/components/applications/edit-application-form'

interface EditApplicationPageProps {
  params: {
    id: string
  }
}

export default async function EditApplicationPage({ params }: EditApplicationPageProps) {
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

  return <EditApplicationForm application={application} />
}