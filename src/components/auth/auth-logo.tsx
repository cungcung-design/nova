import Link from "next/link";

export function AuthLogo() {
  return (
    <div className="mb-6 flex w-full justify-center">
      <Link
        href="/"
        className="flex flex-col items-center gap-3 text-center"
        aria-label="NOVA home"
      >
        <span className="auth-badge font-panchang">N</span>
        <span className="font-panchang text-sm font-semibold uppercase tracking-[0.28em] text-foreground">
          NOVA
        </span>
      </Link>
    </div>
  );
}
