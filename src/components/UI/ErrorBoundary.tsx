import React, { Component, ErrorInfo } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  tabName: string;
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

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`ErrorBoundary caught in ${this.props.tabName}:`, error, info);
  }

  handleReset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: '16px',
          color: 'var(--text-secondary)',
        }}>
          <AlertTriangle size={40} color="#f85149" strokeWidth={1.5} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Something went wrong in {this.props.tabName}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', maxWidth: '400px' }}>
              {this.state.error?.message}
            </p>
          </div>
          <button
            onClick={this.handleReset}
            style={{
              padding: '8px 16px',
              background: 'rgba(56,139,253,0.15)',
              border: '1px solid #388bfd',
              borderRadius: '6px',
              color: '#388bfd',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
