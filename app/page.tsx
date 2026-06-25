/**
 * Home page — minimal hero placeholder (Task 0.6)
 * The real hero (scroll-animated, 3D product reveal) is Task 2.2.
 */
export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[70vh] px-6 py-24 text-center bg-cream">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-espresso/50">
        Pure · botanical · made in Canada
      </p>
      <h1 className="font-display font-semibold text-5xl sm:text-6xl lg:text-7xl leading-tight tracking-tight text-espresso max-w-3xl">
        Skin care rooted in{" "}
        <span className="text-clay">West-African tradition</span>
      </h1>
      <p className="mt-6 max-w-xl text-lg text-espresso/70 font-body leading-relaxed">
        Shea butter, argan oil, black soap and cold-pressed botanicals — crafted
        by hand in Barrie, Ontario. As seen at Walmart, Shoppers, Pharmaprix
        &amp; Rexall.
      </p>
      <div className="mt-10 flex flex-wrap gap-4 justify-center">
        <a
          href="#"
          className="inline-flex items-center justify-center rounded-full bg-clay text-cream font-semibold px-8 py-3 text-sm transition-colors hover:bg-orange"
        >
          Shop now
        </a>
        <a
          href="#"
          className="inline-flex items-center justify-center rounded-full border border-espresso/30 text-espresso font-semibold px-8 py-3 text-sm transition-colors hover:bg-espresso/5"
        >
          Our story
        </a>
      </div>
    </section>
  );
}
