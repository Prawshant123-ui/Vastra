import { Link } from "react-router-dom";
export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <p className="text-7xl font-display text-primary">404</p>
      <h1 className="text-2xl mt-3">Page not found</h1>
      <p className="text-body mt-2 text-sm">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-6 inline-flex">Go home</Link>
    </div>
  );
}
