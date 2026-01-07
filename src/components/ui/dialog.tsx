import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const DialogContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>({ open: false, onOpenChange: () => {} })

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          {children}
        </div>
      )}
    </DialogContext.Provider>
  )
}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, ...props }, ref) => {
    const { onOpenChange } = React.useContext(DialogContext)
    return (
      <div
        ref={ref}
        className={cn(
          "relative z-50 grid w-full max-w-lg gap-4 glass p-6 duration-200 rounded-3xl overflow-hidden",
          className
        )}
        {...props}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-full p-1.5 opacity-70 ring-offset-background transition-all hover:opacity-100 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    )
  }
)
DialogContent.displayName = "DialogContent"

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-300", className)}
    {...props}
  />
))
DialogDescription.displayName = "DialogDescription"

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
}

