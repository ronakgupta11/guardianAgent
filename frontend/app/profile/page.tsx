"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 md:px-10 py-10">
      <h1 className="text-2xl font-semibold mb-2">Profile</h1>
      <p className="text-sm text-muted-foreground mb-6">Manage your profile details used across the app.</p>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Image
              src="/placeholder-user.jpg"
              alt="Profile avatar"
              width={64}
              height={64}
              className="rounded-full border"
            />
            <Button variant="outline">Change Avatar</Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Satoshi Nakamoto" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="satoshi@example.com" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button">Save Changes</Button>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
