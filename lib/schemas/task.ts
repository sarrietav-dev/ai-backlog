import { z } from 'zod'

// Schema for task priority
export const taskPrioritySchema = z.enum(['low', 'medium', 'high', 'critical'])

// Schema for task status
export const taskStatusSchema = z.enum(['todo', 'in_progress', 'done'])

// Schema for a single task
export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be under 200 characters"),
  description: z.string().min(1, "Description is required").max(1000, "Description must be under 1000 characters"),
  priority: taskPrioritySchema.default('medium'),
  estimatedHours: z.number().min(0.1).max(999.9).optional()
})

// Schema for multiple tasks (AI response)
export const tasksResponseSchema = z.object({
  tasks: z.array(taskSchema).min(1, "At least one task is required")
})

// Schema for task generation request
export const taskGenerationRequestSchema = z.object({
  userStoryId: z.string().uuid("Invalid user story ID"),
  context: z.string().optional()
})

// TypeScript types from schemas
export type TaskInput = z.infer<typeof taskSchema>
export type TasksResponse = z.infer<typeof tasksResponseSchema>
export type TaskGenerationRequest = z.infer<typeof taskGenerationRequestSchema>
export type TaskPriority = z.infer<typeof taskPrioritySchema>
export type TaskStatus = z.infer<typeof taskStatusSchema> 