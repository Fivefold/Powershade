import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { CustomTextInput } from "../components/CustomTextInput";

export function qrScanScreen() {
  return (
    <View style={styles.container}>
      <Text>QR Scan</Text>
    </View>
  );
}

var marginHorizontal = "1%";
var marginVertical = "0.5%";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    //alignItems: "center",
    //justifyContent: "center",
    padding: "1%",
  },
});
