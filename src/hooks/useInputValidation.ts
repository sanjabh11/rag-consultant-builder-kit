
import { useState } from 'react';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

// Validation schemas
export const DocumentUploadSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 10 * 1024 * 1024, // 10MB
    "File size must be less than 10MB"
  ).refine(
    (file) => ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type),
    "File must be PDF, DOCX, or TXT"
  ),
  projectId: z.string().min(1, "Project ID is required")
});

export const ProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100, "Project name too long"),
  description: z.string().max(500, "Description too long").optional(),
  isPublic: z.boolean().default(false)
});

export const ChatQuerySchema = z.object({
  query: z.string().min(1, "Query cannot be empty").max(1000, "Query too long"),
  projectId: z.string().min(1, "Project ID is required")
});

export const UserProfileSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(50, "Display name too long"),
  email: z.string().email("Invalid email address"),
  bio: z.string().max(200, "Bio too long").optional()
});

export const TeamInviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(['viewer', 'editor', 'admin']),
  projectId: z.string().min(1, "Project ID is required")
});

interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
}

export const useInputValidation = () => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const validate = <T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> => {
    try {
      const result = schema.parse(data);
      setValidationErrors({});
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });
        setValidationErrors(errors);
        return { success: false, errors };
      }
      return { success: false, errors: { general: 'Validation failed' } };
    }
  };

  const validateAndToast = <T>(schema: z.ZodSchema<T>, data: unknown): T | null => {
    const result = validate(schema, data);
    if (!result.success && result.errors) {
      const errorMessages = Object.values(result.errors);
      toast({
        title: "Validation Error",
        description: errorMessages[0],
        variant: "destructive",
      });
      return null;
    }
    return result.data || null;
  };

  const clearErrors = () => setValidationErrors({});

  return {
    validate,
    validateAndToast,
    validationErrors,
    clearErrors
  };
};

// Sanitization utilities
export const sanitizeInput = {
  text: (input: string): string => {
    return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  },
  
  filename: (input: string): string => {
    return input.replace(/[^a-zA-Z0-9._-]/g, '').substring(0, 255);
  },
  
  projectName: (input: string): string => {
    return input.trim().replace(/[<>:"\/\\|?*]/g, '').substring(0, 100);
  }
};
