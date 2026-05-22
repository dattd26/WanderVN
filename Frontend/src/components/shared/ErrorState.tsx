import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  actionTo?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ title, message, actionLabel, actionTo }) => {
  return (
    <div className="rounded-[32px] border border-rose-500/20 bg-rose-500/10 p-10 text-center shadow-2xl shadow-black/5">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-500/10 text-rose-200">
        <AlertTriangle className="h-10 w-10" />
      </div>
      <h2 className="font-display-md text-headline-md text-primary mb-4">{title}</h2>
      <p className="text-body-md text-on-surface-variant max-w-xl mx-auto">{message}</p>
      {actionTo && actionLabel && (
        <Link
          to={actionTo}
          className="mt-8 inline-flex rounded-full border border-outline-variant/20 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-primary hover:bg-white/10"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
};
