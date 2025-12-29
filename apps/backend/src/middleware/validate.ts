import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodObject, ZodEffects } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Log for debugging
      console.log('Validating request body:', req.body);
      console.log('Files in request:', req.files ? 'Yes' : 'No');
      
      // Handle different schema types
      if (schema instanceof ZodObject || schema instanceof ZodEffects) {
        const shape = schema instanceof ZodEffects ? schema._def.schema.shape : schema.shape;
        
        // Check if schema expects body, query, or params
        if (shape.body) {
          req.body = schema.parse({ body: req.body }).body;
        } else if (shape.query) {
          req.query = schema.parse({ query: req.query }).query;
        } else if (shape.params) {
          req.params = schema.parse({ params: req.params }).params;
        } else {
          // For multipart form data, we need to extract only the form fields
          // and exclude file uploads before validation
          let dataToValidate = req.body;
          
          // If we have files in the request, create a copy of body without file-related properties
          if (req.files || req.file) {
            // Create a clean object with only the form fields for validation
            const { files, file, ...formData } = req.body;
            dataToValidate = formData;
            console.log('Filtered form data for validation:', dataToValidate);
          }
          
          const result = schema.parse(dataToValidate);
          req.body = result;
        }
      } else {
        // Fallback: try to parse body, query, or params
        try {
          // For multipart form data, we need to extract only the form fields
          let dataToValidate = req.body;
          if (req.files || req.file) {
            const { files, file, ...formData } = req.body;
            dataToValidate = formData;
            console.log('Filtered form data for validation (fallback):', dataToValidate);
          }
          req.body = schema.parse(dataToValidate);
        } catch {
          try {
            req.query = schema.parse(req.query);
          } catch {
            req.params = schema.parse(req.params);
          }
        }
      }
      next();
    } catch (error) {
      console.error('Validation error:', error);
      next(error);
    }
  };
}

