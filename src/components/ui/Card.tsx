import React from 'react';

export const Card = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`bg-card text-card-foreground border rounded-lg shadow-sm ${className}`} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-4 border-b flex flex-col gap-1 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`font-semibold tracking-tight ${className}`} {...props}>{children}</h3>
);

export const CardContent = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-4 ${className}`} {...props}>
    {children}
  </div>
);
