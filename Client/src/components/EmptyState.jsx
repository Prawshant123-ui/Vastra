import { motion } from "framer-motion";

export default function EmptyState({ title = "Nothing here yet", description, icon, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-base p-10 text-center max-w-md mx-auto"
    >
      {icon && <div className="text-5xl text-primary mx-auto mb-4 grid place-items-center">{icon}</div>}
      <h3 className="text-xl mb-2">{title}</h3>
      {description && <p className="text-sm text-body mb-5">{description}</p>}
      {action}
    </motion.div>
  );
}
