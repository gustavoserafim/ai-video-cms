'use client'

import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <h1 className="font-bold text-xl mb-2">Oops! Something went wrong.</h1>
          {this.state.error && (
            <div>
              <p className="mb-2">{this.state.error.toString()}</p>
              {this.state.errorInfo && (
                <details className="whitespace-pre-wrap">
                  <summary className="cursor-pointer">Error Details</summary>
                  <pre className="mt-2 text-sm">{this.state.errorInfo.componentStack}</pre>
                </details>
              )}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
