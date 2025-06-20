import { z } from 'zod'

// Schema for individual acceptance criteria
export const acceptanceCriteriaSchema = z.string().min(1, "Acceptance criteria cannot be empty")

// Schema for a single user story
export const userStorySchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be under 200 characters"),
  description: z.string().min(1, "Description is required").max(2000, "Description must be under 2000 characters"),
  acceptanceCriteria: z.array(acceptanceCriteriaSchema).min(1, "At least one acceptance criteria is required")
})

// Schema for multiple user stories (AI response)
export const userStoriesResponseSchema = z.object({
  stories: z.array(userStorySchema).min(1, "At least one user story is required")
})

// Schema for the prompt input
export const promptSchema = z.object({
  prompt: z.string().min(10, "Prompt must be at least 10 characters").max(1000, "Prompt must be under 1000 characters")
})

// TypeScript types from schemas
export type UserStoryInput = z.infer<typeof userStorySchema>
export type UserStoriesResponse = z.infer<typeof userStoriesResponseSchema>
export type PromptInput = z.infer<typeof promptSchema> 