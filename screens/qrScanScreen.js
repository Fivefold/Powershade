import React from "react";
import { View, StyleSheet, Button } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { Text } from "react-native-paper";
import { CommonActions } from "@react-navigation/native";

import { CustomTextInput } from "../components/CustomTextInput";

export function QrScanScreen({ route, navigation }) {
  const [hasPermission, setHasPermission] = React.useState(null);
  const [scanned, setScanned] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    //alert("Scan erfolgreich! \n\n Barcode-Typ: " + type + "\n Inhalt: " + data);
    navigation.navigate("newWindow", { qr: { data } });
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
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
    backgroundColor: "black",
  },
});
