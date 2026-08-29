import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/AppShell";
import { FoodSettings } from "@/components/settings/FoodSettings";
import { CareItemSettings } from "@/components/settings/CareItemSettings";
import { MoveSettings } from "@/components/settings/MoveSettings";
import { RemindersSettings } from "@/components/settings/RemindersSettings";
import { PreferencesSettings } from "@/components/settings/PreferencesSettings";
import { DataSettings } from "@/components/settings/DataSettings";

export const Route = createFileRoute("/settings")({
  component: Settings,
});

function Settings() {
  return (
    <AppShell>
      <h1 className="text-2xl text-foreground">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">Quietly shapes Sanctuary and reminders.</p>

      <div className="mt-6 space-y-4">
        <FoodSettings />
        <CareItemSettings
          list="medications"
          title="Medication"
          description="Create, edit, or remove what you're keeping track of."
          addLabel="Add medication"
        />
        <CareItemSettings
          list="supplements"
          title="Supplements"
          description="Create, edit, or remove what you're keeping track of."
          addLabel="Add supplement"
        />
        <MoveSettings />
        <RemindersSettings />
        <PreferencesSettings />
        <DataSettings />
      </div>
    </AppShell>
  );
}
