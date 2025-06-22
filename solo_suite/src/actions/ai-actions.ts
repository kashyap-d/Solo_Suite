"use server"

// import { generateText } from "ai"
// import { openai } from "@ai-sdk/openai"
import { supabase, supabaseAdmin } from "@/lib/supabaseClient"
import type { Invoice } from "@/lib/supabaseClient"

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

// Invoice Actions - Using admin client to bypass RLS, fallback to regular client
export async function saveInvoice(invoiceData: any, userId: string) {
  try {
    const invoiceToInsert = {
      user_id: userId,
      invoice_number: invoiceData.invoiceNumber,
      invoice_date: invoiceData.invoiceDate.toISOString(),
      due_date: invoiceData.dueDate.toISOString(),
      provider: invoiceData.provider,
      client: invoiceData.client,
      items: invoiceData.items,
      subtotal: invoiceData.subtotal,
      tax: invoiceData.tax,
      total: invoiceData.total,
      notes: invoiceData.notes,
      payment_terms: invoiceData.paymentTerms,
      status: "draft" as const,
    }

    // Use admin client if available, otherwise use regular client
    const client = supabaseAdmin || supabase
    const { data, error } = await client.from("invoices").insert([invoiceToInsert]).select()

    if (error) throw error

    return { success: true, invoice: data[0] }
  } catch (error) {
    console.error("Error saving invoice:", error)
    return { success: false, message: "Failed to save invoice" }
  }
}

export async function getInvoices(userId: string) {
  try {
    // Use admin client if available, otherwise use regular client
    const client = supabaseAdmin || supabase
    const { data, error } = await client
      .from("invoices")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return { success: true, invoices: data }
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return { success: false, message: "Failed to fetch invoices" }
  }
}

export async function updateInvoiceStatus(invoiceId: string, status: "draft" | "sent" | "paid" | "overdue") {
  try {
    // Use admin client if available, otherwise use regular client
    const client = supabaseAdmin || supabase
    const { error } = await client.from("invoices").update({ status }).eq("id", invoiceId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, message: "Failed to update invoice status" }
  }
}

export async function deleteInvoice(invoiceId: string) {
  try {
    // Use admin client if available, otherwise use regular client
    const client = supabaseAdmin || supabase
    const { error } = await client.from("invoices").delete().eq("id", invoiceId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, message: "Failed to delete invoice" }
  }
}

export async function deleteJob(jobId: string, userId: string) {
  const client = supabaseAdmin || supabase
  try {
    // First, delete all applications for the job
    await client
      .from("job_applications")
      .delete()
      .eq("job_id", jobId)

    // Then, delete the job itself, ensuring the user owns it
    const { error: jobError } = await client
      .from("jobs")
      .delete()
      .eq("id", jobId)
      .eq("client_id", userId)

    if (jobError) {
      throw jobError
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function updateJob(jobId: string, userId: string, jobData: any) {
  const client = supabaseAdmin || supabase
  try {
    const { error } = await client
      .from("jobs")
      .update(jobData)
      .eq("id", jobId)
      .eq("client_id", userId)

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}
