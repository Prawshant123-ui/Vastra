import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight, FiTruck, FiShield, FiAward, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { productApi, categoryApi } from "../api/endpoints.js";
import ProductCard from "../components/ProductCard.jsx";
import { ProductCardSkeleton } from "../components/Skeleton.jsx";

const SLIDES = [
  {
    url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=900&q=80",
    label: "Warm home essentials",
  },
  {
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80",
    label: "Handcrafted with care",
  },
  {
    url: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=900&q=80",
    label: "Slow-made, built to last",
  },
  {
    url: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=900&q=80",
    label: "Seasonal collections",
  },
];

function Carousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const go = useCallback((next) => {
    setDirection(next > current ? 1 : -1);
    setCurrent(next);
  }, [current]);

  const prev = () => go((current - 1 + SLIDES.length) % SLIDES.length);
  const next = () => go((current + 1) % SLIDES.length);

  // Auto-advance every 4s
  useEffect(() => {
    const t = setInterval(() => {
      setDirection(1);
      setCurrent((c) => (c + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const variants = {
    enter:  (d) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.45, ease: "easeInOut" } },
    exit:   (d) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0, transition: { duration: 0.45, ease: "easeInOut" } }),
  };

  return (
    <div className="relative w-full aspect-[3/2] rounded-2xl overflow-hidden shadow-lift bg-section">
      {/* Slides */}
      <AnimatePresence custom={direction} initial={false}>
        <motion.img
          key={current}
          src={SLIDES[current].url}
          alt={SLIDES[current].label}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      {/* Label */}
      <div className="absolute bottom-14 left-4 right-4">
        <p className="text-white text-sm font-medium drop-shadow">{SLIDES[current].label}</p>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "w-6 bg-white" : "w-1.5 bg-white/50"
            }`}
          />
        ))}
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white grid place-items-center shadow transition-colors"
      >
        <FiChevronLeft className="text-dark" />
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white grid place-items-center shadow transition-colors"
      >
        <FiChevronRight className="text-dark" />
      </button>

      
    </div>
  );
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [newest, setNewest]     = useState([]);
  const [cats, setCats]         = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [p1, , c] = await Promise.all([
          productApi.list({ limit: 8, sort: "createdAt", order: "desc" }),
          productApi.list({ limit: 4, sort: "createdAt", order: "asc" }),
          categoryApi.list(),
        ]);
        const products = p1.data.data || [];
        const feat     = products.filter((x) => x.isFeatured).slice(0, 4);
        setNewest(products);
        setFeatured(feat.length ? feat : products.slice(0, 4));
        setCats((c.data.data || c.data || []).slice(0, 6));
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-14 grid lg:grid-cols-2 gap-10 items-center">
        {/* Left copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-lg"
        >
          
          <h1 className="text-4xl md:text-5xl leading-tight">
            Every thread {" "}
            <span className="text-primary">tells a story.</span>
          </h1>
          <p className="mt-4 text-base text-body">
           Discover thoughtfully crafted apparel designed for comfort, quality, and everyday elegance. From everyday essentials to timeless classics, Vastra brings together pieces you'll reach for season after season.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/shop" className="btn-primary">
              Shop the collection <FiArrowRight />
            </Link>
            <Link to="/about" className="btn-outline">Our story</Link>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4 max-w-xs">
            {[["12k+", "Happy customers"], ["4.9★", "Avg. rating"], ["48h", "Fast dispatch"]].map(([n, l]) => (
              <div key={l}>
                <p className="text-xl font-display text-dark">{n}</p>
                <p className="text-xs text-muted mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right carousel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative pb-4"
        >
          <Carousel />
        </motion.div>
      </section>

      {/* ── Categories ── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 mt-4">
        <Heading title="Shop by category" subtitle="Find your next favorite thing" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
          {cats.length === 0
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-section animate-pulse" />
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
              <Link to="/shop" className="text-sm text-primary font-semibold inline-flex items-center gap-1">
                View all <FiArrowRight />
              </Link>
            }
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : (featured.length ? featured : newest.slice(0, 4)).map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
          </div>
        </div>
      </section>

      {/* ── Promises ── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-14 grid md:grid-cols-3 gap-5">
        {[
          [<FiTruck key="t" />, "Soft & swift shipping", "Free over $50, tracked everywhere."],
          [<FiShield key="s" />, "Honest guarantee",     "30-day returns, no questions asked."],
          [<FiAward key="a" />, "Small-batch quality",   "Each piece is checked by hand."],
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
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : newest.slice(0, 8).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
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