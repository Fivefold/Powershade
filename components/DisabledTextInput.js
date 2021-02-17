import React from "react";
import { TextInput } from "react-native-paper";

export const DisabledTextInput = (props) => {
  const [text, setText] = React.useState(this.value);

  return <TextInput {...props} value={props.value} disabled="true" />;
};
