"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const ResetPassword = () => {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  // Get access token from URL hash or query
  React.useEffect(() => {
    // Supabase handles the session automatically on redirect
    // No-op, but could check for session here if needed
  }, [])

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match")
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      alert(error.message)
    } else {
      alert("Password updated! Please login.")
      window.location.href = "/auth/login"
    }
  }

  return (
    <div className='min-h-screen flex flex-col justify-center items-center'>
      <div className="w-full max-w-sm p-6 border rounded-2xl border-white flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label>New Password</Label>
          <Input
            type="password"
            placeholder='Enter new password'
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Confirm Password</Label>
          <Input
            type="password"
            placeholder='Enter new password'
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
        </div>
        <Button onClick={handleResetPassword} disabled={loading}>
          {loading ? "Setting..." : "Set Password"}
        </Button>
      </div>
    </div>
  )
}

export default ResetPassword
