import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-8">
                    <h1 className="text-4xl font-bold mb-4 text-rose-500">Something went wrong.</h1>
                    <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 max-w-2xl w-full overflow-auto shadow-2xl">
                        <h2 className="text-xl font-semibold mb-2 text-slate-300">Error Details:</h2>
                        <pre className="text-red-400 text-sm whitespace-pre-wrap font-mono mb-4">
                            {this.state.error && this.state.error.toString()}
                        </pre>
                        <h3 className="text-lg font-semibold mb-2 text-slate-400">Component Stack:</h3>
                        <pre className="text-slate-500 text-xs whitespace-pre-wrap font-mono">
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors shadow-lg"
                    >
                        Reload Application
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
