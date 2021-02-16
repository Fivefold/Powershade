import React from "react";
import { TextInput } from "react-native-paper";

export const SensorPosInput = (props) => {
  const [text, setText] = React.useState("");

  return (
    <TextInput
      label={props.label}
      value={text}
      mode={props.mode}
      right={props.right}
      onBlur={props.onBlur}
      placeholder={props.placeholder}
      keyboardType={props.keyboardType}
      onChangeText={(text) => setText(text)}
      onBlur={() => props.setSensorPos(text)}
      style={props.style}
    />
  );
};
