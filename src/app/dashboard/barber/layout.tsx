import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BarberSidebar from '@/components/BarberSidebar'

export default async function BarberDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is a barber
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'barber') {
    redirect('/dashboard')
  }

  return (
    <div className="flex h-screen">
      <BarberSidebar />
      <main className="flex-1 overflow-y-auto bg-obsidian">
        {children}
      </main>
    </div>
  )
}
