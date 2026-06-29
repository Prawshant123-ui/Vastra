import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <span className="chip">Our story</span>
        <h1 className="text-4xl md:text-6xl mt-3">Made slow, made warm.</h1>
        <p className="mt-5 text-lg text-body max-w-2xl">
          Hearth &amp; Harvest began at a kitchen table in autumn. We make and curate goods
          that feel familiar — pieces that earn their spot in your home over years, not weeks.
        </p>
      </motion.div>

      <div className="mt-12 grid md:grid-cols-3 gap-6">
        {[
          ["Honest materials", "Linen, oak, copper, clay. We pick textures we'd want for ourselves."],
          ["Small batches", "Limited runs mean nothing collects dust on a shelf — yours or ours."],
          ["Real people", "Family-run, packed with care, shipped from a sunlit barn in Vermont."],
        ].map(([t, d], i) => (
          <motion.div key={t} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card-base p-6">
            <h3 className="text-xl">{t}</h3>
            <p className="mt-2 text-sm text-body">{d}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
