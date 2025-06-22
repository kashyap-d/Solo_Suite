"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { supabase, type Job, type JobApplication, type UserProfile } from "@/lib/supabaseClient"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, 
  User,
  FileText,
  Check,
  X,
  Eye
} from "lucide-react"
import { AuthGuard } from "@/components/auth-gaurd"
import Link from "next/link"
import { toast } from "sonner"
import { sendApplicationAcceptedEmail } from "@/actions/email-actions.tsx"

interface ApplicationWithProvider extends JobApplication {
  profiles: UserProfile | null
}

interface JobWithApplications extends Job {
  job_applications: ApplicationWithProvider[]
}

const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'accepted':
      return 'secondary';
    case 'rejected':
      return 'destructive';
    case 'pending':
    default:
      return 'default';
  }
};

function ViewApplicationsContent() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const jobId = params.jobId as string
  
  const [job, setJob] = useState<Job | null>(null)
  const [applications, setApplications] = useState<ApplicationWithProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchJobAndApplications = useCallback(async () => {
    if (!user || !jobId) return
    setLoading(true)
    setError("")

    // Fetch job details
    const { data: jobData, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("client_id", user.id)
      .single()

    if (jobError || !jobData) {
      setError("Failed to load job details or you do not own this job.")
      setLoading(false)
      return
    }
    setJob(jobData)

    // Fetch applications with provider profiles
    const { data: appData, error: appError } = await supabase
      .from("job_applications")
      .select(`
        *,
        profiles (*)
      `)
      .eq("job_id", jobId)
    
    if (appError) {
      setError("Failed to load applications.")
    } else {
      setApplications(appData as ApplicationWithProvider[])
    }

    setLoading(false)
  }, [jobId, user])

  useEffect(() => {
    fetchJobAndApplications()
  }, [fetchJobAndApplications])

  const handleUpdateStatus = async (applicationId: string, status: "accepted" | "rejected") => {
    try {
      const { data, error } = await supabase
        .from("job_applications")
        .update({ status })
        .eq("id", applicationId)
        .select(`
          id,
          status,
          provider:profiles (id, email, name),
          job:jobs (id, title, client:profiles (id, name))
        `)
        .single();

      if (error) throw error;

      if (data) {
        setApplications(
          applications.map((app) => (app.id === applicationId ? { ...app, ...data } : app))
        );
        toast.success(`Application ${status === 'accepted' ? 'Accepted' : 'Rejected'}`, {
          description: "The provider has been notified.",
        });

        // Send email notification if accepted
        if (status === 'accepted' && data.provider?.email) {
          await sendApplicationAcceptedEmail(
            data.provider.email,
            data.provider.name || "Freelancer",
            data.job?.title || "a job",
            data.job?.client?.name || "The Client",
            `/dashboard/my-applications`
          );
        }
      }
    } catch (error: any) {
      toast.error("Error Updating Status", {
        description: `Failed to update application status: ${error.message}`,
      });
      // Revert the UI change if the update fails
      fetchJobAndApplications();
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
        <p className="text-muted-foreground">Loading applications...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">{error}</p>
        <Button onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Applications for {job?.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Review and manage applications for your job posting.
          </p>
        </div>

        <div className="space-y-6">
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground text-6xl mb-4">📂</div>
              <p className="text-muted-foreground text-lg">No applications received yet.</p>
            </div>
          ) : (
            applications.map((app) => (
              <Card key={app.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                          {app.profiles?.name || 'Anonymous Provider'}
                        </h3>
                        <Badge variant={getStatusBadgeVariant(app.status)} className="capitalize">
                          {app.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                        {app.proposal}
                      </p>
                    </div>

                    <div className="flex flex-col sm:items-end sm:text-right gap-2">
                      <div className="text-lg font-semibold text-green-600">
                        ${app.proposed_rate}
                      </div>
                      <div className="text-sm text-gray-500">
                        {app.estimated_duration}
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-2 items-stretch mt-4 md:mt-0 md:items-center">
                      <Link href={`/portfolio/${app.provider_id}`} target="_blank" className="flex-shrink-0">
                        <Button variant="outline" className="w-full">
                          <Eye className="h-4 w-4 mr-2"/>
                          View Portfolio
                        </Button>
                      </Link>
                      {app.status === 'pending' && (
                        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-2 w-full">
                          <Button 
                            variant="destructive" 
                            className="w-full" 
                            onClick={() => handleUpdateStatus(app.id, 'rejected')}
                          >
                            <X className="h-4 w-4 mr-2"/>
                            Reject
                          </Button>
                          <Button 
                            className="w-full" 
                            onClick={() => handleUpdateStatus(app.id, 'accepted')}
                          >
                            <Check className="h-4 w-4 mr-2"/>
                            Accept
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default function ViewApplicationsPage() {
  return (
    <AuthGuard requireAuth={true}>
      <ViewApplicationsContent />
    </AuthGuard>
  )
} 