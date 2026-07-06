import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] w-full bg-background text-on-surface p-6 font-sans text-center rounded-xl">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-3xl">error</span>
          </div>
          <h2 className="font-display font-bold text-2xl text-on-surface mb-2">Something went wrong</h2>
          <p className="text-on-surface-variant mb-6 max-w-md">
            We encountered an unexpected error while loading this component. Please try refreshing or returning to the dashboard.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              if (this.props.onReset) this.props.onReset();
              else window.location.reload();
            }}
            className="bg-primary hover:bg-secondary text-white font-bold py-2.5 px-6 rounded-xl shadow-sm transition-all"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
