import React from 'react';

export const Button = ({ children, variant = "default", size = "default", className = "", ...props }: any) => {
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border bg-transparent hover:bg-secondary",
    ghost: "bg-transparent hover:bg-secondary text-secondary-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  };
  const sizes = {
    default: "h-9 px-4 py-2",
    sm: "h-8 px-3 text-xs",
    icon: "h-9 w-9 flex items-center justify-center",
  };
  return (
    <button className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${variants[variant as keyof typeof variants]} ${sizes[size as keyof typeof sizes]} ${className}`} {...props}>
      {children}
    </button>
  );
};
