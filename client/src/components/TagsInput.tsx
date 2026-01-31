import { useMemo, useState } from "react";

type Props = {
  value: string[]; // tags normalizadas
  onChange: (tags: string[]) => void;
  placeholder?: string;
};

export default function TagsInput({ value, onChange, placeholder }: Props) {
  const [text, setText] = useState("");

  const add = (raw: string) => {
    const t = raw.trim();
    if (!t) return;
    const next = Array.from(new Set([...value, t]));
    onChange(next);
  };

  const remove = (tag: string) => onChange(value.filter(t => t !== tag));

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = e => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      add(text.replace(",", ""));
      setText("");
    }
    if (e.key === "Backspace" && !text && value.length) {
      remove(value[value.length - 1]);
    }
  };

  const helper = useMemo(() => "Use vírgula ou Enter para adicionar.", []);

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map(tag => (
          <button
            key={tag}
            type="button"
            onClick={() => remove(tag)}
            className="px-2 py-1 rounded-full bg-muted text-sm hover:bg-muted/70"
            title="Remover"
          >
            {tag} <span className="opacity-60">×</span>
          </button>
        ))}
      </div>

      <input
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={
          placeholder ?? "Digite tags... (ex: Ceilândia, iluminação, buraco)"
        }
        className="w-full bg-transparent outline-none"
      />

      <div className="mt-2 text-xs text-muted-foreground">{helper}</div>
    </div>
  );
}
