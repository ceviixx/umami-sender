import React from "react";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Container component to wrap page content with a unified max width and padding.
 */
export default function Container({ children, className = "" }: ContainerProps) {
  return (
    <div
      className={`max-w-6xl mx-auto p-6 ${className}`}
    >
      {children}
    </div>
  );
}
