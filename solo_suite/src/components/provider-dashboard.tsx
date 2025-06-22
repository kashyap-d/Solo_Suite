"use client"

import { useState, useEffect } from "react"
import { AITaskboard } from "./ai-taskboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, DollarSign, Users, Calendar, MessageSquare } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabaseClient"

export function ProviderDashboard() {
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalClients: 0,
    monthlyRevenue: 0
  })
  const [loading, setLoading] = useState(true)

  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchDashboardStats()
    }
  }, [user])

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
