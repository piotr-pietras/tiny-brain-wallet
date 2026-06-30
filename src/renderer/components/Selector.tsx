import React from "react";

type Props<T> = {
  options: T[];
  value: T | undefined;
  onChange: (value: T) => void;
  style?: React.CSSProperties;
  disabled?: boolean;
};

export function Selector<T extends string>({
  options,
  value,
  onChange,
  style,
  disabled = false,
}: Props<T>) {
  return (
    <select
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      style={{
        width: "350px",
        padding: "8px",
        fontSize: "16px",
        fontFamily: "inherit",
        backgroundColor: "var(--surface)",
        color: "var(--primary)",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        borderRadius: "4px",
        outline: "none",
        cursor: "pointer",
        transition: "all 0.2s ease",
        ...style,
      }}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
