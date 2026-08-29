import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/AppShell";
import { WorldPage } from "@/components/world/WorldPage";

export const Route = createFileRoute("/world")({
  component: World,
});

function World() {
  return (
    <AppShell>
      <WorldPage />
    </AppShell>
  );
}
