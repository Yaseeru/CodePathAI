/**
 * Custom hook for form validation with Zod
 */

import { useState, useCallback } from 'react';
import { ZodSchema, ZodError } from 'zod';

interface UseFormValidationOptions<T> {
     schema: ZodSchema<T>;
     onSubmit: (data: T) => Promise<void> | void;
     initialValues?: Partial<T>;
}

interface UseFormValidationResult<T> {
     values: Partial<T>;
     errors: Partial<Record<keyof T, string>>;
     isSubmitting: boolean;
     isValid: boolean;
     setValue: <K extends keyof T>(field: K, value: T[K]) => void;
     setValues: (values: Partial<T>) => void;
     validateField: <K extends keyof T>(field: K) => boolean;
     validateForm: () => boolean;
     handleSubmit: (e?: React.FormEvent) => Promise<void>;
     reset: () => void;
}

export function useFormValidation<T extends Record<string, unknown>>({
     schema,
     onSubmit,
     initialValues = {},
}: UseFormValidationOptions<T>): UseFormValidationResult<T> {
     const [values, setValuesState] = useState<Partial<T>>(initialValues);
     const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
     const [isSubmitting, setIsSubmitting] = useState(false);
     const [touched, setTouched] = useState<Set<keyof T>>(new Set());

     const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
          setValuesState((prev) => ({ ...prev, [field]: value }));
          setTouched((prev) => new Set(prev).add(field));

          // Clear error for this field
          setErrors((prev) => {
               const newErrors = { ...prev };
               delete newErrors[field];
               return newErrors;
          });
     }, []);

     const setValues = useCallback((newValues: Partial<T>) => {
          setValuesState((prev) => ({ ...prev, ...newValues }));
     }, []);

     const validateField = useCallback(<K extends keyof T>(field: K): boolean => {
          try {
               // Validate just this field
               const fieldSchema = schema.pick({ [field]: true } as any);
               fieldSchema.parse({ [field]: values[field] });

               // Clear error
               setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[field];
                    return newErrors;
               });

               return true;
          } catch (error) {
               if (error instanceof ZodError) {
                    const fieldError = error.errors.find((err) => err.path[0] === field);
                    if (fieldError) {
                         setErrors((prev) => ({
                              ...prev,
                              [field]: fieldError.message,
                         }));
                    }
               }
               return false;
          }
     }, [schema, values]);

     const validateForm = useCallback((): boolean => {
          try {
               schema.parse(values);
               setErrors({});
               return true;
          } catch (error) {
               if (error instanceof ZodError) {
                    const newErrors: Partial<Record<keyof T, string>> = {};
                    error.errors.forEach((err) => {
                         const field = err.path[0] as keyof T;
                         if (field) {
                              newErrors[field] = err.message;
                         }
                    });
                    setErrors(newErrors);
               }
               return false;
          }
     }, [schema, values]);

     const handleSubmit = useCallback(async (e?: React.FormEvent) => {
          if (e) {
               e.preventDefault();
          }

          if (!validateForm()) {
               return;
          }

          setIsSubmitting(true);
          try {
               await onSubmit(values as T);
          } catch (error) {
               console.error('Form submission error:', error);
               throw error;
          } finally {
               setIsSubmitting(false);
          }
     }, [validateForm, onSubmit, values]);

     const reset = useCallback(() => {
          setValuesState(initialValues);
          setErrors({});
          setIsSubmitting(false);
          setTouched(new Set());
     }, [initialValues]);

     const isValid = Object.keys(errors).length === 0;

     return {
          values,
          errors,
          isSubmitting,
          isValid,
          setValue,
          setValues,
          validateField,
          validateForm,
          handleSubmit,
          reset,
     };
}
