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
import { motion } from "framer-motion"

function DashboardContent() {
  const { userProfile, signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  if (!userProfile) return null

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-300 opacity-30 dark:opacity-20 blur-3xl animate-pulse-slow z-0" />
      <div className="absolute top-60 right-[-100px] w-[400px] h-[400px] rounded-full bg-purple-300 opacity-30 dark:opacity-20 blur-3xl animate-pulse-slow z-0" />

      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 relative z-10"
      >
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
      </motion.header>

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {userProfile.role === "provider" ? <ProviderDashboard /> : <ClientDashboard />}
      </motion.main>
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
