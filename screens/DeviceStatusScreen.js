import React from "react";
import { View, StyleSheet, Text } from "react-native";

export function DeviceStatusScreen() {
  return (
    <View style={styles.container}>
      <Text>Gerätestatus</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    //flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    padding: "1%",
  },
});
