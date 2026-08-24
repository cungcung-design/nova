import Link from "next/link";

import WaveGridBackground from "@/components/WaveGridBackground";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="relative h-screen">
        <WaveGridBackground
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
        >
          <div className="flex h-full flex-col items-center justify-center px-6">
            <div className="flex w-full max-w-lg flex-col items-center gap-8 text-center sm:items-start sm:text-left">
              <div className="space-y-3">
                <p className="text-sm font-medium tracking-wide text-zinc-500">
                  NOVA
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-black sm:text-5xl">
                  Modern business management
                </h1>
                <p className="max-w-md text-lg leading-8 text-zinc-600">
                  Customers, products, orders, and reporting for your workspace.
                </p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="pointer-events-auto inline-flex min-h-11 items-center justify-center rounded-lg bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="pointer-events-auto inline-flex min-h-11 items-center justify-center rounded-lg border border-zinc-200 bg-white/80 px-4 py-2.5 text-sm font-medium text-zinc-900 backdrop-blur-sm"
                >
                  Create an account
                </Link>
              </div>
            </div>
          </div>
        </WaveGridBackground>
      </section>
    </main>
  );
}
