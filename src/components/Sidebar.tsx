'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import {
  Home,
  FolderKanban,
  User,
  Menu,
  X,
  Bell,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import clsx from 'clsx' // or your own cn() function
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { LogoutButton } from './logout-button'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

const navLinks = [
  { href: '/protected/home', label: 'Home', icon: <Home className="w-4 h-4 mr-2" /> },
  { href: '/protected/my-projects', label: 'My Projects', icon: <FolderKanban className="w-4 h-4 mr-2" /> },
  { href: '/protected/notifications', label: 'Notifications', icon: <Bell className="w-4 h-4 mr-2" /> },
  { href: '/protected/profile', label: 'Profile', icon: <User className="w-4 h-4 mr-2" /> },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [profile, setProfile] = useState<{ username: string, name: string, avatar_url: string } | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('profiles')
          .select('username, name, avatar_url')
          .eq('id', user.id)
          .single()

        if (error) throw error

        setProfile({
          username: data.username,
          name: data.name || 'No Name',
          avatar_url: data.avatar_url || '',
        })
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error fetching profile:', error.message)
        } else {
          console.error('Error fetching profile:', error)
        }
        setProfile(null)
      }
    }

    fetchProfile()
  }, [])

  return (
    <>
      {/* Hamburger menu for mobile - positioned fixed */}
      {!isOpen && (
        <div className="md:hidden fixed top-4 left-4 z-50">
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} className="bg-black/80 text-white hover:bg-black/90">
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      )}
      {/* Sidebar */}
      <aside
        className={clsx(
          "min-h-screen fixed inset-y-0 left-0 z-40 w-64 bg-black/90 text-white flex flex-col py-6 px-4 transition-none border box-border",
          "md:static md:translate-x-0 md:flex",
          isOpen ? "block" : "hidden",
          "md:block"
        )}
      >
        {/* Close button for mobile */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
            <Image
              src="/logo.png" alt="logo"
              width={30}
              height={30}
            />
            <span className="text-2xl font-bold tracking-tight">ProjectCon</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
        <nav className="flex flex-col gap-4 flex-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
            >
              <Button
                variant={
                  pathname === link.href ? "secondary" : "ghost"
                }
                className='w-full text-left'
                onClick={() => setIsOpen(false)}
              >
                {link.icon}
                {link.label}
              </Button>

            </Link>
          ))}
          <Link href="/protected/create-project">
          <Button className='w-full' onClick={() => setIsOpen(false)}>+ Create Project</Button>
          </Link>
        </nav>
        {/* User section at the bottom */}
        <div className="mt-8 flex justify-between items-center gap-3 border rounded-xl p-2">
          <Avatar className='bg-muted'>
            <AvatarImage src={profile?.avatar_url || ""} alt="User" />
            <AvatarFallback>{profile?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p>{profile?.name}</p>
            <p>@{profile?.username}</p>
          </div>
          <LogoutButton />
        </div>
      </aside>
      {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
