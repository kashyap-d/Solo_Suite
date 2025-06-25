"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabaseClient"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"

interface ProviderWorkedWith {
  id: string
  client_id: string
  provider_id: string
  job_id: string
  created_at: string
  provider_profile?: { name: string }
  job?: { title: string }
  review?: { id: string, rating: number, review_text: string }
}

// Utility Functions for Avatars
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

export default function ProvidersWorkedWithPage() {
  const { user, userProfile } = useAuth()
  const [providers, setProviders] = useState<ProviderWorkedWith[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reviewInputs, setReviewInputs] = useState<{ [id: string]: { rating: number, review_text: string } }>({})
  const [submitting, setSubmitting] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const fetchProviders = async () => {
      setLoading(true)
      setError("")
      // Fetch providers worked with, join provider profile and job title
      const { data, error } = await supabase
        .from("providers_worked_with")
        .select(`*, provider_profile:profiles!provider_id(name), job:jobs(title)`) // join on provider_id and job_id
        .eq("client_id", user.id)
        .order("created_at", { ascending: false })
      if (error) {
        setError("Failed to load providers.")
        setProviders([])
      } else {
        setProviders(data as ProviderWorkedWith[])
      }
      setLoading(false)
    }
    fetchProviders()
  }, [user])

  const handleReviewChange = (id: string, field: "rating" | "review_text", value: any) => {
    setReviewInputs((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }))
  }

  const handleSubmitReview = async (provider: ProviderWorkedWith) => {
    setSubmitting(provider.id)
    const input = reviewInputs[provider.id]
    if (!input || !input.rating) return
    await supabase.from("reviews").insert({
      client_id: provider.client_id,
      provider_id: provider.provider_id,
      job_id: provider.job_id,
      rating: input.rating,
      review_text: input.review_text || "",
      created_at: new Date().toISOString()
    })
    setProviders((prev) => prev.map(p => p.id === provider.id ? { ...p, review: { ...input, id: "new" } } : p))
    setSubmitting(null)
  }

  if (userProfile?.role === "provider") return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => window.location.href = "/dashboard"}
            className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Return to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Providers Worked With</h1>
        </div>
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && providers.length === 0 && (
          <div className="text-muted-foreground">No providers yet.</div>
        )}
        <div className="space-y-4">
          {providers.map((provider) => (
            <Card key={provider.id} className="p-6 flex flex-col md:flex-row md:items-center md:justify-between shadow-lg border-0 bg-white dark:bg-gray-800 hover:scale-[1.01] transition-all duration-200">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${getGradientColors(
                    provider.provider_profile?.name || "Provider"
                  )} rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg transition-transform duration-300`}
                >
                  {getInitials(provider.provider_profile?.name || "P")}
                </div>
                <div>
                  <h3 className="font-semibold text-xl text-gray-900 dark:text-white mb-1">
                    {provider.provider_profile?.name || "Provider"}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Badge>{provider.job?.title || "Job"}</Badge>
                    <span>Worked on {new Date(provider.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 md:mt-0 md:text-right flex flex-col items-start md:items-end gap-2">
                {provider.review ? (
                  <Badge variant="secondary">Reviewed</Badge>
                ) : (
                  <form onSubmit={e => { e.preventDefault(); handleSubmitReview(provider) }} className="flex flex-col gap-2 w-full md:w-64">
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      placeholder="Rating (1-5)"
                      value={reviewInputs[provider.id]?.rating || ""}
                      onChange={e => handleReviewChange(provider.id, "rating", Number(e.target.value))}
                      className="w-full"
                      required
                    />
                    <Textarea
                      placeholder="Write a review (optional)"
                      value={reviewInputs[provider.id]?.review_text || ""}
                      onChange={e => handleReviewChange(provider.id, "review_text", e.target.value)}
                      className="w-full min-h-[60px]"
                    />
                    <Button type="submit" disabled={submitting === provider.id} className="w-full">
                      {submitting === provider.id ? "Submitting..." : "Submit Review"}
                    </Button>
                  </form>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 