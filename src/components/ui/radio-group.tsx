import * as React from "react"
import { cn } from "@/lib/utils"

export interface RadioGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string
  onChange?: (value: string) => void
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onChange, children, ...props }, ref) => {
    return (
      <div
        className={cn("grid gap-2", className)}
        {...props}
        ref={ref}
        role="radiogroup"
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              checked: child.props.value === value,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                onChange?.(e.target.value)
              },
            } as any)
          }
          return child
        })}
      </div>
    )
  }
)
RadioGroup.displayName = "RadioGroup"

export interface RadioGroupItemProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string
  value: string
  checked?: boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, label, id, checked, value, onChange, ...props }, ref) => {
    return (
      <label
        htmlFor={id}
        className={cn(
          "flex items-center space-x-3 cursor-pointer p-3.5 rounded-xl glass-input transition-all duration-200 hover:bg-white/25",
          checked && "bg-indigo-50/50 border-2 border-indigo-400 shadow-sm",
          className
        )}
      >
        <input
          type="radio"
          className="w-5 h-5 text-indigo-600 border-2 border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer accent-indigo-600"
          id={id}
          value={value}
          checked={checked}
          onChange={onChange}
          ref={ref}
          {...props}
        />
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </label>
    )
  }
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }

