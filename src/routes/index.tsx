import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/AppShell";
import { Composer } from "@/components/thoughts/Composer";
import { ThoughtStream } from "@/components/thoughts/ThoughtStream";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <AppShell>
      <h1 className="text-2xl text-foreground">Thoughts</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Get it out of your head. Sort it out later, or don't.
      </p>

      <div className="mt-5">
        <Composer />
      </div>

      <ThoughtStream />
    </AppShell>
  );
}
