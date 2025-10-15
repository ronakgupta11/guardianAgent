export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl px-6 md:px-10 h-20 flex items-center justify-between text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} GuardianAgent</span>
        <span>Demo-only. Not financial advice.</span>
      </div>
    </footer>
  )
}
