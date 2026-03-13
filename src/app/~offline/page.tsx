export default function OfflinePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center bg-[#0F172A]">
      <img src="/logo.png" alt="FluxQR" width={64} height={64} />
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-slate-100">You&apos;re offline</h1>
        <p className="text-sm text-slate-400">Check your connection and try again.</p>
      </div>
      <a
        href="/"
        className="inline-flex items-center justify-center rounded-md bg-brand-500 hover:bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors"
      >
        Try again
      </a>
    </main>
  );
}
