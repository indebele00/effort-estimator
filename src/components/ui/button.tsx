import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md px-3 py-2 border border-slate-300 bg-white text-slate-900 shadow-sm hover:bg-slate-50 disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
