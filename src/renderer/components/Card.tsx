import React, { useState } from "react";

type Props = {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
};

export function Card({
  children,
  style,
  onClick,
  selected = false,
  disabled = false,
}: Props) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor:
          isHovered && onClick && !disabled
            ? "var(--surface-variant)"
            : "var(--surface)",
        padding: "16px",
        opacity: disabled ? 0.5 : 1,
        borderRadius: "8px",
        boxShadow: "0 0 16px 0 rgba(0, 0, 0, 0.2)",
        width: "fit-content",
        boxSizing: "border-box",
        cursor: onClick && !disabled ? "pointer" : "default",
        scale: isHovered && onClick && !disabled ? 1.03 : 1,
        transition: "background-color 0.2s ease, scale 0.2s ease",
        border: selected ? "2px solid var(--info)" : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
