import React from 'react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error('ErrorBoundary caught:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <main style={{
                    minHeight: '100dvh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '2rem 1rem',
                    background: '#f3f1ed',
                    fontFamily: 'system-ui, sans-serif',
                    color: '#17202a'
                }}>
                    <div style={{
                        textAlign: 'center',
                        maxWidth: '420px',
                        background: '#fffdfa',
                        border: '1px solid #ddd9d2',
                        borderRadius: '12px',
                        padding: '2.5rem',
                        boxShadow: '0 16px 36px -12px rgba(23,32,42,0.08)'
                    }}>
                        <h1 style={{
                            fontFamily: "Georgia, 'Times New Roman', serif",
                            fontSize: '1.75rem',
                            fontWeight: 400,
                            letterSpacing: '-0.02em',
                            margin: '0 0 0.5rem'
                        }}>Something went wrong</h1>
                        <p style={{
                            color: '#66717d',
                            fontSize: '0.95rem',
                            lineHeight: 1.5,
                            margin: '0 0 1.5rem'
                        }}>An unexpected error occurred. Please refresh the page to try again.</p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                background: '#b72d69',
                                color: '#fff',
                                border: 'none',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '7px',
                                cursor: 'pointer',
                                minHeight: '44px'
                            }}
                        >Reload page</button>
                    </div>
                </main>
            );
        }

        return this.props.children;
    }
}
