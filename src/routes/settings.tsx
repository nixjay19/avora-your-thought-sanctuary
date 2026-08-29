import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/settings")({
  component: Settings,
});

function Settings() {
  return (
    <AppShell>
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="text-2xl text-foreground">Settings</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Preferences for Avora will live here.
        </p>
      </div>
    </AppShell>
  );
}
