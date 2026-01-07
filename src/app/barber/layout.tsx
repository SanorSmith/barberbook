import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BarberSidebar from '@/components/barber/BarberSidebar'

export default async function BarberLayout({
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
    .select('*')
    .eq('id', user.id)
    .single()

  // Only allow barbers and admins
  if (profile?.role !== 'barber' && profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  // Get barber info
  const { data: barber } = await supabase
    .from('barbers')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-obsidian">
      <div className="flex">
        <BarberSidebar user={profile} barber={barber} />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
