import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;
  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="btn-outline !p-2.5 !rounded-full disabled:opacity-40"
      >
        <FiChevronLeft />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-10 h-10 rounded-full text-sm font-semibold transition ${
            p === page ? "bg-primary text-white shadow-soft" : "bg-card border border-border text-dark hover:border-primary"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="btn-outline !p-2.5 !rounded-full disabled:opacity-40"
      >
        <FiChevronRight />
      </button>
    </div>
  );
}
