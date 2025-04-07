import React from 'react';
import { cn } from '@/lib/utils';

const Button = React.forwardRef(({ className, variant = "default", size = "default", asChild = false, children, ...props }, ref) => {
  const Comp = asChild ? React.Fragment : "button";
  const buttonClassName = cn(
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
    {
      "bg-primary text-primary-foreground hover:bg-primary/90": variant === "default",
      "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === "destructive",
      "border border-input hover:bg-accent hover:text-accent-foreground": variant === "outline",
      "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
      "h-10 py-2 px-4": size === "default",
      "h-9 px-3": size === "sm",
      "h-11 px-8": size === "lg",
    },
    className
  );

  if (asChild) {
    return React.cloneElement(React.Children.only(children), {
      className: buttonClassName,
      ...props
    });
  }

  return (
    <Comp
      className={buttonClassName}
      ref={ref}
      {...props}
    >
      {children}
    </Comp>
  );
});

Button.displayName = "Button";

export { Button }; 