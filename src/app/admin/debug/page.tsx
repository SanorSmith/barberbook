'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DebugPage() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    runDiagnostics()
  }, [])

  const runDiagnostics = async () => {
    const diagnostics: any = {}

    // 1. Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    diagnostics.auth = {
      user: user ? { id: user.id, email: user.email } : null,
      error: authError
    }

    if (user) {
      // 2. Check profile and role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      diagnostics.profile = {
        data: profile,
        error: profileError
      }

      // 3. Check if services table exists and can be read
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .limit(5)
      
      diagnostics.servicesRead = {
        count: services?.length || 0,
        data: services,
        error: servicesError
      }

      // 4. Try to insert a test service
      const testService = {
        name: 'TEST SERVICE - DELETE ME',
        description: 'This is a test service',
        price: 10.00,
        duration: 30,
        category: 'HAIRCUT',
        icon: 'scissors',
        is_active: false
      }

      const { data: insertData, error: insertError } = await supabase
        .from('services')
        .insert(testService)
        .select()
      
      diagnostics.servicesInsert = {
        data: insertData,
        error: insertError
      }

      // 5. If insert succeeded, try to delete it
      if (insertData && insertData.length > 0) {
        const { error: deleteError } = await supabase
          .from('services')
          .delete()
          .eq('id', insertData[0].id)
        
        diagnostics.servicesDelete = {
          error: deleteError
        }
      }

      // 6. Check RLS policies
      const { data: policies, error: policiesError } = await supabase
        .rpc('pg_policies')
        .eq('tablename', 'services')
      
      diagnostics.rlsPolicies = {
        data: policies,
        error: policiesError
      }
    }

    setResults(diagnostics)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl">
      <h1 className="font-serif text-3xl text-cream mb-8">Database Diagnostics</h1>

      <div className="space-y-6">
        {/* Authentication */}
        <div className="bg-charcoal border border-slate rounded-lg p-6">
          <h2 className="text-cream font-semibold text-xl mb-4">1. Authentication</h2>
          <pre className="bg-obsidian p-4 rounded text-sm text-silver overflow-x-auto">
            {JSON.stringify(results.auth, null, 2)}
          </pre>
          {results.auth?.user && (
            <div className="mt-2 text-green-400">✅ User authenticated</div>
          )}
          {!results.auth?.user && (
            <div className="mt-2 text-red-400">❌ Not authenticated</div>
          )}
        </div>

        {/* Profile */}
        <div className="bg-charcoal border border-slate rounded-lg p-6">
          <h2 className="text-cream font-semibold text-xl mb-4">2. Profile & Role</h2>
          <pre className="bg-obsidian p-4 rounded text-sm text-silver overflow-x-auto">
            {JSON.stringify(results.profile, null, 2)}
          </pre>
          {results.profile?.data?.role === 'admin' && (
            <div className="mt-2 text-green-400">✅ User is admin</div>
          )}
          {results.profile?.data?.role !== 'admin' && (
            <div className="mt-2 text-red-400">❌ User is NOT admin (role: {results.profile?.data?.role})</div>
          )}
        </div>

        {/* Services Read */}
        <div className="bg-charcoal border border-slate rounded-lg p-6">
          <h2 className="text-cream font-semibold text-xl mb-4">3. Services Read Test</h2>
          <pre className="bg-obsidian p-4 rounded text-sm text-silver overflow-x-auto">
            {JSON.stringify(results.servicesRead, null, 2)}
          </pre>
          {!results.servicesRead?.error && (
            <div className="mt-2 text-green-400">✅ Can read services ({results.servicesRead?.count} found)</div>
          )}
          {results.servicesRead?.error && (
            <div className="mt-2 text-red-400">❌ Cannot read services</div>
          )}
        </div>

        {/* Services Insert */}
        <div className="bg-charcoal border border-slate rounded-lg p-6">
          <h2 className="text-cream font-semibold text-xl mb-4">4. Services Insert Test</h2>
          <pre className="bg-obsidian p-4 rounded text-sm text-silver overflow-x-auto">
            {JSON.stringify(results.servicesInsert, null, 2)}
          </pre>
          {!results.servicesInsert?.error && (
            <div className="mt-2 text-green-400">✅ Can insert services</div>
          )}
          {results.servicesInsert?.error && (
            <div className="mt-2 text-red-400">
              ❌ Cannot insert services
              <div className="mt-2 text-sm">
                Error: {results.servicesInsert?.error?.message}
              </div>
            </div>
          )}
        </div>

        {/* Services Delete */}
        {results.servicesDelete && (
          <div className="bg-charcoal border border-slate rounded-lg p-6">
            <h2 className="text-cream font-semibold text-xl mb-4">5. Services Delete Test</h2>
            <pre className="bg-obsidian p-4 rounded text-sm text-silver overflow-x-auto">
              {JSON.stringify(results.servicesDelete, null, 2)}
            </pre>
            {!results.servicesDelete?.error && (
              <div className="mt-2 text-green-400">✅ Can delete services</div>
            )}
            {results.servicesDelete?.error && (
              <div className="mt-2 text-red-400">❌ Cannot delete services</div>
            )}
          </div>
        )}

        {/* Summary */}
        <div className="bg-charcoal border border-gold rounded-lg p-6">
          <h2 className="text-cream font-semibold text-xl mb-4">Summary</h2>
          <div className="space-y-2">
            {!results.auth?.user && (
              <div className="text-red-400">❌ You are not logged in</div>
            )}
            {results.profile?.data?.role !== 'admin' && (
              <div className="text-red-400">❌ Your role is not admin. Run this SQL in Supabase:
                <pre className="bg-obsidian p-2 mt-2 rounded text-xs">
                  UPDATE profiles SET role = 'admin' WHERE id = '{results.auth?.user?.id}';
                </pre>
              </div>
            )}
            {results.servicesInsert?.error && (
              <div className="text-red-400">❌ RLS policies are blocking insert. Run the migration:
                <pre className="bg-obsidian p-2 mt-2 rounded text-xs">
                  {`-- In Supabase SQL Editor:\nALTER TABLE services ENABLE ROW LEVEL SECURITY;\n\nDROP POLICY IF EXISTS "Admins can manage services" ON services;\n\nCREATE POLICY "Admins can manage services" ON services\n  FOR ALL USING (\n    EXISTS (\n      SELECT 1 FROM profiles \n      WHERE profiles.id = auth.uid() \n      AND profiles.role = 'admin'\n    )\n  );`}
                </pre>
              </div>
            )}
            {results.auth?.user && results.profile?.data?.role === 'admin' && !results.servicesInsert?.error && (
              <div className="text-green-400 text-lg">✅ Everything is working! You should be able to manage services.</div>
            )}
          </div>
        </div>

        <button
          onClick={runDiagnostics}
          className="px-6 py-3 bg-gold hover:bg-gold-hover text-obsidian rounded-lg font-semibold transition-colors"
        >
          Run Diagnostics Again
        </button>
      </div>
    </div>
  )
}
