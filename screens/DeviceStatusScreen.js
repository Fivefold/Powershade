import React, { useContext } from "react";
import { View, StyleSheet } from "react-native";
import { FAB, Text, Button } from "react-native-paper";
import { StateContext } from "../modules/Context";
import { bleManager, logName, scanAndConnect } from "../modules/BleManager";

const bleDeviceID = "B8:27:EB:96:29:D3";

export const uuids = {
  services: {
    magnetometer: "00000001-1e3c-fad4-74e2-97a033f1bfaa",
  },
};
export var bleDevice;

export function DeviceStatusScreen() {
  const [bluetoothPaired, setBluetoothPaired] = useContext(StateContext);
  const [pairing, setPairing] = React.useState(false);

  function pairBluetooth() {
    setPairing(true);
    scanAndConnect().then((res) => {
      setPairing(false);
      res ? setBluetoothPaired(true) : setBluetoothPaired(false);
    });
  }

  return (
    <View style={styles.container}>
      <Text>Gerätestatus {bluetoothPaired ? "true" : "false"}</Text>
      <Button style={{ minWidth: "20%" }} onPress={logName}>
        Read Characteristic
      </Button>

      <FAB
        style={styles.fab}
        loading={pairing}
        disabled={pairing || bluetoothPaired}
        icon="bluetooth"
        label="Verbinden"
        onPress={() => {
          pairBluetooth();
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
  fab: {
    position: "absolute",
    bottom: 0,
    right: 0,
    margin: 16,
  },
});
