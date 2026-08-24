import React from 'react';

export const Badge = ({ children, variant = "default", className = "", ...props }: { children: React.ReactNode, variant?: "default" | "outline" | "secondary" | "destructive" | "success" | "warning", className?: string, [key: string]: any }) => {
  const variants = {
    default: "bg-primary text-primary-foreground",
    outline: "border text-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    destructive: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800",
    success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};

