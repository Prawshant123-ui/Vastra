import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowRight,
  FiTruck,
  FiShield,
  FiAward,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { productApi, categoryApi } from "../api/endpoints.js";
import ProductCard from "../components/ProductCard.jsx";
import { ProductCardSkeleton } from "../components/Skeleton.jsx";
import heroImg from "../assets/hero.png";



export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [newest, setNewest] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [p1, , c] = await Promise.all([
          productApi.list({ limit: 8, sort: "createdAt", order: "desc" }),
          productApi.list({ limit: 4, sort: "createdAt", order: "asc" }),
          categoryApi.list(),
        ]);
        const products = p1.data.data || [];
        const feat = products.filter((x) => x.isFeatured).slice(0, 4);
        setNewest(products);
        setFeatured(feat.length ? feat : products.slice(0, 4));
        setCats((c.data.data || c.data || []).slice(0, 6));
      } catch {
        
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
     

      {/*Hero section*/}
      <section className="relative w-full min-h-[540px] md:min-h-[670px] flex items-center overflow-hidden bg-section">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Woman wrapped in a handwoven shawl"
            className="w-full h-full object-cover object-[58%_35%]"
          />
        </div>

        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, var(--color-section, #F6EEE3) 0%, var(--color-section, #F6EEE3) 32%, rgba(246,238,227,0.85) 40%, rgba(246,238,227,0.3) 50%, rgba(246,238,227,0.05) 60%, transparent 68%)",
          }}
        />

        {/* Copy */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-lg"
          >
            <div className="flex items-center gap-2 text-primary mb-4">
              <span className="h-px w-10 bg-primary/40" />
              <span className="text-xs">◆</span>
              <span className="h-px w-10 bg-primary/40" />
            </div>

            <h1 className="text-4xl md:text-5xl leading-tight font-display text-dark">
              <span className="text-primary">Every thread</span> tells a story.
              <br />
              Heritage in <span className="text-primary">Every Stitch.</span>
            </h1>

            <p className="mt-4 text-base text-body">
              Timeless handwoven clothing crafted by skilled artisans of Nepal
              using traditional techniques passed down for centuries.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/shop" className="btn-primary">
                See our traditions <FiArrowRight />
              </Link>
              <Link to="/about" className="btn-outline">
                Our Story
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 mt-4">
        <Heading
          title="Shop by category"
          subtitle="Find your next favorite thing"
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
          {cats.length === 0
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-2xl bg-section animate-pulse"
                />
              ))
            : cats.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.25 }}
                >
                  <Link
                    to={`/shop?category=${c.id}`}
                    className="block aspect-square card-base p-4 hover:border-primary transition-colors duration-150 group grid place-items-center text-center"
                  >
                    <span className="text-2xl mb-1">🌿</span>
                    <span className="text-sm font-semibold text-dark group-hover:text-primary">
                      {c.name}
                    </span>
                  </Link>
                </motion.div>
              ))}
        </div>
      </section>

      {/* ── Featured ── */}
      <section className="bg-section mt-4">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-14">
          <Heading
            title="Featured this week"
            subtitle="Curated favorites worth a place at your table"
            cta={
              <Link
                to="/shop"
                className="text-sm text-primary font-semibold inline-flex items-center gap-1"
              >
                View all <FiArrowRight />
              </Link>
            }
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              : (featured.length ? featured : newest.slice(0, 4)).map(
                  (p, i) => <ProductCard key={p.id} product={p} index={i} />,
                )}
          </div>
        </div>
      </section>

      {/* ── Promises ── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-14 grid md:grid-cols-3 gap-5">
        {[
          [
            <FiTruck key="t" />,
            "Soft & swift shipping",
            "Free over $50, tracked everywhere.",
          ],
          [
            <FiShield key="s" />,
            "Honest guarantee",
            "30-day returns, no questions asked.",
          ],
          [
            <FiAward key="a" />,
            "Small-batch quality",
            "Each piece is checked by hand.",
          ],
        ].map(([icon, t, d], i) => (
          <motion.div
            key={t}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            className="card-base p-6"
          >
            <div className="w-11 h-11 rounded-xl bg-section grid place-items-center text-primary text-xl mb-3">
              {icon}
            </div>
            <h4 className="text-base font-semibold">{t}</h4>
            <p className="text-sm text-body mt-1">{d}</p>
          </motion.div>
        ))}
      </section>

      {/* ── New arrivals ── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
        <Heading title="New arrivals" subtitle="Fresh off the workbench" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : newest
                .slice(0, 8)
                .map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
        </div>
      </section>
    </div>
  );
}

function Heading({ title, subtitle, cta }) {
  return (
    <div className="flex items-end justify-between gap-4 flex-wrap">
      <div>
        <h2 className="text-2xl md:text-3xl font-display">{title}</h2>
        {subtitle && <p className="text-body text-sm mt-1">{subtitle}</p>}
      </div>
      {cta}
    </div>
  );
}
