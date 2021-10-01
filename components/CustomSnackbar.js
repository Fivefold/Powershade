import React from "react";
import { StyleSheet, View } from "react-native";
import { Snackbar } from "react-native-paper";

export const CustomSnackbar = (props) => {
  const onDismissSnackBar = () => props.setVisible(false);

  return (
    <View style={styles.container}>
      <Snackbar visible={props.visible} onDismiss={onDismissSnackBar}>
        {props.text}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
});
