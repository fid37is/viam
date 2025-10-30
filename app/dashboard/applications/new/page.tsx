import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AddApplicationForm from '@/components/applications/add-application-form';

export default async function NewApplicationPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Add New Application
        </h1>
        <p className="text-muted-foreground">
          Paste a job URL and we'll extract the details for you
        </p>
      </div>

      <AddApplicationForm userId={user.id} />
    </div>
  )
}