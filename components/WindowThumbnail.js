import React from "react";
import { View, StyleSheet } from "react-native";
import colors from "../constants/colors";

export const WindowThumbnail = (props) => {
  // Fit the window into the parent view (container) regardless of size
  const scale = Math.min(
    styles.container.width / Number(props.width),
    styles.container.height / Number(props.height)
  );
  const scaledWidth = Number(props.width) * scale;
  const scaledHeight = Number(props.height) * scale;

  return (
    <View style={styles.container}>
      <View
        style={[styles.window, { width: scaledWidth, height: scaledHeight }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 53,
    height: 53,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  window: {
    borderWidth: 2,
  },
});
