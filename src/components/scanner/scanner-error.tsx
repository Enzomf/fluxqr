// Plain <img> tag is used intentionally — next/image would add ~15KB of client JS
// to the scanner bundle, violating the CLAUDE.md hard rule of under 10KB JS on /q/[slug].
// The scanner error page is static content with no interactivity; native <img> is sufficient.

interface ScannerErrorProps {
  title: string
  description: string
  statusCode?: string
}

export function ScannerError({ title, description, statusCode }: ScannerErrorProps) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-surface px-4">
      <div className="bg-surface-raised rounded-lg p-8 w-full max-w-sm text-center space-y-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="FluxQR" width={80} height={80} className="mx-auto" />
        <p className="text-brand-500 font-bold text-lg">FluxQR</p>
        {statusCode && (
          <p className="text-5xl font-bold text-muted-foreground">{statusCode}</p>
        )}
        <h1 className="text-foreground font-semibold text-lg">{title}</h1>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <p className="text-xs text-muted-foreground mt-6">Powered by FluxQR</p>
    </main>
  )
}
