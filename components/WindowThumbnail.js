import React from "react";
import { View, StyleSheet } from "react-native";
import { IconButton } from "react-native-paper";
import colors from "../constants/colors";

const IncompleteIcon = (props) => {
  if (props.fieldsIncomplete && props.measureIncomplete)
    return (
      <View
        style={
          props.width > props.height
            ? IncompleteIconContainerHori
            : styles.IncompleteIconContainer
        }
      >
        <IconButton
          icon="qrcode"
          color={colors.primary._800}
          size={20}
          style={styles.IncompleteIcon}
        />
        <IconButton
          icon="crosshairs-question"
          color="red"
          size={20}
          style={styles.IncompleteIcon}
        />
      </View>
    );
  else if (props.fieldsIncomplete)
    return (
      <View style={styles.IncompleteIconContainer}>
        <IconButton
          icon="qrcode"
          color="orange"
          style={styles.IncompleteIcon}
        />
      </View>
    );
  else if (props.measureIncomplete)
    return (
      <View style={styles.IncompleteIconContainer}>
        <IconButton
          icon="crosshairs-question"
          color="red"
          style={styles.IncompleteIcon}
        />
      </View>
    );
  else return null;
};

export const WindowThumbnail = (props) => {
  if (props.noDimensions === true) {
    return (
      <View style={styles.container}>
        <IncompleteIcon {...props} />
      </View>
    );
  } else {
    // Fit the window into the parent view (container) regardless of size
    const scale = Math.min(
      styles.container.width / Number(props.width),
      styles.container.height / Number(props.height)
    );
    const scaledWidth = Number(props.width) * scale;
    const scaledHeight = Number(props.height) * scale;

    return (
      <View style={styles.container}>
        <IncompleteIcon {...props} />
        <View
          style={
            props.noDimensions === true
              ? null
              : [styles.window, { width: scaledWidth, height: scaledHeight }]
          }
        ></View>
      </View>
    );
  }
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
  IncompleteIconContainer: {
    height: "100%",
    width: "100%",
    position: "absolute",
    flex: 1,
    justifyContent: "space-evenly",
  },
  flexRow: {
    flexDirection: "row",
  },
  IncompleteIcon: {
    borderRadius: 0,
    width: 23,
    height: 23,
    alignSelf: "center",
    margin: 0,
  },
});

const IncompleteIconContainerHori = StyleSheet.compose(
  styles.IncompleteIconContainer,
  styles.flexRow
);
