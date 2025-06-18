"use client"

import { useState, useEffect } from "react"
import {
  generateTasks,
  updateTaskStatus,
  deleteTask,
  generateTaskSuggestions,
  generateProjectInsights,
  generateTaskBreakdown,
  generateProjectIdeas,
  testGroqConnection,
  debugGenerateTasks,
} from "@/actions/ai-actions"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Sparkles,
  Clock,
  CheckCircle,
  Play,
  Pause,
  Trash2,
  Plus,
  Lightbulb,
  AlertCircle,
  Zap,
  BarChart3,
  TrendingUp,
  Target,
  ChevronDown,
  ChevronRight,
  Rocket,
  TestTube,
  Bug,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase, type Task } from "@/lib/supabaseClient"

export function AITaskboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [insights, setInsights] = useState<any>(null)
  const [loadingInsights, setLoadingInsights] = useState(false)
  const [projectIdeas, setProjectIdeas] = useState<any[]>([])
  const [loadingIdeas, setLoadingIdeas] = useState(false)
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const [taskBreakdowns, setTaskBreakdowns] = useState<{ [key: string]: any[] }>({})
  const [message, setMessage] = useState("")
  const [testResult, setTestResult] = useState<any>(null)
  const [testLoading, setTestLoading] = useState(false)
  const [debugResult, setDebugResult] = useState<any>(null)
  const [debugLoading, setDebugLoading] = useState(false)
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

  const handleDebugGenerateTasks = async (formData: FormData) => {
    if (!user) return

    setDebugLoading(true)
    setDebugResult(null)
    const projectDescription = formData.get("project") as string

    try {
      const result = await debugGenerateTasks(projectDescription, user.id)
      setDebugResult(result)

      if (result.success && result.tasks) {
        setTasks((prevTasks) => [...result.tasks, ...prevTasks])
      }
    } catch (error) {
      console.error("Error in debug generate tasks:", error)
      setDebugResult({
        success: false,
        message: "Debug failed",
        logs: [`Error: ${error}`],
        error: String(error),
      })
    } finally {
      setDebugLoading(false)
    }
  }

  const handleTestGroq = async () => {
    setTestLoading(true)
    setTestResult(null)

    try {
      const result = await testGroqConnection()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        message: "Test failed with error",
        error: error,
      })
    } finally {
      setTestLoading(false)
    }
  }

  const handleGenerateTasks = async (formData: FormData) => {
    if (!user) return

    setLoading(true)
    setMessage("")
    const projectDescription = formData.get("project") as string

    try {
      const result = await generateTasks(projectDescription, user.id)
      if (result.success && result.tasks) {
        // Append new tasks to existing tasks instead of replacing
        setTasks((prevTasks) => [...result.tasks, ...prevTasks])
        if (result.message) {
          setMessage(result.message)
        }
      } else {
        setMessage(result.message || "Failed to generate tasks")
      }
    } catch (error) {
      console.error("Error generating tasks:", error)
      setMessage("An error occurred while generating tasks")
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateProjectIdeas = async (formData: FormData) => {
    setLoadingIdeas(true)
    const industry = formData.get("industry") as string
    const skillsInput = formData.get("skills") as string
    const skills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

    try {
      const result = await generateProjectIdeas(industry, skills)
      if (result.success) {
        setProjectIdeas(result.projectIdeas)
      }
    } catch (error) {
      console.error("Error generating project ideas:", error)
    } finally {
      setLoadingIdeas(false)
    }
  }

  const handleTaskBreakdown = async (task: Task) => {
    if (taskBreakdowns[task.id]) {
      // Toggle collapse if already expanded
      if (expandedTask === task.id) {
        setExpandedTask(null)
      } else {
        setExpandedTask(task.id)
      }
      return
    }

    try {
      const result = await generateTaskBreakdown(task.title, task.description)
      if (result.success) {
        setTaskBreakdowns((prev) => ({ ...prev, [task.id]: result.subtasks }))
        setExpandedTask(task.id)
      }
    } catch (error) {
      console.error("Error generating task breakdown:", error)
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

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId)
      setTasks(tasks.filter((task) => task.id !== taskId))
    } catch (error) {
      console.error("Error deleting task:", error)
    }
  }

  const handleGenerateSuggestions = async () => {
    if (!tasks.length) return

    setLoadingSuggestions(true)
    try {
      const currentTaskTitles = tasks.map((task) => task.title)
      const result = await generateTaskSuggestions(currentTaskTitles, "general project")

      if (result.success) {
        setSuggestions(result.suggestions)
      }
    } catch (error) {
      console.error("Error generating suggestions:", error)
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const handleGenerateInsights = async () => {
    if (!tasks.length) return

    setLoadingInsights(true)
    try {
      const result = await generateProjectInsights(tasks)
      if (result.success) {
        setInsights(result.insights)
      }
    } catch (error) {
      console.error("Error generating insights:", error)
    } finally {
      setLoadingInsights(false)
    }
  }

  const addSuggestionAsTask = async (suggestion: any) => {
    if (!user) return

    try {
      const taskToInsert = {
        user_id: user.id,
        title: suggestion.title,
        description: suggestion.description,
        priority: suggestion.priority,
        estimated_hours: suggestion.estimatedHours,
        status: "pending" as const,
      }

      const { data, error } = await supabase.from("tasks").insert([taskToInsert]).select()
      if (error) throw error

      if (data && data[0]) {
        setTasks((prevTasks) => [data[0], ...prevTasks])
        setSuggestions((prevSuggestions) => prevSuggestions.filter((s) => s.title !== suggestion.title))
      }
    } catch (error) {
      console.error("Error adding suggestion as task:", error)
      setMessage("Failed to add suggestion as task")
    }
  }

  const addProjectIdeaAsTasks = async (idea: any) => {
    if (!user) return

    try {
      // Create a main task for the project idea
      const mainTask = {
        user_id: user.id,
        title: idea.title,
        description: idea.description,
        priority: "high" as const,
        estimated_hours: 40, // Default estimate for a full project
        status: "pending" as const,
      }

      const { data, error } = await supabase.from("tasks").insert([mainTask]).select()
      if (error) throw error

      if (data && data[0]) {
        setTasks((prevTasks) => [data[0], ...prevTasks])
        setProjectIdeas((prevIdeas) => prevIdeas.filter((p) => p.title !== idea.title))
      }
    } catch (error) {
      console.error("Error adding project idea as task:", error)
      setMessage("Failed to add project idea as task")
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
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

  const completedTasks = tasks.filter((task) => task.status === "completed").length
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress").length
  const totalHours = tasks.reduce((sum, task) => sum + task.estimated_hours, 0)
  const completedHours = tasks
    .filter((task) => task.status === "completed")
    .reduce((sum, task) => sum + task.estimated_hours, 0)

  return (
    <div className="space-y-6">
      {/* Debug Section */}
      <Card className="bg-white dark:bg-gray-800 border-2 border-dashed border-orange-300 dark:border-orange-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-orange-600" />
            Debug Task Generation
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              Debug Mode
            </Badge>
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Debug version that shows detailed logs of what's happening during task generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleDebugGenerateTasks} className="space-y-4">
            <div>
              <Label htmlFor="debug-project" className="text-gray-700 dark:text-gray-300">
                Project Description (Debug Mode)
              </Label>
              <Textarea
                id="debug-project"
                name="project"
                placeholder="E.g., Build a simple website for a local restaurant"
                className="min-h-[80px] bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={debugLoading}
              className="w-full bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
            >
              {debugLoading ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Debug Generating...
                </>
              ) : (
                <>
                  <Bug className="mr-2 h-4 w-4" />
                  Debug Generate Tasks
                </>
              )}
            </Button>
          </form>

          {debugResult && (
            <div className="mt-6 space-y-4">
              <Alert className={debugResult.success ? "border-green-500" : "border-red-500"}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className={debugResult.success ? "text-green-700" : "text-red-700"}>
                      <strong>Status:</strong> {debugResult.success ? "✅ Success" : "❌ Failed"}
                    </p>
                    <p>
                      <strong>Message:</strong> {debugResult.message}
                    </p>
                    {debugResult.error && (
                      <p className="text-red-700">
                        <strong>Error:</strong> {debugResult.error}
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              {debugResult.logs && (
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Debug Logs:</h4>
                  <div className="space-y-1 text-sm font-mono">
                    {debugResult.logs.map((log: string, index: number) => (
                      <div key={index} className="text-gray-700 dark:text-gray-300">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Groq Connection Test */}
      <Card className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5 text-blue-600" />
            Groq API Connection Test
            <Badge variant="outline">Debug Tool</Badge>
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Test your Groq API connection to troubleshoot issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleTestGroq} disabled={testLoading} variant="outline" className="mb-4">
            {testLoading ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                Testing Connection...
              </>
            ) : (
              <>
                <TestTube className="mr-2 h-4 w-4" />
                Test Groq Connection
              </>
            )}
          </Button>

          {testResult && (
            <Alert className={testResult.success ? "border-green-500" : "border-red-500"}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className={testResult.success ? "text-green-700" : "text-red-700"}>
                    <strong>Status:</strong> {testResult.success ? "✅ Success" : "❌ Failed"}
                  </p>
                  <p>
                    <strong>Message:</strong> {testResult.message}
                  </p>
                  {testResult.response && (
                    <p>
                      <strong>Response:</strong> {testResult.response}
                    </p>
                  )}
                  {testResult.error && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-medium">Error Details</summary>
                      <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
                        {JSON.stringify(testResult.error, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Stats */}
      {tasks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{tasks.length}</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{inProgressTasks}</p>
                </div>
                <Play className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedTasks}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Project Ideas Generator */}
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-orange-600" />
            Project Ideas Generator
            <Badge className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
              Powered by Groq SDK
            </Badge>
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Get AI-generated project ideas based on your industry and skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleGenerateProjectIdeas} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="industry" className="text-gray-700 dark:text-gray-300">
                  Industry
                </Label>
                <Input
                  id="industry"
                  name="industry"
                  placeholder="e.g., Technology, Healthcare, Education"
                  className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                  required
                />
              </div>
              <div>
                <Label htmlFor="skills" className="text-gray-700 dark:text-gray-300">
                  Your Skills (comma-separated)
                </Label>
                <Input
                  id="skills"
                  name="skills"
                  placeholder="e.g., React, Design, Marketing, Writing"
                  className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loadingIdeas}
              className="w-full bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
            >
              {loadingIdeas ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Generating Ideas...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  Generate Project Ideas
                </>
              )}
            </Button>
          </form>

          {projectIdeas.length > 0 && (
            <div className="mt-6 space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Generated Project Ideas</h4>
              {projectIdeas.map((idea, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium text-gray-900 dark:text-white">{idea.title}</h5>
                    <div className="flex items-center gap-2">
                      <Badge className={getDifficultyColor(idea.difficulty)}>{idea.difficulty}</Badge>
                      <Button size="sm" onClick={() => addProjectIdeaAsTasks(idea)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add as Task
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{idea.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="font-medium">Timeframe:</span> {idea.estimatedTimeframe}
                    </div>
                    <div>
                      <span className="font-medium">Revenue:</span> {idea.potentialRevenue}
                    </div>
                    <div>
                      <span className="font-medium">Skills:</span> {idea.requiredSkills?.join(", ")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Task Generator */}
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            AI Task Generator
            <Badge className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">Groq SDK</Badge>
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Describe your project and let AI generate a detailed task list using Groq's lightning-fast LLM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleGenerateTasks} className="space-y-4">
            <div>
              <Label htmlFor="project" className="text-gray-700 dark:text-gray-300">
                Project Description
              </Label>
              <Textarea
                id="project"
                name="project"
                placeholder="E.g., Build a mobile app for food delivery, Create a marketing campaign for a new product, Design a website for a local business..."
                className="min-h-[100px] bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
            >
              {loading ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Generating Tasks with Groq...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate AI Tasks
                </>
              )}
            </Button>
          </form>

          {message && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* AI Insights */}
      {tasks.length > 0 && (
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Project Insights
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Get AI-powered analysis of your project progress and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGenerateInsights} disabled={loadingInsights} variant="outline" className="mb-4">
              {loadingInsights ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Project...
                </>
              ) : (
                <>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Generate Insights
                </>
              )}
            </Button>

            {insights && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Progress Analysis</h4>
                  <p className="text-blue-800 dark:text-blue-200">{insights.progressAnalysis}</p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-medium text-green-900 dark:text-green-300 mb-2">Recommendations</h4>
                  <ul className="space-y-1">
                    {insights.recommendations?.map((rec: string, index: number) => (
                      <li key={index} className="text-green-800 dark:text-green-200 flex items-start gap-2">
                        <span className="text-green-600 mt-1">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h4 className="font-medium text-purple-900 dark:text-purple-300 mb-2">Estimated Completion</h4>
                    <p className="text-purple-800 dark:text-purple-200">{insights.estimatedCompletion}</p>
                  </div>

                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <h4 className="font-medium text-orange-900 dark:text-orange-300 mb-2">Risk Factors</h4>
                    <ul className="space-y-1">
                      {insights.riskFactors?.map((risk: string, index: number) => (
                        <li key={index} className="text-orange-800 dark:text-orange-200 flex items-start gap-2">
                          <span className="text-orange-600 mt-1">⚠</span>
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Task Suggestions */}
      {tasks.length > 0 && (
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              Smart Suggestions
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Get AI-powered suggestions for additional tasks based on your current project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleGenerateSuggestions}
              disabled={loadingSuggestions}
              variant="outline"
              className="mb-4"
            >
              {loadingSuggestions ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Generating Suggestions...
                </>
              ) : (
                <>
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Get Task Suggestions
                </>
              )}
            </Button>

            {suggestions.length > 0 && (
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{suggestion.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{suggestion.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getPriorityColor(suggestion.priority)}>{suggestion.priority}</Badge>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {suggestion.estimatedHours}h estimated
                          </span>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => addSuggestionAsTask(suggestion)} className="ml-3">
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tasks List */}
      {tasks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Tasks</h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-700">
                {completedTasks}/{tasks.length} completed
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                {completedHours}/{totalHours}h done
              </Badge>
            </div>
          </div>
          <div className="grid gap-4">
            {tasks.map((task) => (
              <Card key={task.id} className="hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-lg text-gray-900 dark:text-white">{task.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                      {getStatusIcon(task.status)}
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">{task.description}</p>

                  {/* Task Breakdown */}
                  <div className="mb-3">
                    <Button variant="outline" size="sm" onClick={() => handleTaskBreakdown(task)} className="text-xs">
                      {expandedTask === task.id ? (
                        <ChevronDown className="h-3 w-3 mr-1" />
                      ) : (
                        <ChevronRight className="h-3 w-3 mr-1" />
                      )}
                      {taskBreakdowns[task.id] ? "Subtasks" : "Break Down Task"}
                    </Button>

                    {expandedTask === task.id && taskBreakdowns[task.id] && (
                      <div className="mt-2 pl-4 border-l-2 border-gray-200 dark:border-gray-600">
                        {taskBreakdowns[task.id].map((subtask: any, index: number) => (
                          <div key={index} className="py-1 text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">•</span> {subtask.subtask}
                            <span className="text-xs text-gray-500 ml-2">({subtask.estimatedMinutes}min)</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
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
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      )}
                      {task.status === "in_progress" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateTaskStatus(task.id, "completed")}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      )}
                      {task.status === "completed" && (
                        <Button variant="outline" size="sm" onClick={() => handleUpdateTaskStatus(task.id, "pending")}>
                          <Pause className="h-4 w-4 mr-1" />
                          Reopen
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
