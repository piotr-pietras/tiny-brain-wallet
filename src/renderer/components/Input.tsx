import React, { useMemo } from "react";
import { Text } from "./Text";

type Props = {
  value?: string;
  type?: "text" | "number" | "password";
  multiline?: boolean;
  rows?: number;
  onChange?: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  name?: string;
  form?: {
    errors: Record<string, string>;
    resetErrors: (name: string) => void;
    validate: (name: string) => Promise<boolean>;
  };
};

export function Input({
  value,
  type = "text",
  onChange,
  placeholder,
  multiline = false,
  rows = 6,
  style,
  form,
  name,
}: Props) {
  const commonStyle: React.CSSProperties = useMemo(
    () => ({
      width: "100%",
      padding: "8px",
      fontSize: "16px",
      fontFamily: "inherit",
      backgroundColor: "var(--surface)",
      color: "var(--primary)",
      border: "1px solid rgba(0, 0, 0, 0.1)",
      borderRadius: "4px",
      outline: "none",
      resize: "none",
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxSizing: "border-box",
      ...style,
    }),
    [style]
  );

  return (
    <div style={{ width: "100%" }}>
      {type === "text" ? (
        <textarea
          value={value}
          rows={multiline ? rows : 1}
          onChange={(e) => {
            name && form?.resetErrors(name);
            onChange?.(e.target.value);
          }}
          onBlur={() => {
            name && void form?.validate(name);
          }}
          placeholder={placeholder}
          style={{ ...commonStyle }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => {
            name && form?.resetErrors(name);
            onChange?.(e.target.value);
          }}
          onBlur={() => {
            name && void form?.validate(name);
          }}
          placeholder={placeholder}
          style={{ ...commonStyle }}
        />
      )}
      {name && form?.errors[name] && (
        <Text type="label" style={{ color: "var(--error)" }}>
          {form.errors[name]}
        </Text>
      )}
    </div>
  );
}
