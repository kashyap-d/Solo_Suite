"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Star, MapPin, Clock, Plus, Eye } from "lucide-react"
import { useEffect, useState } from "react"
import { supabase, type Portfolio } from "@/lib/supabaseClient"

export function ClientDashboard() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchPortfolios = async () => {
      setLoading(true)
      setError("")
      const { data, error } = await supabase
        .from("portfolios")
        .select("*")
        .eq("is_available", true)
        .eq("is_verified", true)
        .order("created_at", { ascending: false })
      if (error) {
        setError("Failed to load portfolios.")
        setPortfolios([])
      } else {
        setPortfolios(data || [])
      }
      setLoading(false)
    }
    fetchPortfolios()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Find Service Providers</h1>
          <p className="text-muted-foreground">Discover talented freelancers and creators for your projects</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Post a Job
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for services, skills, or providers..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                />
              </div>
            </div>
            <Button variant="outline">Filters</Button>
            <Button>Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Provider Cards */}
      <div className="grid gap-4">
        {loading && <div className="text-center text-muted-foreground py-8">Loading portfolios...</div>}
        {error && <div className="text-center text-red-500 py-8">{error}</div>}
        {!loading && !error && portfolios.length === 0 && (
          <div className="text-center text-muted-foreground py-8">No portfolios found.</div>
        )}
        {!loading && !error && portfolios.map((portfolio) => (
          <Card key={portfolio.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {portfolio.title
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{portfolio.title}</h3>
                      <p className="text-muted-foreground">{portfolio.bio}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {portfolio.rating?.toFixed(1) ?? "-"} ({portfolio.reviews_count ?? 0} reviews)
                    </div>
                    {portfolio.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {portfolio.location}
                      </div>
                    )}
                    {portfolio.availability && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {portfolio.availability}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {portfolio.skills.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">${portfolio.hourly_rate ?? "-"}</p>
                  <p className="text-sm text-muted-foreground">per hour</p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Profile
                    </Button>
                    <Button size="sm">Contact</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
