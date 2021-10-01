import React from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { Caption } from "react-native-paper";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import colors from "../constants/colors";

export const WindowPreview = (props) => {
  // workaround because the width of the window container is unknown
  // but the width of the rightside Sensor Box is fixed.
  const windowSize = useWindowDimensions();
  const windowsContainerWidth = windowSize.width - 168 - 30 - 15;
  /* ^ 168: width of sensorposition box, 30: padding of ScrollContainer
    ^ 15: marginLeft of ScrollContainer in NewWindowScreen.js
   */

  // At the beginning of a new window there are no dimensions yet.
  // Put in placeholders
  if (props.width === "" || props.height === "") {
    var width = 100;
    var height = 100;
  } else {
    var width = props.width;
    var height = props.height;
  }

  // Fit the window into the parent view (container) regardless of size
  var scale = Math.min(
    windowsContainerWidth / width,
    styles.windowContainer.height / height
  );
  var scaledWidth = width * scale;
  var scaledHeight = height * scale;
  var scaledSensorPosH = props.sensorPosH * scale;
  var scaledSensorPosV = props.sensorPosV * scale;

  // Position the sensor in the correct corner using absolute positioning
  var top, right, bottom, left;

  switch (props.sensorCorner) {
    case "upperLeft":
      top = 0;
      left = 0;
      right = null;
      bottom = null;
      break;
    case "upperRight":
      top = 0;
      left = null;
      right = 0;
      bottom = null;
      break;
    case "lowerLeft":
      top = null;
      left = 0;
      right = null;
      bottom = 0;
      break;
    case "lowerRight":
      top = null;
      left = null;
      right = 0;
      bottom = 0;
      break;
    case "null":
      top = 0;
      left = 0;
      right = null;
      bottom = null;
      break;
  }

  return (
    <View style={styles.windowContainer}>
      <View
        style={[styles.window, { width: scaledWidth, height: scaledHeight }]}
      >
        <Caption>Von außen</Caption>
        <Caption style={styles.heightCaption}>
          {props.width === "" || props.height === "" ? null : props.height}
        </Caption>
        <Caption>
          {props.width === "" || props.height === "" ? null : props.width}
        </Caption>

        <View
          style={[
            styles.sensorPosBorders,
            {
              // these are inline so they can be set dynamically
              // when the object is re-rendered
              width: Number(scaledSensorPosH),
              height: Number(scaledSensorPosV),
              top: top,
              right: right,
              bottom: bottom,
              left: left,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="circle"
            color={colors.primary._800}
            style={[
              styles.sensorIcon,
              {
                // CAUTION: The Position circle need to be in the opposite
                //corner, that's why the refs are switched around here
                top: bottom,
                right: left,
                bottom: top,
                left: right,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  windowContainer: {
    flexGrow: 1,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 195,
  },
  window: {
    flexDirection: "column",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "scroll",
  },
  heightCaption: {
    alignSelf: "flex-start",
    left: 6,
  },
  sensorPosBorders: {
    position: "absolute",
    margin: -2,
    borderWidth: 1,
    borderColor: colors.secondary._800,
  },
  sensorIcon: {
    position: "absolute",
    margin: -6,
  },
});
