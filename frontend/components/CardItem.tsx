import React from "react";

type CardItemProps = {
  children: React.ReactNode;
  rightSlot?: React.ReactNode;
  className?: string;
};

export default function CardItem({ children, rightSlot, className = "" }: CardItemProps) {
  return (
    <li
      className={`border border-gray-200 dark:border-gray-700 rounded p-3 flex justify-between items-start bg-white dark:bg-gray-900 ${className}`}
    >
      <div className="w-full">{children}</div>
      {rightSlot && <div className="flex items-center gap-3 ml-4">{rightSlot}</div>}
    </li>
  );
}
