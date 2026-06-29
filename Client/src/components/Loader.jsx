import { motion } from "framer-motion";

export default function Loader({ full = false, label = "Loading…" }) {
  const inner = (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        className="w-10 h-10 rounded-full border-4 border-section border-t-primary"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
      />
      <span className="text-sm text-muted">{label}</span>
    </div>
  );
  if (full) return <div className="min-h-[60vh] grid place-items-center">{inner}</div>;
  return <div className="py-10 grid place-items-center">{inner}</div>;
}
