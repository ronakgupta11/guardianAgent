"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useDemoMode } from "@/providers/demo-mode"

export default function SettingsPage() {
  const { demo, toggleDemo } = useDemoMode()

  return (
    <div className="mx-auto max-w-3xl px-6 md:px-10 py-10">
      <h1 className="text-2xl font-semibold mb-2">Settings</h1>
      <p className="text-sm text-muted-foreground mb-6">Configure your preferences and demo options.</p>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="demo-switch">Enable Demo Mode</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Use simulated data and mock actions suitable for demos.
              </p>
            </div>
            <Switch id="demo-switch" checked={demo} onCheckedChange={toggleDemo} aria-checked={demo} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notif-switch">Notifications</Label>
              <p className="text-xs text-muted-foreground mt-1">Enable basic UI notifications for key actions.</p>
            </div>
            <Switch id="notif-switch" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="analytics-switch">Anonymous Analytics</Label>
              <p className="text-xs text-muted-foreground mt-1">Help us improve with privacy-friendly metrics.</p>
            </div>
            <Switch id="analytics-switch" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
