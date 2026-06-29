import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="flex items-center text-sm text-muted flex-wrap gap-1">
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {it.to && !last ? (
              <Link to={it.to} className="hover:text-primary">{it.label}</Link>
            ) : (
              <span className={last ? "text-dark font-medium" : ""}>{it.label}</span>
            )}
            {!last && <FiChevronRight className="mx-1" />}
          </span>
        );
      })}
    </nav>
  );
}
