/**
 * Home page — hero placeholder + scroll scaffold (Task 2.1 test harness)
 *
 * The hero is full-viewport height so there's something to scroll past
 * and the header glass transition can be observed.  Extra sections below
 * give enough scroll depth to settle the frosted bar.
 *
 * The real hero (scroll-animated, 3D product reveal) is Task 2.2.
 * The real sections (products, about, etc.) come in later tasks.
 */
export default function Home() {
  return (
    <>
      {/* ── Hero — full viewport, overlaid by the fixed header ──────── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 py-32 text-center bg-cream">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-espresso/50">
          Pure · botanical · made in Canada
        </p>
        <h1 className="font-display font-semibold text-5xl sm:text-6xl lg:text-7xl leading-tight tracking-tight text-espresso max-w-3xl">
          Skin care rooted in{" "}
          <span className="text-clay">West-African tradition</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-espresso/70 font-body leading-relaxed">
          Shea butter, argan oil, black soap and cold-pressed botanicals —
          crafted by hand in Barrie, Ontario. As seen at Walmart, Shoppers,
          Pharmaprix &amp; Rexall.
        </p>
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <a
            href="#products"
            className="inline-flex items-center justify-center rounded-full bg-clay text-cream font-semibold px-8 py-3 text-sm transition-colors hover:bg-orange"
          >
            Shop now
          </a>
          <a
            href="#story"
            className="inline-flex items-center justify-center rounded-full border border-espresso/30 text-espresso font-semibold px-8 py-3 text-sm transition-colors hover:bg-espresso/5"
          >
            Our story
          </a>
        </div>
        {/* Scroll nudge */}
        <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs text-espresso/40 tracking-widest uppercase">
          Scroll to explore ↓
        </p>
      </section>

      {/* ── Placeholder sections — scroll depth for header transition ── */}
      <section
        id="products"
        className="bg-[#F0E6D0] py-24 px-6 text-center"
      >
        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-espresso mb-4">
          Featured Products
        </h2>
        <p className="text-espresso/60 max-w-lg mx-auto text-base">
          Product cards coming in Task 2.3 — this is a placeholder section for
          scroll testing.
        </p>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {["Shea Body Butter", "Argan Face Serum", "Black Soap Bar"].map(
            (name) => (
              <div
                key={name}
                className="rounded-2xl bg-cream/70 border border-espresso/10 h-64 flex items-center justify-center"
              >
                <span className="text-espresso/40 text-sm font-medium">
                  {name} — coming soon
                </span>
              </div>
            )
          )}
        </div>
      </section>

      <section
        id="story"
        className="bg-espresso text-cream py-24 px-6 text-center"
      >
        <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-4">
          Our Story
        </h2>
        <p className="max-w-xl mx-auto text-cream/70 text-base leading-relaxed">
          Full story section coming in a later task — placeholder for scroll
          depth.
        </p>
      </section>
    </>
  );
}
