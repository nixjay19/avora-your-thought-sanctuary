import { useAvora } from "@/lib/data/store";
import { Switch } from "@/components/ui/switch";
import { SettingsSection } from "./SettingsSection";

export function PreferencesSettings() {
  const { data, setPreferences } = useAvora();

  return (
    <SettingsSection title="Preferences">
      <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5">
        <div>
          <p className="text-sm text-foreground">Calm Motion</p>
          <p className="text-xs text-muted-foreground">Stills the drifting, breathing, glow.</p>
        </div>
        <Switch
          checked={data.preferences.calmMotion}
          onCheckedChange={(checked) => setPreferences({ calmMotion: checked })}
        />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Avora also automatically follows your device's reduced motion setting.
      </p>
    </SettingsSection>
  );
}
