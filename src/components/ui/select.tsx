import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            "flex h-11 w-full appearance-none rounded-xl glass-input px-4 py-2.5 text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer text-slate-800",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-4 top-3.5 h-4 w-4 opacity-60 pointer-events-none text-gray-600" />
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }

