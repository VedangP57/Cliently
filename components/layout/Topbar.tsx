'use client'

import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { MobileSidebar } from '@/components/layout/MobileSidebar'

interface TopbarProps {
  user: {
    full_name: string | null
    email: string
    avatar_url: string | null
  }
}

export function Topbar({ user }: TopbarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card px-4 lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] p-0">
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          <MobileSidebar user={user} />
        </SheetContent>
      </Sheet>

      <div className="flex-1" />
    </header>
  )
}
