import { useAvora } from "@/lib/data/store";
import type { Frequency } from "@/lib/data/types";
import { frequencies, frequencyLabel } from "@/lib/data/labels";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingsSection } from "./SettingsSection";
import { TagListInput } from "./TagListInput";

export function MoveSettings() {
  const { data, setMove } = useAvora();
  const { move } = data;

  return (
    <SettingsSection title="Movement" description="Whatever moving means to you, on your terms.">
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm text-foreground">
            Types of movement you enjoy
          </label>
          <TagListInput
            values={move.types}
            onChange={(types) => setMove({ types })}
            placeholder="e.g. walking, stretching"
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5">
          <span className="text-sm text-foreground">Gentle reminder</span>
          <Switch
            checked={move.reminderOn}
            onCheckedChange={(checked) => setMove({ reminderOn: checked })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Preferred time</label>
            <Input
              type="time"
              value={move.preferredTime}
              onChange={(event) => setMove({ preferredTime: event.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Frequency</label>
            <Select
              value={move.frequency}
              onValueChange={(value) => setMove({ frequency: value as Frequency })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {frequencies.map((frequency) => (
                  <SelectItem key={frequency} value={frequency}>
                    {frequencyLabel[frequency]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
