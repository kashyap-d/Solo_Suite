"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { supabase, type Portfolio, type PortfolioFormData } from "@/lib/supabaseClient"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert } from "@/components/ui/alert"

export default function PortfolioPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState<PortfolioFormData>({
    title: "",
    bio: "",
    skills: [],
    location: "",
    hourly_rate: undefined,
    availability: "",
    experience_years: undefined,
    education: "",
    certifications: [],
    portfolio_links: [],
    profile_image_url: "",
    is_verified: false,
    is_available: true,
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [editing, setEditing] = useState(false)
  const [skillsInput, setSkillsInput] = useState("")
  const [certificationsInput, setCertificationsInput] = useState("")
  const [portfolioLinksInput, setPortfolioLinksInput] = useState("")
  const [fieldErrors, setFieldErrors] = useState({
    title: "",
    bio: "",
    skills: "",
    hourly_rate: "",
    experience_years: "",
  })

  // Fetch existing portfolio if any
  useEffect(() => {
    if (!user) return
    const fetchPortfolio = async () => {
      const { data } = await supabase
        .from("portfolios")
        .select("*")
        .eq("provider_id", user.id)
        .single()
      if (data) {
        setForm({ ...form, ...data })
        setSkillsInput((data.skills || []).join(", "))
        setCertificationsInput((data.certifications || []).join(", "))
        setPortfolioLinksInput((data.portfolio_links || []).join(", "))
        setEditing(true)
      }
    }
    fetchPortfolio()
    // eslint-disable-next-line
  }, [user])

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // For array fields like skills, certifications, portfolio_links
  const handleArrayChange = (name: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [name]: value.split(",").map((v) => v.trim()).filter(Boolean),
    }))
  }

  const validateForm = () => {
    const errors: any = {}
    if (!form.title.trim()) {
      errors.title = "Title is required."
    }
    if (!form.bio?.trim()) {
      errors.bio = "Bio is required."
    }
    const skillsArr = skillsInput.split(",").map((v) => v.trim()).filter(Boolean)
    if (skillsArr.length === 0) {
      errors.skills = "At least one skill is required."
    }
    if (form.hourly_rate !== undefined && form.hourly_rate !== null && Number(form.hourly_rate) < 0) {
      errors.hourly_rate = "Hourly rate must be 0 or greater."
    }
    if (form.experience_years !== undefined && form.experience_years !== null && Number(form.experience_years) < 0) {
      errors.experience_years = "Experience years must be 0 or greater."
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    if (!validateForm()) return
    setLoading(true)

    const formToSave = {
      ...form,
      skills: skillsInput.split(",").map((v) => v.trim()).filter(Boolean),
      certifications: certificationsInput.split(",").map((v) => v.trim()).filter(Boolean),
      portfolio_links: portfolioLinksInput.split(",").map((v) => v.trim()).filter(Boolean),
    }

    try {
      let res
      if (editing) {
        res = await supabase
          .from("portfolios")
          .update({ ...formToSave, updated_at: new Date().toISOString() })
          .eq("provider_id", user?.id)
      } else {
        res = await supabase
          .from("portfolios")
          .insert([{ ...formToSave, provider_id: user?.id }])
      }
      if (res.error) throw res.error
      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? "Edit" : "Create"} Your Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          {success ? (
            <Alert variant="default" className="mt-4">
              <div className="text-center sm:text-left mt-2 mb-4 font-medium">Portfolio saved successfully!</div>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSuccess(false)}
                  className="w-full sm:w-auto rounded-xl text-sm px-6 py-2 shadow-md transition-all"
                >
                  Modify Portfolio
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  className="w-full sm:w-auto rounded-xl text-sm px-6 py-2 shadow-md transition-all"
                >
                  Return to Dashboard
                </Button>
              </div>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input name="title" value={form.title} onChange={handleChange} />
                {fieldErrors.title && <div className="text-red-500 text-sm mt-1">{fieldErrors.title}</div>}
              </div>
              <div>
                <Label>Bio</Label>
                <Textarea name="bio" value={form.bio ?? ""} onChange={handleChange} />
                {fieldErrors.bio && <div className="text-red-500 text-sm mt-1">{fieldErrors.bio}</div>}
              </div>
              <div>
                <Label>Skills (comma separated)</Label>
                <Input
                  name="skills"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                />
                {fieldErrors.skills && <div className="text-red-500 text-sm mt-1">{fieldErrors.skills}</div>}
              </div>
              <div>
                <Label>Location</Label>
                <Input name="location" value={form.location} onChange={handleChange} />
              </div>
              <div>
                <Label>Hourly Rate (USD)</Label>
                <Input
                  name="hourly_rate"
                  type="number"
                  value={form.hourly_rate ?? ""}
                  onChange={handleChange}
                  min={0}
                />
                {fieldErrors.hourly_rate && <div className="text-red-500 text-sm mt-1">{fieldErrors.hourly_rate}</div>}
              </div>
              <div>
                <Label>Availability</Label>
                <Input name="availability" value={form.availability} onChange={handleChange} />
              </div>
              <div>
                <Label>Years of Experience</Label>
                <Input
                  name="experience_years"
                  type="number"
                  value={form.experience_years ?? ""}
                  onChange={handleChange}
                  min={0}
                />
                {fieldErrors.experience_years && <div className="text-red-500 text-sm mt-1">{fieldErrors.experience_years}</div>}
              </div>
              <div>
                <Label>Education</Label>
                <Input name="education" value={form.education} onChange={handleChange} />
              </div>
              <div>
                <Label>Certifications (comma separated)</Label>
                <Input
                  name="certifications"
                  value={certificationsInput}
                  onChange={(e) => setCertificationsInput(e.target.value)}
                />
              </div>
              <div>
                <Label>Portfolio Links (comma separated)</Label>
                <Input
                  name="portfolio_links"
                  value={portfolioLinksInput}
                  onChange={(e) => setPortfolioLinksInput(e.target.value)}
                />
              </div>
              <div>
                <Label>Profile Image URL</Label>
                <Input name="profile_image_url" value={form.profile_image_url} onChange={handleChange} />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto rounded-xl text-sm px-6 py-2 shadow-md transition-all"
                >
                  {loading ? "Saving..." : editing ? "Update Portfolio" : "Create Portfolio"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  className="w-full sm:w-auto rounded-xl text-sm px-6 py-2 shadow-md transition-all"
                >
                  Return to Dashboard
                </Button>
              </div>
              {error && (
                <Alert variant="destructive" className="mt-4">
                  {error}
                </Alert>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}