'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Header({ user }: { user: any }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/scan" className="text-xl font-bold text-gray-900">
              ScanThisSite
            </Link>
          </div>

          {user && (
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/scan"
                className="text-gray-700 hover:text-primary transition-colors"
              >
                Scan
              </Link>
              <Link
                href="/history"
                className="text-gray-700 hover:text-primary transition-colors"
              >
                History
              </Link>
              <button
                onClick={handleSignOut}
                className="text-gray-700 hover:text-primary transition-colors"
              >
                Sign out
              </button>
            </nav>
          )}

          {user && (
            <div className="md:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-gray-700 hover:text-primary"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {menuOpen ? (
                    <path d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          )}
        </div>

        {user && menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              href="/scan"
              className="block text-gray-700 hover:text-primary transition-colors py-2"
              onClick={() => setMenuOpen(false)}
            >
              Scan
            </Link>
            <Link
              href="/history"
              className="block text-gray-700 hover:text-primary transition-colors py-2"
              onClick={() => setMenuOpen(false)}
            >
              History
            </Link>
            <button
              onClick={() => {
                handleSignOut()
                setMenuOpen(false)
              }}
              className="block text-gray-700 hover:text-primary transition-colors py-2 text-left w-full"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

