"use server"
import { supabase } from "@/lib/supabaseClient"

export async function generateTasks(projectDescription: string, userId: string) {
    const tasks = JSON.parse("this is a placeholder for the generated tasks") // Replace with actual AI-generated tasks

    // Save tasks to Supabase
    const tasksToInsert = tasks.map((task: any) => ({
      user_id: userId,
      title: task.title,
      description: task.description,
      priority: task.priority,
      estimated_hours: task.estimatedHours,
      status: "pending",
    }))

    const { data, error } = await supabase.from("tasks").insert(tasksToInsert).select()

    if (error) throw error

    return { success: true, tasks: data }
}

export async function updateTaskStatus(taskId: string, status: "pending" | "in_progress" | "completed") {
  try {
    const { error } = await supabase.from("tasks").update({ status }).eq("id", taskId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, message: "Failed to update task" }
  }
}
