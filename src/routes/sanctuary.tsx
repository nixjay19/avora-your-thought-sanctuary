import { createFileRoute } from "@tanstack/react-router";
import { Pill, Sparkles } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { NourishSection } from "@/components/sanctuary/NourishSection";
import { CareItemsSection } from "@/components/sanctuary/CareItemsSection";
import { MoveSection } from "@/components/sanctuary/MoveSection";

export const Route = createFileRoute("/sanctuary")({
  component: Sanctuary,
});

function Sanctuary() {
  return (
    <AppShell>
      <h1 className="text-2xl text-foreground">Sanctuary</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        A quiet place to tend to yourself. No targets, no tally.
      </p>

      <div className="mt-6 space-y-5">
        <NourishSection />
        <CareItemsSection
          icon={Pill}
          title="Medication"
          accent="var(--lantern)"
          area="medication"
          list="medications"
          actionLabel="I took it"
          emptyHint="No medications set up yet."
        />
        <CareItemsSection
          icon={Sparkles}
          title="Supplements"
          accent="var(--moss)"
          area="supplements"
          list="supplements"
          actionLabel="I took them"
          emptyHint="No supplements set up yet."
        />
        <MoveSection />
      </div>
    </AppShell>
  );
}
