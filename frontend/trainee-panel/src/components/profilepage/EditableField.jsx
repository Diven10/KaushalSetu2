import React from "react";

export default function EditableField({ label, value, onChange, placeholder }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-ink-soft">{label}</span>
      <input
        type="text"
        value={value || ""}
        placeholder={placeholder || "Not yet shared"}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none"
      />
    </label>
  );
}
