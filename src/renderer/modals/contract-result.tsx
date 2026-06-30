import React from "react";
import { View } from "../components/View";
import { Card } from "../components/Card";
import { Text } from "../components/Text";
import { Button } from "../components/Button";
import { NoteBox } from "../components/NoteBox";
import { Input } from "../components/Input";
import { BackgroundTint } from "./background-tint";

type Props = {
  onDone: () => void;
  result: string | null;
  errorMessage: string | null;
};

export function ContractResultModal({ onDone, result, errorMessage }: Props) {
  return (
    <BackgroundTint>
      <Card>
        <View direction="column" gap={16}>
          <Text type="title">Contract Result</Text>
          {errorMessage && <NoteBox type="error" text={errorMessage} />}
          {result && <Input value={result} type="text" />}

          <View direction="row" gap={32} style={{ marginTop: 16 }}>
            <Button text="Done" type="primary" onClick={onDone} />
          </View>
        </View>
      </Card>
    </BackgroundTint>
  );
}
