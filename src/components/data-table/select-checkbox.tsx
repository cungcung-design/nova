"use client";

type SelectCheckboxProps = {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  label: string;
};

export function SelectCheckbox({
  checked,
  indeterminate = false,
  onChange,
  label,
}: SelectCheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      ref={(element) => {
        if (element) {
          element.indeterminate =
            indeterminate;
        }
      }}
      onChange={onChange}
      aria-label={label}
      className="h-4 w-4 rounded border"
    />
  );
}
