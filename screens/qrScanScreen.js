import { BarCodeScanner } from "expo-barcode-scanner";
import React from "react";
import { Button, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

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
    return <Text>Fordere Zugriff auf Kamera an...</Text>;
  }
  if (hasPermission === false) {
    return <Text>Kein Zugriff auf Kamera erlaubt</Text>;
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
