import { InputHTMLAttributes, forwardRef, LabelHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";

interface FieldWrapperProps {
  label?: string;
  error?: string;
  children: ReactNode;
}

export function FieldWrapper({ label, error, children }: FieldWrapperProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-slate-600">{label}</label>}
      {children}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className = "", ...props }, ref) => (
  <FieldWrapper label={label} error={error}>
    <input
      ref={ref}
      className={`rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 ${className}`}
      {...props}
    />
  </FieldWrapper>
));
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, error, className = "", ...props }, ref) => (
  <FieldWrapper label={label} error={error}>
    <textarea
      ref={ref}
      className={`rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 ${className}`}
      {...props}
    />
  </FieldWrapper>
));
Textarea.displayName = "Textarea";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, error, className = "", children, ...props }, ref) => (
  <FieldWrapper label={label} error={error}>
    <select
      ref={ref}
      className={`rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 ${className}`}
      {...props}
    >
      {children}
    </select>
  </FieldWrapper>
));
Select.displayName = "Select";
