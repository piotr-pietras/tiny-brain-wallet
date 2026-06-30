import { View } from "../components/View";
import React from "react";

type Props = {
  children: React.ReactNode;
};

export function BackgroundTint({ children }: Props) {
  return (
    <View
      gap={16}
      full
      style={{
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1000,
      }}
    >
      {children}
    </View>
  );
}
