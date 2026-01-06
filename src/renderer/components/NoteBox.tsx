import React, { useMemo } from "react";
import { Text } from "./Text";
import { View } from "./View";

type Props = {
  text: string | React.ReactNode;
  type: "success" | "error" | "warning" | "info";
  style?: React.CSSProperties;
};

const types = {
  success: {
    backgroundColor: "var(--success)",
    icon: "✅",
  },
  error: {
    backgroundColor: "var(--error)",
    icon: "❌",
  },
  warning: {
    backgroundColor: "var(--warning)",
    icon: "⚠️",
  },
  info: {
    backgroundColor: "var(--info)",
    icon: "ℹ️",
  },
};

export function NoteBox({ text, type, style }: Props) {
  const { backgroundColor, icon } = useMemo(() => types[type], [type]);

  return (
    <div style={{ backgroundColor, padding: 16, borderRadius: 8, ...style }}>
      {typeof text === "string" ? (
        <Text type="body">
          {icon} {text}
        </Text>
      ) : (
        <View direction="row" gap={16} style={{ alignItems: "start" }}>
          <Text type="body">{icon}</Text>
          {text}
        </View>
      )}
    </div>
  );
}
