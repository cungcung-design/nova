import Link from "next/link";

import { WaveGridLazy } from "@/components/wave-grid-lazy";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="relative min-h-screen overflow-hidden">
        <WaveGridLazy
          className="absolute inset-0"
          gridSize={40}
          colorBase="#ffffff"
          colorHigh="#0055ff"
          waveAmplitude={0.4}
          waveSpeed={6}
          waveFrequency={1.2}
          waveWidth={3}
          waveMaxHeight={0.4}
          waveJitter={0.2}
          autoAnimate
          vignette
        />

        <div className="pointer-events-none relative z-10 flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-4xl text-center">
            <p className="font-panchang text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500 sm:text-sm">
              NOVA
            </p>

            <h1 className="mt-5 max-w-full font-excon text-4xl font-bold tracking-tight text-zinc-950 text-balance sm:mt-6 sm:text-5xl md:text-6xl lg:text-7xl">
              Modern business
              <br />
              management
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-600 sm:mt-6 sm:text-lg sm:leading-8">
              Customers, products, orders, analytics, and reporting — everything
              your business needs in one powerful workspace.
            </p>

            <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row">
              <Link
                href="/login"
                className="pointer-events-auto inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-zinc-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 sm:w-auto"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="pointer-events-auto inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-zinc-200 bg-white/80 px-6 py-3 text-sm font-medium text-zinc-950 backdrop-blur-md transition hover:bg-white sm:w-auto"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
