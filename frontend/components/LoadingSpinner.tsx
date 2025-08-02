import PageHeader from "./PageHeader";

interface LoadingSpinnerProps {
  title: string;
}

export default function LoadingSpinner({ title }: LoadingSpinnerProps) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <PageHeader title={title} />

      <div className="flex items-center justify-center h-[70vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
}
