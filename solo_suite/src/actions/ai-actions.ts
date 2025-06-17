"use server"

// import { generateText } from "ai"
// import { openai } from "@ai-sdk/openai"
import { supabase } from "@/lib/supabaseClient"

export async function generateTasks(projectDescription: string, userId: string) {
//   try {
//     // // const { text } = await generateText({
//     // //   model: openai("gpt-4o"),
//     //   system:
//     //     "You are a helpful assistant that creates detailed task lists for entrepreneurs and creators. Generate 5-8 specific, actionable tasks based on the project description. Format each task as a JSON object with title, description, priority (high/medium/low), and estimatedHours.",
//     //   prompt: `Create a detailed task list for this project: ${projectDescription}. Return the response as a JSON array of task objects.`,
//     })

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
//   } catch (error) {
//     console.error("Error generating tasks:", error)
//     return { success: false, message: "Failed to generate tasks" }
//   }
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
