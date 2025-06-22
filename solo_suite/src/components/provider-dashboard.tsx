"use client"

import { useState, useEffect } from "react"
import { AITaskboard } from "./ai-taskboard"
import { CalendarExport } from "./calender-export"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, DollarSign, Users, TrendingUp, Calendar, MessageSquare, Eye, FileText } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { supabase, type Task } from "@/lib/supabaseClient"
import { InvoiceGenerator } from "./invoice-generator"
import { Button } from "@/components/ui/button"

export function ProviderDashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalClients: 0,
    monthlyRevenue: 0
  })
  const [loading, setLoading] = useState(true)

  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchTasks()
      fetchDashboardStats()
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

  const fetchDashboardStats = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Fetch all tasks for the user
      const { data: tasks, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)

      if (error) throw error

      // Calculate unique projects
      const uniqueProjects = new Set(
        (tasks || []).filter(task => task.project_name).map(task => task.project_name)
      )

      // Calculate unique clients
      const uniqueClients = new Set(
        (tasks || []).filter(task => task.client_email).map(task => task.client_email)
      )

      // Calculate monthly revenue (estimated based on completed tasks)
      const completedTasks = (tasks || []).filter(task => task.status === "completed")
      const monthlyRevenue = completedTasks.reduce((sum, task) => {
        // Assuming $50/hour average rate - you can adjust this
        return sum + (task.estimated_hours * 50)
      }, 0)

      setStats({
        activeProjects: uniqueProjects.size,
        totalClients: uniqueClients.size,
        monthlyRevenue: monthlyRevenue
      })
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* portfolio button */}
      <div className="flex justify-end gap-4">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold">
                  {loading ? "..." : stats.activeProjects}
                </p>
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
                <p className="text-2xl font-bold">
                  {loading ? "..." : `$${stats.monthlyRevenue.toLocaleString()}`}
                </p>
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
                <p className="text-2xl font-bold">
                  {loading ? "..." : stats.totalClients}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
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
            Manage your professional portfolio and showcase your work to potential clients.
          </p>
        </CardContent>
      </Card>

      {/* Invoice Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceGenerator />
        </CardContent>
      </Card>

      {/* Calendar Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendar Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CalendarExport tasks={tasks} />
        </CardContent>
      </Card>
    </div>
  )
}
