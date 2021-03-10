import React from "react";
import { TextInput } from "react-native-paper";

export const CustomTextInput = (props) => {
  const [text, setText] = React.useState(props.value);

  return (
    <TextInput
      {...props}
      value={text}
      onChangeText={(text) => {
        setText(text);
        props.setValue(props.id, text);
      }}
    />
  );
};
