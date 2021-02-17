import React from "react";
import { TextInput } from "react-native-paper";

export const SensorPosInput = (props) => {
  const [text, setText] = React.useState(props.initialValue);

  return (
    <TextInput
      {...props}
      value={text}
      onChangeText={(text) => setText(text)}
      onBlur={() => props.setSensorPos(text)}
    />
  );
};
