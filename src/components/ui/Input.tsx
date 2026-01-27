"use client"

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react"

interface BaseInputProps {
  label?: string
  error?: string
}

interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    BaseInputProps {
  type?: "text" | "email" | "password" | "number" | "date" | "datetime-local"
}

interface TextareaInputProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    BaseInputProps {
  type: "textarea"
}

type InputProps = TextInputProps | TextareaInputProps

export const Input = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputProps
>(({ label, error, className = "", ...props }, ref) => {
  const baseClasses = `
    block w-full px-3 py-2
    border rounded-md shadow-sm
    focus-ring transition-default
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    ${error ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-primary-500"}
    ${className}
  `

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      {props.type === "textarea" ? (
        <textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          className={baseClasses}
          {...(props as TextareaInputProps)}
        />
      ) : (
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          className={baseClasses}
          {...(props as TextInputProps)}
        />
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
})

Input.displayName = "Input"

