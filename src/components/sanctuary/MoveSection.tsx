import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Wind } from "lucide-react";

import { useAvora } from "@/lib/data/store";
import { SanctuaryCard } from "./SanctuaryCard";

export function MoveSection() {
  const { data, logCare } = useAvora();
  const [tendedAt, setTendedAt] = useState(0);
  const types = data.move.types;

  if (types.length === 0) {
    return (
      <SanctuaryCard icon={Wind} title="Move" tendedAt={0}>
        <p className="text-sm text-muted-foreground">
          No movement preferences yet.{" "}
          <Link to="/settings" className="text-primary underline-offset-4 hover:underline">
            Add a few in Settings
          </Link>{" "}
          — even a slow stretch counts.
        </p>
      </SanctuaryCard>
    );
  }

  return (
    <SanctuaryCard
      icon={Wind}
      title="Move"
      description={`Maybe ${types[0]?.toLowerCase()}? Or not — the offer stands.`}
      tendedAt={tendedAt}
    >
      <button
        type="button"
        onClick={() => {
          logCare("move");
          setTendedAt(Date.now());
        }}
        className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow"
      >
        I moved
      </button>
    </SanctuaryCard>
  );
}
