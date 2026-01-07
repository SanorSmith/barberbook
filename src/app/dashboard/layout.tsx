import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's profile with role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Get the current pathname
  const headersList = headers()
  const pathname = headersList.get('x-pathname') || ''

  // Only redirect if at the base dashboard and not already at the correct role page
  if (pathname === '/dashboard') {
    if (profile?.role === 'admin') {
      redirect('/dashboard/admin')
    } else if (profile?.role === 'barber') {
      redirect('/dashboard/barber')
    }
  }

  return <>{children}</>
}
