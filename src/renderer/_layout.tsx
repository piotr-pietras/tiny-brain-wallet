import React from "react";
import { Outlet } from "react-router";
import { View } from "./components/View";
import { Text } from "./components/Text";

export default function AppLayout() {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Outlet />
      <View
        direction="row"
        style={{ position: "fixed", bottom: 0, right: 0 }}
      >
        <Text type="label">node({window.api?.versions().node})</Text>
        <Text type="label">chrome({window.api?.versions().chrome})</Text>
        <Text type="label">electron({window.api?.versions().electron})</Text>
      </View>
    </div>
  );
}
