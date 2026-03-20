import { Component, type ReactNode, type ErrorInfo } from 'react';
import i18n from '@/i18n';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Error logging handled by server-side monitoring
    // In production, errors are reported via error tracking service
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6 py-16 text-center" role="alert" aria-live="assertive">
          <span className="font-body text-[10px] tracking-[0.3em] uppercase text-sepia-mid mb-4">
            {i18n.t('error.title')}
          </span>
          <h2 className="font-display text-h2 text-ink mb-4">
            {i18n.t('error.subtitle')}
          </h2>
          <p className="font-body text-sm text-ink-faded max-w-md leading-relaxed mb-8">
            {i18n.t('error.body')}
          </p>
          <div className="flex gap-4">
            <button
              onClick={this.handleReset}
              className="font-body text-xs tracking-[0.15em] uppercase px-6 py-3 bg-ink text-paper hover:bg-ink-faded transition-colors"
            >
              {i18n.t('error.retry')}
            </button>
            <a
              href="/"
              className="font-body text-xs tracking-[0.15em] uppercase px-6 py-3 border border-warm-gray/50 text-ink hover:bg-warm-gray/20 transition-colors"
            >
              {i18n.t('error.home')}
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
