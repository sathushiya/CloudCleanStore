import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onBack: () => void;
  label?: string;
  className?: string;
}

export default function BackButton({ onBack, label = 'Back', className = '' }: BackButtonProps) {
  return (
    <button
      onClick={onBack}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-medium transition-all ${className}`}
    >
      <ArrowLeft className="w-5 h-5" />
      {label}
    </button>
  );
}
