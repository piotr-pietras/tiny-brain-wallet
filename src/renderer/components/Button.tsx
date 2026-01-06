import React, { useMemo, useState } from "react";
import { Text } from "./Text";
import { Loader } from "./Loader";
import { View } from "./View";

type Props = {
  text: string;
  type: "primary" | "outline" | "text";
  onClick: () => void;
  style?: React.CSSProperties;
  loading?: boolean;
};

export function Button({ text, type, onClick, style, loading = false }: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const buttonStyle = useMemo(() => {
    switch (type) {
      case "primary":
        return {
          backgroundColor: "var(--primary)",
          color: "white",
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          color: "var(--primary)",
          border: "1px solid var(--primary)",
        };
      case "text":
        return {
          backgroundColor: "transparent",
          color: "var(--primary)",
          border: "none",
        };
      default:
        return {
          backgroundColor: "var(--primary)",
          color: "white",
        };
    }
  }, [type]);

  return (
    <button
      disabled={loading}
      style={{
        padding: "8px 16px",
        borderRadius: "4px",
        border: "none",
        cursor: "pointer",
        scale: isHovered ? 1.03 : 1,
        opacity: (isPressed || loading) ? 0.6 : 1,
        transition: "scale 0.2s ease, opacity 0.05s ease",
        ...buttonStyle,
        ...style,
      }}
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <View direction="row" gap={8}>
        {loading && <Loader size={8} color="white" />}
        <Text type="body">{text}</Text>
      </View>
    </button>
  );
}
