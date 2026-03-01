'use client';

import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface BaseFormFieldProps {
     label: string;
     error?: string;
     required?: boolean;
     helperText?: string;
     className?: string;
}

interface InputFormFieldProps extends BaseFormFieldProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
     type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
}

interface TextareaFormFieldProps extends BaseFormFieldProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
     type: 'textarea';
}

type FormFieldProps = InputFormFieldProps | TextareaFormFieldProps;

export function FormField(props: FormFieldProps) {
     const { label, error, required, helperText, className = '', type = 'text', ...inputProps } = props;

     const baseInputClasses = `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
          }`;

     const isTextarea = type === 'textarea';

     return (
          <div className={`space-y-2 ${className}`}>
               <label htmlFor={inputProps.id || inputProps.name} className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
               </label>

               {helperText && (
                    <p className="text-sm text-gray-500">{helperText}</p>
               )}

               {isTextarea ? (
                    <textarea
                         {...(inputProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
                         className={baseInputClasses}
                         aria-invalid={!!error}
                         aria-describedby={error ? `${inputProps.id || inputProps.name}-error` : undefined}
                    />
               ) : (
                    <input
                         {...(inputProps as InputHTMLAttributes<HTMLInputElement>)}
                         type={type}
                         className={baseInputClasses}
                         aria-invalid={!!error}
                         aria-describedby={error ? `${inputProps.id || inputProps.name}-error` : undefined}
                    />
               )}

               {error && (
                    <p
                         id={`${inputProps.id || inputProps.name}-error`}
                         className="text-sm text-red-600 flex items-center gap-1"
                         role="alert"
                    >
                         <span>⚠️</span>
                         {error}
                    </p>
               )}
          </div>
     );
}

interface SelectFormFieldProps extends BaseFormFieldProps {
     options: Array<{ value: string; label: string }>;
     value: string;
     onChange: (value: string) => void;
     placeholder?: string;
}

export function SelectFormField({
     label,
     error,
     required,
     helperText,
     className = '',
     options,
     value,
     onChange,
     placeholder,
     ...selectProps
}: SelectFormFieldProps & Omit<InputHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value' | 'className'>) {
     return (
          <div className={`space-y-2 ${className}`}>
               <label htmlFor={selectProps.id || selectProps.name} className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
               </label>

               {helperText && (
                    <p className="text-sm text-gray-500">{helperText}</p>
               )}

               <select
                    {...selectProps}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                         }`}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${selectProps.id || selectProps.name}-error` : undefined}
               >
                    {placeholder && (
                         <option value="" disabled>
                              {placeholder}
                         </option>
                    )}
                    {options.map((option) => (
                         <option key={option.value} value={option.value}>
                              {option.label}
                         </option>
                    ))}
               </select>

               {error && (
                    <p
                         id={`${selectProps.id || selectProps.name}-error`}
                         className="text-sm text-red-600 flex items-center gap-1"
                         role="alert"
                    >
                         <span>⚠️</span>
                         {error}
                    </p>
               )}
          </div>
     );
}
