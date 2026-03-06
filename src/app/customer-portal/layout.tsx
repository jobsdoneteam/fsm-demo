// Standalone layout — completely outside the (app) authenticated shell.
// No session check, no sidebar, no nav.
export default function CustomerPortalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}