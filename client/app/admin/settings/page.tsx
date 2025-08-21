"use client"

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function AdminSettingsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Admin Settings</CardTitle>
                <CardDescription>
                    Select a category from the sidebar to manage site settings.
                </CardDescription>
            </CardHeader>
        </Card>
    )
}
