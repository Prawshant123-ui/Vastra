import { Component } from "react";
import { Link } from "react-router-dom";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error("ErrorBoundary:", error, info); }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-bg px-6">
          <div className="card-base max-w-md w-full p-8 text-center">
            <h1 className="text-2xl mb-2">Something went wrong</h1>
            <p className="text-sm text-body mb-6">An unexpected error occurred. Try refreshing the page.</p>
            <Link to="/" className="btn-primary">Go home</Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
