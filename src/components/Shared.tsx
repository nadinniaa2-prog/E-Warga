import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={cn("bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden", className)} {...props}>
    {children}
  </div>
);

interface StatusBadgeProps {
  status: 'pending' | 'success' | 'danger' | 'warning' | string;
  label: string;
}

export const StatusBadge = ({ status, label }: StatusBadgeProps) => {
  const styles = {
    pending: "bg-slate-100 text-slate-500",
    success: "bg-teal-primary/10 text-teal-primary",
    danger: "bg-coral/10 text-coral",
    warning: "bg-amber-100 text-amber-600",
  };

  const currentStyle = styles[status as keyof typeof styles] || styles.pending;

  return (
    <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", currentStyle)}>
      {label}
    </span>
  );
};

export const Button = ({ 
  children, 
  variant = 'primary', 
  className,
  ...props 
}: { 
  children: React.ReactNode; 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const variants = {
    primary: "bg-navy text-white hover:bg-teal-primary",
    secondary: "bg-teal-primary text-white hover:bg-teal-primary/90",
    outline: "border-2 border-slate-200 text-slate-600 hover:border-teal-primary hover:text-teal-primary",
    ghost: "text-slate-500 hover:bg-slate-100",
    danger: "bg-coral/10 text-coral hover:bg-coral hover:text-white",
  };

  return (
    <button 
      className={cn(
        "px-4 py-2 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
