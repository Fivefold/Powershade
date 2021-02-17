import React from "react";
import { TextInput } from "react-native-paper";

export const WindowDimInput = (props) => {
  const [text, setText] = React.useState("");

  return (
    <TextInput
      {...props}
      onChangeText={(text) => setText(text)}
      onBlur={() => props.setWindowDim(Number(text))}
    />
  );
};
