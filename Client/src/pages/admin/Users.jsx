

// admin/pages/Users.jsx
import { useState, useEffect, useCallback } from "react";
import api from "../../api/axios";


const ROLES = ["ALL", "USER", "ADMIN"];

export default function Users() {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [role, setRole]           = useState("ALL");
  const [page, setPage]           = useState(1);
  const [pagination, setPagination] = useState({});
  const [actionLoading, setActionLoading] = useState(null); // userId being acted on

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        ...(search && { search }),
        ...(role !== "ALL" && { role }),
      };
      const res = await api.get("/users", { params });
      setUsers(res.data.data.users);
      setPagination(res.data.data.pagination);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, role]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(), 400);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  // Reset to page 1 on filter change
  useEffect(() => { setPage(1); }, [search, role]);

  const handleRoleChange = async (userId, newRole) => {
    setActionLoading(userId);
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      setUsers(prev =>
        prev.map(u => u.id === userId ? { ...u, role: newRole } : u)
      );
    } catch (err) {
      console.error("Failed to update role:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm("Soft-delete this user? They will no longer appear in listings.")) return;
    setActionLoading(userId);
    try {
      await api.delete(`/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
      setPagination(prev => ({ ...prev, total: prev.total - 1 }));
    } catch (err) {
      console.error("Failed to delete user:", err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold">Users</h1>
          <p className="text-muted text-sm mt-1">
            {pagination.total ?? "—"} total customers
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card-base p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name, email or phone…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-border rounded-lg px-4 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="flex gap-2">
          {ROLES.map(r => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                role === r
                  ? "bg-primary text-white"
                  : "bg-section text-body hover:bg-primary/10"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card-base overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center text-muted">Loading users…</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-muted">No users found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Verified</th>
                <th className="px-4 py-3 font-medium">Orders</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-section/50 transition-colors">
                  {/* Avatar + name/email */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                        {user.avatar
                          ? <img src={user.avatar} className="w-9 h-9 rounded-full object-cover" alt="" />
                          : user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-body">{user.name}</p>
                        <p className="text-muted text-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-muted">{user.phone || "—"}</td>

                  {/* Role badge */}
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.role === "ADMIN"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      {user.role}
                    </span>
                  </td>

                  {/* Verified */}
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${
                      user.isEmailVerified ? "text-green-600" : "text-red-500"
                    }`}>
                      {user.isEmailVerified ? "✓ Yes" : "✗ No"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-muted">{user._count?.orders ?? 0}</td>

                  <td className="px-4 py-3 text-muted">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {/* Toggle role */}
                      <button
                        disabled={actionLoading === user.id}
                        onClick={() =>
                          handleRoleChange(user.id, user.role === "ADMIN" ? "USER" : "ADMIN")
                        }
                        className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-section transition-colors disabled:opacity-50"
                      >
                        {user.role === "ADMIN" ? "→ User" : "→ Admin"}
                      </button>

                      {/* Delete */}
                      <button
                        disabled={actionLoading === user.id}
                        onClick={() => handleDelete(user.id)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-muted">
          <span>
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} users
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 rounded-lg border border-border hover:bg-section disabled:opacity-40 transition-colors"
            >
              ← Prev
            </button>
            <button
              disabled={page === pagination.totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 rounded-lg border border-border hover:bg-section disabled:opacity-40 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}