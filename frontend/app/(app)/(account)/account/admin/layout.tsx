import ClientAuthGuard from '@/components/ClientAuthGuard'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <ClientAuthGuard requireAdmin>{children}</ClientAuthGuard>
}
