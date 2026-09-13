"use client";

import { Trash } from "@phosphor-icons/react";

type SimpleState = { error?: string; ok?: boolean };

/**
 * Small trash-icon form that invokes a (prev, formData) server action with the
 * given hidden fields. Optional confirm dialog before submitting.
 */
export function InlineDelete({
  action,
  fields,
  confirmText,
  label = "Delete",
}: {
  action: (prev: SimpleState, fd: FormData) => Promise<SimpleState>;
  fields: Record<string, string>;
  confirmText?: string;
  label?: string;
}) {
  return (
    <form
      action={(fd) => {
        void action({}, fd);
      }}
      onSubmit={(e) => {
        if (confirmText && !confirm(confirmText)) e.preventDefault();
      }}
    >
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button
        type="submit"
        title={label}
        aria-label={label}
        className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-danger-soft hover:text-danger"
      >
        <Trash size={16} weight="bold" />
      </button>
    </form>
  );
}
