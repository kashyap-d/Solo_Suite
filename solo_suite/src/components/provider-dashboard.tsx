"use client"
import { useState, useEffect } from "react"
import { AITaskboard } from "./ai-taskboard"
import { CalendarExport } from "./calender-export"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, DollarSign, Users, TrendingUp, Calendar, MessageSquare, Eye, FileText } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Briefcase, DollarSign, Users, TrendingUp, Calendar, MessageSquare, FileText } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase, type Task } from "@/lib/supabaseClient"
import { InvoiceGenerator } from "./invoice-generator"
import { Button } from "@/components/ui/button"

export function ProviderDashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchTasks()
    }
  }, [user])

  const fetchTasks = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error("Error fetching tasks:", error)
    }
  }


  return (
    <div className="space-y-6">
      {/* portfolio button */}
      <div className="flex justify-end gap-4">
        <Link href="/dashboard/portfolio">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            Manage Portfolio
          </Button>
        </Link>
        <Link href="/dashboard/jobs-marketplace">
          <Button variant="outline">
            <Briefcase className="h-4 w-4 mr-2" />
            View Current Jobs
          </Button>
        </Link>
        <Link href="/dashboard/my-applications">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            My Applications
          </Button>
        </Link>
      </div>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold">$2,450</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">98%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Taskboard */}
      <AITaskboard />

      {/* Portfolio Management */}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Portfolio Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/dashboard/portfolio">
              <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700">
                <Users className="h-4 w-4 mr-2" />
                Manage Portfolio
              </Button>
            </Link>
            <Link href="/dashboard/view-portfolio">
              <Button variant="outline" className="w-full sm:w-auto">
                <Eye className="h-4 w-4 mr-2" />
                View Public Profile
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Create and manage your professional portfolio to attract clients
          </p>
        </CardContent>
      </Card>
      {/* Calendar Export */}
      <CalendarExport tasks={tasks} />

      {/* Invoice Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Invoice Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <InvoiceGenerator />
            <Button variant="outline" className="w-full sm:w-auto">
              <FileText className="h-4 w-4 mr-2" />
              View Past Invoices
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-3">Create professional PDF invoices for your clients</p>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-lg">
              <div>
                <p className="font-medium">Website Redesign</p>
                <p className="text-sm text-muted-foreground">Due in 2 days</p>
              </div>
              <Badge variant="destructive">Urgent</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <div>
                <p className="font-medium">Logo Design</p>
                <p className="text-sm text-muted-foreground">Due in 5 days</p>
              </div>
              <Badge variant="secondary">Medium</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium">Sarah Johnson</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Great work on the initial designs! Can we schedule a call?
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium">Mike Chen</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
              <p className="text-sm text-muted-foreground">The project timeline looks perfect. Let's proceed!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
