import * as React from "react";
import { View, StyleSheet } from "react-native";
import { ToggleButton } from "react-native-paper";

import colors from "../constants/colors";

export const SensorPositionToggle = (props) => {
  function setValue(val) {
    // prevent deselecting the position
    val == null ? (val = props.value) : null;
    props.setSensorCorner(val);
  }
  return (
    <ToggleButton.Row
      onValueChange={(value) => setValue(value)}
      value={props.value}
    >
      <ToggleButton
        icon="angle-right"
        value="upperLeft"
        style={[styles.upperLeft, styles.toggleButton]}
      />
      <ToggleButton
        icon="angle-right"
        value="upperRight"
        style={styles.upperRight}
      />
      <ToggleButton
        icon="angle-right"
        value="lowerLeft"
        style={styles.lowerLeft}
      />
      <ToggleButton
        icon="angle-right"
        value="lowerRight"
        style={styles.lowerRight}
        theme={{ roundness: 0 }}
      />
    </ToggleButton.Row>
  );
};

const styles = StyleSheet.create({
  toggleButton: {},
  upperLeft: {
    transform: [{ scaleY: -1 }],
    borderWidth: 1,
  },
  upperRight: {
    transform: [{ scaleX: -1 }, { scaleY: -1 }],
    borderWidth: 1,
    borderRightWidth: 0,
  },
  lowerLeft: {
    borderWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 0,
  },
  lowerRight: {
    transform: [{ scaleX: -1 }],
    borderWidth: 1,
    borderLeftWidth: 1,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
});
