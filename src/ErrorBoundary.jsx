import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 20, color: 'white', background: '#0f172a', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Something went wrong.</h2>
                    <div style={{ marginBottom: '20px', color: '#94a3b8' }}>
                        The application encountered an unexpected error.
                    </div>
                    <pre style={{
                        color: '#f87171',
                        background: 'rgba(255,255,255,0.05)',
                        padding: '16px',
                        borderRadius: '8px',
                        overflow: 'auto',
                        marginBottom: '24px',
                        fontSize: '14px'
                    }}>
                        {this.state.error && this.state.error.toString()}
                    </pre>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                padding: '10px 20px',
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            Reload Page
                        </button>
                        <button
                            onClick={() => {
                                if (window.confirm('This will clear all your data. Are you sure?')) {
                                    localStorage.clear();
                                    window.location.reload();
                                }
                            }}
                            style={{
                                padding: '10px 20px',
                                background: 'rgba(239, 68, 68, 0.2)',
                                color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.5)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            Clear Data & Reset
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
