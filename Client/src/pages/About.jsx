import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        
        <h1 className="text-4xl md:text-6xl mt-3">Woven with heritage, made to endure.</h1>
        <p className="mt-5 text-lg text-body max-w-2xl">
         Vastra celebrates the rich textile traditions of Nepal through thoughtfully crafted clothing that blends heritage with contemporary design. Every piece is created by skilled artisans using techniques refined over generations, honoring the stories, culture, and craftsmanship woven into every stitch.
        </p>
      </motion.div>

      <div className="mt-12 grid md:grid-cols-3 gap-6">
        {[
          ["Authentic Craftsmanship", "Every garment is carefully handcrafted by Nepalese artisans, preserving traditional weaving and tailoring techniques."],
          ["Natural Materials", "We choose quality fabrics that offer comfort, durability, and timeless elegance-designed to be worn for years, not seasons."],
          ["Rooted in Heritage", "Inspired by Nepal's diverse culture and rich textile legacy, each collection carries the spirit of tradition into modern living."],
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
