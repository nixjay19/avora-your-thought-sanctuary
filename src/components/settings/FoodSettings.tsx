import { useAvora } from "@/lib/data/store";
import type { CookingEffort } from "@/lib/data/types";
import { effortLabel } from "@/lib/meals/library";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingsSection } from "./SettingsSection";
import { TagListInput } from "./TagListInput";

const efforts: CookingEffort[] = ["none", "minimal", "some", "happy-to-cook"];

export function FoodSettings() {
  const { data, setFood } = useAvora();
  const { food } = data;

  return (
    <SettingsSection title="Food" description="Shapes the meal ideas offered in Sanctuary.">
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm text-foreground">Foods I like</label>
          <TagListInput
            values={food.likes}
            onChange={(likes) => setFood({ likes })}
            placeholder="Add a food and press Enter"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-foreground">Foods to avoid</label>
          <TagListInput
            values={food.avoid}
            onChange={(avoid) => setFood({ avoid })}
            placeholder="Anything to steer away from?"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-foreground">Foods I don't eat</label>
          <TagListInput
            values={food.dontEat}
            onChange={(dontEat) => setFood({ dontEat })}
            placeholder="Allergies, dislikes, restrictions"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-foreground">Cooking effort, most days</label>
          <Select
            value={food.effort}
            onValueChange={(value) => setFood({ effort: value as CookingEffort })}
          >
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {efforts.map((effort) => (
                <SelectItem key={effort} value={effort}>
                  {effortLabel[effort]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </SettingsSection>
  );
}
