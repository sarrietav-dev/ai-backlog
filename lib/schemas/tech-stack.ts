import { z } from 'zod'

// Schema for a single technology suggestion
export const technologySchema = z.object({
  name: z.string(),
  category: z.enum(['frontend', 'backend', 'database', 'hosting', 'mobile', 'ai-ml', 'analytics', 'authentication', 'payment', 'storage', 'monitoring', 'devops']),
  description: z.string(),
  reasoning: z.string(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  alternatives: z.array(z.string()).optional()
})

// Schema for tech stack response
export const techStackResponseSchema = z.object({
  suggestions: z.array(technologySchema),
  projectType: z.string(),
  complexity: z.enum(['simple', 'moderate', 'complex']),
  estimatedTimeframe: z.string(),
  keyFeatures: z.array(z.string())
})

// Schema for tech stack request
export const techStackRequestSchema = z.object({
  backlogId: z.string().uuid(),
  includeExisting: z.boolean().default(true)
})

// TypeScript types
export type Technology = z.infer<typeof technologySchema>
export type TechStackResponse = z.infer<typeof techStackResponseSchema>
export type TechStackRequest = z.infer<typeof techStackRequestSchema> 