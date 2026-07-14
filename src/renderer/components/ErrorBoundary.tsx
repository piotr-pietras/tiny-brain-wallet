import React from "react";
import { Text } from "./Text";
import { Button } from "./Button";
import { View } from "./View";

export class ErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
  },
  {
    hasError: boolean;
    error: Error | null;
  }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
            margin: "0 16px",
          }}
        >
          <Text type="title">Something went wrong.</Text>
          <View
            style={{
              padding: 16,
              backgroundColor: "var(--surface)",
              borderRadius: 8,
            }}
          >
            <Text type="body">{this.state.error?.toString()}</Text>
            <Text type="body">
              {JSON.stringify(
                this.state.error,
                Object.getOwnPropertyNames(this.state.error)
              )}
            </Text>
          </View>
          <Text type="body" bold>
            In order to enhance the app, please share the following information
            with the developer via GitHub Issues describing the reproduction
            steps. 🙏
          </Text>
          <Button
            type="primary"
            text="Restart App"
            onClick={() => {
              window.api.restartWindow();
            }}
          />
        </View>
      );
    } else {
      return this.props.children;
    }
  }
}
