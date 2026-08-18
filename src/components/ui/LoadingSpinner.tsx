"use client";

type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "h-6 w-6 border-2",
  md: "h-10 w-10 border-2",
  lg: "h-14 w-14 border-[3px]",
};

export function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
  return (
    <div className={`flex min-h-[50vh] items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-primary border-t-transparent ${sizes[size]}`}></div>
    </div>
  );
}
