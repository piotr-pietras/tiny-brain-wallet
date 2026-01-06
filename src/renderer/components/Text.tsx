import React, { useMemo } from "react";

type Props = {
  children: React.ReactNode;
  type?: "title" | "body" | "label";
  bold?: boolean;
  style?: React.CSSProperties;
};

export function Text({ children, type = "body", bold = false, style }: Props) {
  const textStyle = useMemo(() => {
    switch (type) {
      case "title":
        return { fontSize: 24, fontWeight: bold ? "bold" : "normal" };
      case "body":
        return { fontSize: 16, fontWeight: bold ? "bold" : "normal" };
      case "label":
        return { fontSize: 12, fontWeight: bold ? "bold" : "normal" };
      default:
        return { fontSize: 16, fontWeight: bold ? "bold" : "normal" };
    }
  }, [type]);

  return <div style={{ ...textStyle, ...style }}>{children}</div>;
}
