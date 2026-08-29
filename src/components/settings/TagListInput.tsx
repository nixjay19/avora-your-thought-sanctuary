import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";

import { Input } from "@/components/ui/input";

export function TagListInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");

  function commit() {
    const value = draft.trim();
    if (!value) return;
    if (!values.some((existing) => existing.toLowerCase() === value.toLowerCase())) {
      onChange([...values, value]);
    }
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commit();
    } else if (event.key === "Backspace" && draft === "" && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  }

  return (
    <div>
      {values.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {values.map((value, index) => (
            <span
              key={`${value}-${index}`}
              className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-card/50 px-2.5 py-1 text-xs text-foreground"
            >
              {value}
              <button
                type="button"
                onClick={() => onChange(values.filter((_, i) => i !== index))}
                aria-label={`Remove ${value}`}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" strokeWidth={1.8} />
              </button>
            </span>
          ))}
        </div>
      )}
      <Input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        placeholder={placeholder}
        className="bg-transparent"
      />
    </div>
  );
}
