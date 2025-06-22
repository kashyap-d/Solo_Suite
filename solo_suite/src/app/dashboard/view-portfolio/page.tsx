"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { supabase, type Portfolio } from "@/lib/supabaseClient"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Clock, DollarSign, Award, CheckCircle, ArrowLeft, Edit } from "lucide-react"
import { AuthGuard } from "@/components/auth-gaurd"

interface PortfolioWithProvider extends Portfolio {
  provider_name: string
  provider_email: string
}

// Utility Functions
const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

const getGradientColors = (name: string) => {
  const gradients = [
    "from-blue-500 to-purple-600",
    "from-green-500 to-blue-600",
    "from-purple-500 to-pink-600",
    "from-orange-500 to-red-600",
    "from-teal-500 to-green-600",
    "from-indigo-500 to-purple-600",
    "from-pink-500 to-rose-600",
    "from-yellow-500 to-orange-600"
  ]
  const index = name.charCodeAt(0) % gradients.length
  return gradients[index]
}

function ViewPortfolioContent() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [portfolio, setPortfolio] = useState<PortfolioWithProvider | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // Redirect clients to dashboard
    if (userProfile && userProfile.role === "client") {
      router.push("/dashboard")
      return
    }

    if (!user) return

    const fetchPortfolio = async () => {
      setLoading(true)
      setError("")
      
      const { data, error } = await supabase
        .from("portfolios")
        .select(`
          *,
          profiles!portfolios_provider_id_fkey (
            name,
            email
          )
        `)
        .eq("provider_id", user.id)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          setError("You haven't created a portfolio yet.")
        } else {
          setError("Failed to load portfolio.")
        }
        setPortfolio(null)
      } else {
        const transformed = {
          ...data,
          provider_name: data.profiles?.name || "Unknown Provider",
          provider_email: data.profiles?.email || ""
        }
        setPortfolio(transformed)
      }
      setLoading(false)
    }

    fetchPortfolio()
  }, [user, userProfile, router])

  if (userProfile?.role === "client") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Your Public Profile
              </h1>
              <p className="text-muted-foreground mt-1">
                This is exactly how clients see your portfolio
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push("/dashboard/portfolio")}
            className="bg-gradient-to-r from-indigo-700 to-purple-800 hover:shadow-2xl hover:brightness-105 shadow-lg transition-all duration-300"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Portfolio
          </Button>
        </div>

        {/* Portfolio Display */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your portfolio...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {error.includes("haven't created") ? "No Portfolio Found" : "Error Loading Portfolio"}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {error.includes("haven't created") 
                ? "You haven't created your portfolio yet. Create one to start attracting clients!"
                : error
              }
            </p>
            <Button
              onClick={() => router.push("/dashboard/portfolio")}
              className="bg-gradient-to-r from-indigo-700 to-purple-800 hover:shadow-2xl hover:brightness-105 shadow-lg transition-all duration-300"
            >
              <Edit className="h-4 w-4 mr-2" />
              Create Portfolio
            </Button>
          </div>
        )}

        {!loading && !error && portfolio && (
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden bg-white dark:bg-gray-800">
            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row">
                {/* Left Section */}
                <div className="flex-1 p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${getGradientColors(
                        portfolio.provider_name
                      )} rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg transition-transform duration-300 group-hover:scale-105`}
                    >
                      {getInitials(portfolio.provider_name)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors duration-300">
                          {portfolio.provider_name}
                        </h3>
                        {portfolio.is_verified && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-0">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-semibold text-lg text-indigo-600 dark:text-indigo-400 mb-2">
                        {portfolio.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                        {portfolio.bio}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 mb-4 text-sm">
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-semibold">
                        {portfolio.rating?.toFixed(1) ?? "5.0"}
                      </span>
                      <span className="text-gray-500">
                        ({portfolio.reviews_count ?? 0} reviews)
                      </span>
                    </div>
                    {portfolio.location && (
                      <div className="flex items-center gap-1 text-gray-500">
                        <MapPin className="h-4 w-4" />
                        {portfolio.location}
                      </div>
                    )}
                    {portfolio.availability && (
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="h-4 w-4" />
                        {portfolio.availability}
                      </div>
                    )}
                    {portfolio.experience_years && (
                      <div className="flex items-center gap-1 text-gray-500">
                        <Award className="h-4 w-4" />
                        {portfolio.experience_years} years exp.
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {portfolio.skills.slice(0, 5).map((skill, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-0 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {portfolio.skills.length > 5 && (
                      <Badge
                        variant="outline"
                        className="text-gray-500 border-gray-300 dark:border-gray-600 transition-all duration-200 hover:scale-105"
                      >
                        +{portfolio.skills.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Right Section */}
                <div className="lg:w-64 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-l border-gray-200 dark:border-gray-700">
                  <div className="text-center mb-4">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <p className="text-3xl font-bold text-green-600">
                        ${portfolio.hourly_rate ?? "0"}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">per hour</p>
                  </div>

                  <div className="space-y-3">
                    <Button className="w-full bg-gradient-to-r from-indigo-700 to-purple-800 hover:shadow-2xl hover:brightness-105 shadow-lg rounded-xl py-3 transition-all duration-300">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Portfolio
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl py-3 font-semibold transition-all duration-300 hover:scale-105"
                      onClick={() => router.push("/dashboard")}
                    >
                      Back to Dashboard
                    </Button>
                  </div>

                  {portfolio.education && (
                    <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:scale-105">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Education</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                        {portfolio.education}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function ViewPortfolioPage() {
  return (
    <AuthGuard requireAuth={true}>
      <ViewPortfolioContent />
    </AuthGuard>
  )
} 