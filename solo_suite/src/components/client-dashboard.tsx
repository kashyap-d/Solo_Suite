"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase, type Job, type JobApplication } from "@/lib/supabaseClient"
import {
  Plus,
  Eye,
  Briefcase,
  Users,
  FileText,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface JobWithApplications extends Job {
  job_applications: {
    id: string
    created_at: string
    profiles: {
      name: string
    } | null
  }[]
}

export function ClientDashboard() {
  const [jobs, setJobs] = useState<JobWithApplications[]>([])
  const [recentApplications, setRecentApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { user } = useAuth()

  useEffect(() => {
    const fetchJobsAndApplications = async () => {
      if (!user) return
      setLoading(true)
      setError("")

      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          job_applications (
            id,
            created_at,
            profiles ( name )
          )
        `)
        .eq("client_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        setError("Failed to load your jobs and applications.")
        setJobs([])
      } else {
        const jobsData = data as JobWithApplications[]
        setJobs(jobsData)

        const allApplications = jobsData
          .flatMap(job =>
            job.job_applications.map(app => ({
              ...app,
              jobTitle: job.title,
              jobId: job.id,
            }))
          )
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)

        setRecentApplications(allApplications)
      }

      setLoading(false)
    }

    fetchJobsAndApplications()
  }, [user])

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "open":
        return "default"
      case "in_progress":
        return "secondary"
      case "completed":
        return "default"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Client Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your job postings and view applications
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/dashboard/freelancers">
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Find Freelancers
            </Button>
          </Link>
          <Link href="/dashboard/post-job">
            <Button className="bg-gradient-to-r from-indigo-700 to-purple-800 hover:shadow-2xl hover:brightness-105 shadow-lg transition-all duration-300">
              <Plus className="h-4 w-4 mr-2" />
              Post a New Job
            </Button>
          </Link>
        </div>
      </div>

      {/* My Job Postings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            My Job Postings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p>Loading jobs...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && jobs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">You haven't posted any jobs yet.</p>
              <Link href="/dashboard/post-job">
                <Button className="mt-4">Post a Job</Button>
              </Link>
            </div>
          )}
          <div className="space-y-4">
            {jobs.map(job => (
              <Card key={job.id} className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{job.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <Badge variant={getStatusVariant(job.status)} className="capitalize">
                      {job.status}
                    </Badge>
                    <span>{job.job_applications.length} Applications</span>
                    <span>Created on {new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/jobs-marketplace/${job.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Job
                    </Button>
                  </Link>
                  <Link href={`/dashboard/my-jobs/${job.id}/applications`}>
                    <Button size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      View Applications
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recent Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p>Loading applications...</p>}
          {!loading && recentApplications.length === 0 && (
            <p className="text-muted-foreground">No recent applications to display.</p>
          )}
          <div className="space-y-3">
            {recentApplications.map((app, index) => (
              <div
                key={app.id}
                className={`flex justify-between items-center p-4 rounded-xl border ${
                  index % 2 === 0
                    ? "bg-muted/40 dark:bg-muted/20"
                    : "bg-background dark:bg-muted/10"
                }`}
              >
                <div className="space-y-1">
                  <p className="font-semibold leading-none">
                    {app.profiles?.name || "Anonymous"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    applied for{" "}
                    <span className="font-medium text-primary">{app.jobTitle}</span>
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-xs text-muted-foreground">
                    {new Date(app.created_at).toLocaleDateString()}
                  </p>
                  <Link href={`/dashboard/my-jobs/${app.jobId}/applications`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
