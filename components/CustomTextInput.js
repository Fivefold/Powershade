import React from "react";
import { TextInput } from "react-native-paper";

export const CustomTextInput = (props) => {
  const [text, setText] = React.useState(this.value);

  return (
    <TextInput {...props} value={text} onChangeText={(text) => setText(text)} />
  );
};
