import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

const ProtectedPage = () => {
  return (
    <div>
      <h1 className='text-4xl'>
        Alright, you&apos;re verified now. Let&apos;s log you in {"->"}
      </h1>
      <Link href="/auth/login">
        <Button>
          Login
        </Button>
      </Link>
    </div>
  )
}

export default ProtectedPage
