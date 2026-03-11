import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard — FluxQR',
}

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">My QR Codes</h1>
      <p className="text-muted-foreground mt-2">Your QR codes will appear here.</p>
    </div>
  )
}
