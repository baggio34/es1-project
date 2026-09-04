import * as React from "react"
import { cn } from "cn"

function Input({
  className,
  type,
  error,
  ...props
}: React.ComponentProps<"input"> & { error?: string | boolean }) {
  return (
    <input
      type={type}
      data-slot="input"
      aria-invalid={!!error}
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-xs transition-colors outline-none hover:border-slate-400 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground dark:bg-input/30 dark:border-input dark:text-foreground dark:placeholder:text-muted-foreground dark:focus-visible:border-primary dark:focus-visible:ring-primary/30",
        className
      )}
      {...props}
    />
  )
}

export { Input }
