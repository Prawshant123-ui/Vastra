import { Link } from "react-router-dom";

export default function EditProfile() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="card-base p-8 text-center">
        <h1 className="text-3xl">Edit profile</h1>
        <p className="mt-3 text-body">
          The backend does not currently expose a profile update endpoint. Once a
          <code className="mx-1 px-1 bg-section rounded">PATCH /api/auth/me</code>
          (or similar) is added, this page will let you update your name, phone, and avatar.
        </p>
        <Link to="/profile" className="btn-primary mt-6 inline-flex">Back to profile</Link>
      </div>
    </div>
  );
}
