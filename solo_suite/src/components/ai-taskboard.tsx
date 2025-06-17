"use client"

import { useState, useEffect } from "react"
import { generateTasks, updateTaskStatus } from "@/actions/ai-actions"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Clock, CheckCircle, Play, Pause } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase, type Task } from "@/lib/supabaseClient"

export function AITaskboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
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

  const handleGenerateTasks = async (formData: FormData) => {
    if (!user) return

    setLoading(true)
    const projectDescription = formData.get("project") as string

    try {
      const result = await generateTasks(projectDescription, user.id)
      if (result.success) {
        alert("Tasks generated successfully!");
      }
    } catch (error) {
      console.error("Error generating tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTaskStatus = async (taskId: string, status: Task["status"]) => {
    try {
      await updateTaskStatus(taskId, status)
      setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status } : task)))
    } catch (error) {
      console.error("Error updating task:", error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "in_progress":
        return <Play className="h-4 w-4 text-blue-600" />
      default:
        return <Pause className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Task Generator
          </CardTitle>
          <CardDescription>Describe your project and let AI generate a detailed task list for you</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleGenerateTasks} className="space-y-4">
            <div>
              <Label htmlFor="project">Project Description</Label>
              <Textarea
                id="project"
                name="project"
                placeholder="Describe your project, goals, and what you want to accomplish..."
                className="min-h-[100px]"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Generating Tasks..." : "Generate AI Tasks"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {tasks.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Your Tasks</h3>
          <div className="grid gap-4">
            {tasks.map((task) => (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-lg">{task.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                      {getStatusIcon(task.status)}
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-3">{task.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {task.estimated_hours}h estimated
                    </div>
                    <div className="flex gap-2">
                      {task.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateTaskStatus(task.id, "in_progress")}
                        >
                          Start
                        </Button>
                      )}
                      {task.status === "in_progress" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateTaskStatus(task.id, "completed")}
                        >
                          Complete
                        </Button>
                      )}
                      {task.status === "completed" && (
                        <Button variant="outline" size="sm" onClick={() => handleUpdateTaskStatus(task.id, "pending")}>
                          Reopen
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
