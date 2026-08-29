import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

import { useHydrated } from "@/lib/motion";
import {
  describeCapability,
  requestNotificationPermission,
  type NotificationCapability,
} from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import { SettingsSection } from "./SettingsSection";

export function RemindersSettings() {
  const hydrated = useHydrated();
  const [capability, setCapability] = useState<NotificationCapability | null>(null);

  useEffect(() => {
    if (hydrated) setCapability(describeCapability());
  }, [hydrated]);

  async function enable() {
    await requestNotificationPermission();
    setCapability(describeCapability());
  }

  if (!capability) {
    return (
      <SettingsSection title="Reminders">
        <p className="text-sm text-muted-foreground">Checking what this browser can do…</p>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection title="Reminders">
      <div className="flex items-start gap-3">
        <Bell className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={1.6} />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">{capability.caveat}</p>
          {capability.supported && capability.permission === "default" && (
            <Button size="sm" variant="outline" className="mt-3" onClick={enable}>
              Allow reminders
            </Button>
          )}
          {capability.supported && capability.permission === "denied" && (
            <p className="mt-2 text-xs text-muted-foreground">
              Reminders are blocked in your browser settings — Avora can't override that.
            </p>
          )}
          {capability.supported && capability.permission === "granted" && (
            <p className="mt-2 text-xs text-primary">Reminders are allowed.</p>
          )}
        </div>
      </div>
    </SettingsSection>
  );
}
