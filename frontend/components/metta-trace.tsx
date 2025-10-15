export function MeTTaTrace({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="rounded-lg border p-4">
      <h5 className="font-medium">Plan Trace</h5>
      <div className="mt-3 grid gap-3">
        {items.map((it, idx) => (
          <div key={idx} className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-muted-foreground">{it.label}</div>
            <div className="col-span-2">{it.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
