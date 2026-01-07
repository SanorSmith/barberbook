'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    setUsers(data || [])
    setLoading(false)
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
    fetchUsers()
  }

  // Note: is_active field doesn't exist in profiles table
  // This function is kept for future use if needed
  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    // await supabase
    //   .from('profiles')
    //   .update({ is_active: isActive })
    //   .eq('id', userId)
    // fetchUsers()
    console.log('Toggle user status not implemented - is_active field not in schema')
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-cream mb-2">Manage Users</h1>
        <p className="text-silver">View and manage user accounts</p>
      </div>

      <div className="bg-charcoal border border-slate rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate">
              <th className="text-left py-3 px-4 text-silver">User</th>
              <th className="text-left py-3 px-4 text-silver">Email</th>
              <th className="text-left py-3 px-4 text-silver">Role</th>
              <th className="text-left py-3 px-4 text-silver">Phone</th>
              <th className="text-left py-3 px-4 text-silver">Joined</th>
              <th className="text-left py-3 px-4 text-silver">Status</th>
              <th className="text-left py-3 px-4 text-silver">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-slate/50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate flex items-center justify-center text-gold font-serif">
                      {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="text-cream font-medium">
                        {user.full_name || 'Not set'}
                      </div>
                      <div className="text-silver text-xs">
                        ID: {user.id.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-cream">{user.email}</td>
                <td className="py-3 px-4">
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                    className="bg-obsidian border border-slate text-cream px-2 py-1 rounded text-sm"
                  >
                    <option value="customer">Customer</option>
                    <option value="barber">Barber</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="py-3 px-4 text-cream">{user.phone || 'Not set'}</td>
                <td className="py-3 px-4 text-cream">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                    Active
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button className="text-gold hover:underline text-sm">
                      View
                    </button>
                    <button className="text-error hover:underline text-sm">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="bg-charcoal border border-slate rounded-xl p-8 text-center">
          <p className="text-silver">No users found</p>
        </div>
      )}
    </div>
  )
}
