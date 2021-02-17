import React from "react";
import { StyleSheet } from "react-native";
import { TextInput } from "react-native-paper";

import colors from "../constants/colors";

export const WindowNameInput = (props) => {
  const [text, setText] = React.useState("");

  return (
    <TextInput
      {...props}
      onChangeText={(text) => setText(text)}
      style={styles.windowNameInput}
      underlineColor={colors.white.medium_high_emph}
      theme={{
        colors: {
          text: colors.white.high_emph,
          primary: colors.secondary._600,
          placeholder: colors.white.medium_high_emph,
        },
      }}
    />
  );
};

const styles = StyleSheet.create({
  windowNameInput: {
    backgroundColor: colors.primary._900,
    marginHorizontal: "3%",
  },
});
