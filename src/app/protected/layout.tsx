import Sidebar from '@/components/Sidebar'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="md:hidden">
        <Sidebar />
      </div>
      <main className="flex-1 min-h-screen overflow-y-auto p-6 box-border w-full">
        {children}
      </main>
    </div>
  )
}
