import React from "react";
import { StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  FAB,
  Headline,
  IconButton,
  Subheading,
  Text,
} from "react-native-paper";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import colors from "../constants/colors";
import { disconnect, scanAndConnect } from "../modules/BleManager";
import { StateContext } from "../modules/Context";

export function DeviceStatusScreen() {
  const {
    bluetoothPaired,
    setBluetoothPaired,
    measurementStatus,
    setMeasurementStatus,
  } = React.useContext(StateContext);
  const [pairing, setPairing] = React.useState(false);

  function pairBluetooth() {
    setPairing(true);
    scanAndConnect().then((res) => {
      setPairing(false);
      res ? setBluetoothPaired(true) : setBluetoothPaired(false);
    });
  }

  function disconnectBluetooth() {
    disconnect();
    setBluetoothPaired(false);
  }

  return (
    <View style={styles.container}>
      <Headline style={styles.headline}>Handgerät</Headline>
      <Subheading style={styles.subheading}>Bluetooth</Subheading>
      <View style={styles.iconTextContainer}>
        <MaterialCommunityIcons
          name={bluetoothPaired ? "bluetooth" : "bluetooth-off"}
          color={bluetoothPaired ? colors.primary._800 : colors.black.inactive}
          style={styles.icon}
          size={24}
        />
        <Text>{bluetoothPaired ? "Verbunden" : "Getrennt"}</Text>
      </View>

      <Subheading style={styles.subheading}>Messstatus</Subheading>
      <View style={styles.iconTextContainer}>
        {measurementStatus === "running" ? (
          <View style={styles.iconTextContainer}>
            <ActivityIndicator animating={true} style={styles.icon} />
            <Text>Messung läuft</Text>
          </View>
        ) : (
          <Text>inaktiv</Text>
        )}
      </View>

      <Subheading style={styles.subheading}>Akku</Subheading>
      <View style={styles.iconTextContainer}>
        <MaterialCommunityIcons
          name={
            bluetoothPaired
              ? "battery-70-bluetooth"
              : "battery-unknown-bluetooth"
          }
          disabled={!bluetoothPaired}
          color={bluetoothPaired ? colors.primary._800 : colors.black.inactive}
          style={styles.icon}
          size={24}
        />
        <Text>{bluetoothPaired ? "70 %" : "N/A"}</Text>
      </View>

      <FAB
        style={styles.fab}
        loading={pairing}
        disabled={pairing}
        icon={bluetoothPaired ? "bluetooth-off" : "bluetooth-connect"}
        label={bluetoothPaired ? "Trennen" : "Verbinden"}
        onPress={() => {
          bluetoothPaired ? disconnectBluetooth() : pairBluetooth();
        }}
      />
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
  iconTextContainer: {
    flexDirection: "row",
    margin: 5,
  },
  icon: {
    marginTop: -2,
    marginRight: 8,
  },
  headline: {
    color: colors.primary._800,
  },
  subheading: {
    color: colors.primary._800,
    marginTop: 15,
  },
  fab: {
    position: "absolute",
    bottom: 0,
    right: 0,
    margin: 16,
  },
});
