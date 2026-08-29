import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/world")({
  component: World,
});

function World() {
  return (
    <AppShell>
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="text-2xl text-foreground">World</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Your creature and its living world are waiting to be discovered here.
        </p>
      </div>
    </AppShell>
  );
}
