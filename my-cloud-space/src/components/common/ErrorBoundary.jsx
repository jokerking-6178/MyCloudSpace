import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md text-center bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h1>
          <p className="text-sm text-gray-600 mb-6">
            The page ran into an unexpected error. Reloading usually fixes it.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all"
          >
            Reload the page
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
