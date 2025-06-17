"use client"

import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { ProviderDashboard } from "@/components/provider-dashboard"
import { ClientDashboard } from "@/components/client-dashboard"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { ModeToggle } from "@/components/theme-toggle"
import { AuthGuard } from "@/components/auth-gaurd"

function DashboardContent() {
  const { userProfile, signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  if (!userProfile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">SoloSuite</h1>
              <Badge className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                {userProfile.role === "provider" ? "Service Provider" : "Client"}
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <User className="h-4 w-4" />
                {userProfile.name}
              </div>
              <ModeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-gray-200 dark:border-gray-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {userProfile.role === "provider" ? <ProviderDashboard /> : <ClientDashboard />}
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AuthGuard requireAuth={true}>
      <DashboardContent />
    </AuthGuard>
  )
}
