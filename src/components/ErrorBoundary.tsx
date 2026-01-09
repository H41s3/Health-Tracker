import { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div 
          className="min-h-screen flex items-center justify-center p-4" 
          style={{ background: '#011627' }}
        >
          <div 
            className="max-w-md w-full rounded-2xl p-8 text-center"
            style={{
              background: 'rgba(29, 59, 83, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 88, 116, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }}
          >
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(255, 88, 116, 0.15)' }}
            >
              <AlertCircle className="w-8 h-8" style={{ color: '#ff5874' }} />
            </div>
            
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#d6deeb' }}>
              Something went wrong
            </h1>
            
            <p className="mb-6" style={{ color: '#5f7e97' }}>
              We encountered an unexpected error. Don't worry, your data is safe.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <div 
                className="mb-6 p-4 rounded-lg text-left"
                style={{ background: 'rgba(11, 41, 66, 0.8)' }}
              >
                <p className="text-xs font-mono break-all" style={{ color: '#ff5874' }}>
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                style={{ 
                  background: 'linear-gradient(135deg, #7fdbca 0%, #82aaff 100%)',
                  color: '#011627'
                }}
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                style={{ 
                  background: 'rgba(95, 126, 151, 0.3)',
                  color: '#d6deeb',
                  border: '1px solid rgba(127, 219, 202, 0.2)'
                }}
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
