"use client";

import {
  useEffect,
  useState,
  type ComponentType,
} from "react";

type WaveGridLazyProps = {
  children?: React.ReactNode;
  className?: string;
  gridSize?: number;
  colorBase?: string;
  colorHigh?: string;
  waveAmplitude?: number;
  waveSpeed?: number;
  waveFrequency?: number;
  waveWidth?: number;
  waveMaxHeight?: number;
  waveJitter?: number;
  autoAnimate?: boolean;
  vignette?: boolean;
};

export function WaveGridLazy(props: WaveGridLazyProps) {
  const [Component, setComponent] = useState<
    ComponentType<WaveGridLazyProps> | null
  >(null);

  useEffect(() => {
    let cancelled = false;

    void import("@/components/WaveGridBackground").then((mod) => {
      if (!cancelled) {
        setComponent(() => mod.default);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!Component) {
    return <div className="absolute inset-0 bg-[#808080]" aria-hidden />;
  }

  return <Component {...props} />;
}
