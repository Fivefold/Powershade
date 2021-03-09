import React, { useCallback } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Text,
  IconButton,
  List,
  TextInput,
  ActivityIndicator,
  Subheading,
  Caption,
  FAB,
  Button,
} from "react-native-paper";
import { CommonActions } from "@react-navigation/native";

import colors from "../constants/colors";
import { WindowNameInput } from "../components/WindowNameInput";
import { CustomTextInput } from "../components/CustomTextInput";
import { SensorPositionToggle } from "../components/SensorPositionToggle";
import { WindowPreview } from "../components/WindowPreview";
import { WindowDimInput } from "../components/WindowDimInput";
import { SensorPosInput } from "../components/SensorPosInput";
import { DisabledTextInput } from "../components/DisabledTextInput";

export function NewWindowScreen({ route, navigation }) {
  const [windowWidth, setWindowWidth] = React.useState("50");
  const [windowHeight, setWindowHeight] = React.useState("50");
  const [sensorCorner, setSensorCorner] = React.useState("upperLeft");
  const [sensorPosH, setSensorPosH] = React.useState("10");
  const [sensorPosV, setSensorPosV] = React.useState("10");

  return (
    <View>
      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        <View style={styles.headerContainer}>
          <List.Item
            title="Max Mustermann"
            description="Musterstraße 12, 1234 Musterstadt"
            left={() => (
              <List.Icon icon="home-account" color={colors.white.high_emph} />
            )}
            theme={{ colors: { text: colors.white.high_emph } }}
          />
          <WindowNameInput label="Raum-/Fenstername" />
          <View style={styles.measurementContainer}>
            <Caption style={{ color: colors.white.high_emph }}>
              MESSUNGSSTATUS
            </Caption>
            <View style={styles.measurementResults}>
              <ActivityIndicator
                animating={true}
                color={colors.secondary._600}
              />
              <Subheading style={[styles.measurementText]}>
                Warte auf Messergebnis...
              </Subheading>
            </View>
          </View>
        </View>
        <View style={styles.dimContainer}>
          <Caption style={styles.dimCaption}>FENSTERABMESSUNGEN</Caption>
          <WindowDimInput
            label="Breite"
            mode="outlined"
            keyboardType="number-pad"
            setWindowDim={setWindowWidth}
            style={styles.halfTextInput}
            right={<TextInput.Affix text="cm" />}
          />
          <WindowDimInput
            label="Höhe"
            mode="outlined"
            keyboardType="number-pad"
            setWindowDim={setWindowHeight}
            style={styles.halfTextInput}
            right={<TextInput.Affix text="cm" />}
          />
          <WindowPreview
            width={windowWidth}
            height={windowHeight}
            sensorPosH={sensorPosH}
            sensorPosV={sensorPosV}
            sensorCorner={sensorCorner}
          />
          <View style={styles.sensorContainer}>
            <Caption style={styles.dimCaption}>SENSORPOSITION</Caption>
            <SensorPositionToggle
              value={sensorCorner}
              setSensorCorner={setSensorCorner}
            />
            <SensorPosInput
              label="horizontal"
              mode="outlined"
              keyboardType="number-pad"
              initialValue={sensorPosH}
              setSensorPos={setSensorPosH}
              style={styles.fullTextInput}
              right={<TextInput.Affix text="cm" />}
            />
            <SensorPosInput
              label="vertikal"
              mode="outlined"
              keyboardType="number-pad"
              initialValue={sensorPosV}
              setSensorPos={setSensorPosV}
              style={styles.fullTextInput}
              right={<TextInput.Affix text="cm" />}
            />
          </View>
          <View style={styles.qrRow}>
            <IconButton
              icon="qrcode-scan"
              size={38.5}
              color={colors.white.high_emph}
              style={styles.qrButton}
              onPress={() => navigation.navigate("qrScan")}
            />
            <DisabledTextInput
              label="QR-Kennung"
              value={route.params.qr.data}
              mode="outlined"
              style={styles.qrInput}
            />
          </View>
          <CustomTextInput
            label="Anmerkungen"
            mode="outlined"
            multiline={true}
            style={styles.fullTextInput}
          />
        </View>
      </ScrollView>
      <View style={styles.fabView}>
        <FAB
          style={styles.fab}
          icon="content-save"
          label="Speichern"
          onPress={() => console.log("Pressed save item")}
        />
      </View>
    </View>
  );
}

var marginHorizontal = "2%";
var marginVertical = "0.5%";

const styles = StyleSheet.create({
  // --- Header ---
  headerContainer: {
    backgroundColor: colors.primary._800,
    elevation: 4,
  },
  measurementContainer: {
    height: 60,
    paddingHorizontal: "3%",
    marginTop: 10,
  },
  measurementResults: {
    flexDirection: "row",
  },
  measurementText: {
    paddingHorizontal: 15,
    color: colors.white.high_emph,
  },
  // --- Input Area ---
  dimContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    //alignItems: "center",
    justifyContent: "space-between",
    padding: "4%",
  },
  dimCaption: {
    width: "100%",
    color: colors.primary._800,
    marginBottom: "-0.5%",
  },
  fullTextInput: {
    width: "100%",
    marginVertical: marginVertical,
  },

  halfTextInput: {
    width: "48%",
    marginVertical: marginVertical,
  },
  smallTextInput: {
    width: "30%",
    marginHorizontal: marginHorizontal,
    marginVertical: marginVertical,
  },
  wideTextInput: {
    width: "66%",
    marginHorizontal: marginHorizontal,
    marginVertical: marginVertical,
  },
  qrRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  qrInput: {
    flexGrow: 1,
    marginLeft: -12,
  },
  qrButton: {
    backgroundColor: colors.primary._800,
    borderRadius: 5,
    elevation: 4,
    marginLeft: 0,
  },
  // --- Sensor ---
  sensorContainer: {
    width: 168,
    //flex: 1,
    //flexGrow: 1,
    marginTop: 10,
    marginLeft: "5%",
    //backgroundColor: "grey",
  },
  fabView: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    bottom: 0,
    right: 0,
    margin: 16,
  },
});
