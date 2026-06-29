import { Link } from "react-router-dom";
export default function Unauthorized() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <p className="text-7xl font-display text-primary">403</p>
      <h1 className="text-2xl mt-3">Not allowed</h1>
      <p className="text-body mt-2 text-sm">You don't have permission to view this page.</p>
      <Link to="/" className="btn-primary mt-6 inline-flex">Go home</Link>
    </div>
  );
}
