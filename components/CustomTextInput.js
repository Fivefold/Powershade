import React from "react";
import { TextInput } from "react-native-paper";

export const CustomTextInput = (props) => {
  const [text, setText] = React.useState("");

  return (
    <TextInput
      label={props.label}
      value={props.text}
      mode={props.mode}
      right={props.right}
      onBlur={props.onBlur}
      placeholder={props.placeholder}
      keyboardType={props.keyboardType}
      disabled={props.disabled}
      multiline={props.multiline}
      onChangeText={(text) => setText(text)}
      style={props.style}
    />
  );
};
