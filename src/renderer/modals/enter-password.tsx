import React, { useState } from "react";
import { View } from "../components/View";
import { Card } from "../components/Card";
import { Text } from "../components/Text";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { unwrapIpcError } from "../helpers/unwrapIpcError";

type Props = {
  onAccept: (password: string) => Promise<void>;
  onCancel: () => void;
};

export function EnterPasswordModal({ onCancel, onAccept }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");

  const handleAccept = async () => {
    try {
      setIsLoading(true);
      setError("");
      await onAccept(password);
    } catch (error) {
      setError(unwrapIpcError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      gap={16}
      style={{
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1000,
      }}
    >
      <Card>
        <View>
          <View>
            <Text type="label">Wallet Password</Text>
            <Input
              value={password}
              onChange={setPassword}
              placeholder="Enter the wallet's password"
              type="password"
            />
            {error && (
              <Text type="label" style={{ color: "var(--error)" }}>
                {error}
              </Text>
            )}
          </View>

          <View direction="row" gap={32} style={{ marginTop: 16 }}>
            <Button
              loading={isLoading}
              text="Cancel"
              type="text"
              onClick={onCancel}
            />
            <Button
              loading={isLoading}
              text="Accept"
              type="primary"
              onClick={handleAccept}
            />
          </View>
        </View>
      </Card>
    </View>
  );
}
