// app/dashboard/applications/[id]/edit/page.tsx
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditApplicationForm from '@/components/applications/edit-application-form'

interface EditApplicationPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditApplicationPage({ params }: EditApplicationPageProps) {
  // Await params first
  const { id } = await params
  
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Fetch application - now use the awaited id
  const { data: application, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !application) {
    notFound()
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Edit Application
        </h1>
        <p className="text-muted-foreground">
          Update your job application details
        </p>
      </div>

      <EditApplicationForm application={application} />
    </div>
  )
}