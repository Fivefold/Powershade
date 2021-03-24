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
import * as SQLite from "expo-sqlite";

import colors from "../constants/colors";

import { SensorPositionToggle } from "../components/SensorPositionToggle";
import { WindowPreview } from "../components/WindowPreview";

const db = SQLite.openDatabase("test.db");

export function NewWindowScreen({ route, navigation }) {
  // The active project
  const [project, setProject] = React.useState(null);
  // The data of the newly created window.
  const [window, setWindow] = React.useState({
    windowName: "",
    annotations: "",
    windowWidth: "50",
    windowHeight: "50",
    sensorCorner: "upperLeft",
    sensorPosH: "10",
    sensorPosV: "10",
  });

  /* Temporary state to store input field texts during entry.
   * The real state (window) is updated onBlur.
   */
  const [temp, setTemp] = React.useState({
    windowWidth: "",
    windowHeight: "",
    sensorPosH: "10",
    sensorPosV: "10",
  });

  const [texts, setTexts] = React.useState({
    windowName: "",
    Annotations: "",
  });

  const setValue = (key, value) => {
    setWindow((oldState) => ({
      ...oldState,
      [key]: value,
    }));
  };

  const setTempValue = (key, value) => {
    setTemp((oldState) => ({
      ...oldState,
      [key]: value,
    }));
  };

  // Get the active project
  React.useEffect(() => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT 
            id, customer, street, number, zip, city 
            FROM projects
            WHERE EXISTS (
              SELECT 1 FROM settings WHERE 
              projects.id = settings.value 
              AND 
              settings.key = 'active_project');`,
          [],
          (_, { rows: { _array } }) => {
            setProject(_array[0]);
            //console.log("New Window: get active project: " + JSON.stringify(_array[0]));
          },
          (t, error) => {
            console.log(error);
          }
        );
      },
      (t) => console.log("query active project in new window: " + t)
    );
  }, []);

  const add = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO windows (
          project, 
          name, 
          width, 
          height, 
          lat, 
          long, 
          z_height, 
          azimuth, 
          angle, 
          qr, 
          annotations) VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          project.id,
          window.windowName,
          window.windowWidth,
          window.windowHeight,
          0,
          0,
          2.2,
          130,
          90,
          route.params.qr.data,
          window.annotations,
        ],
        null,
        (t, error) => {
          console.log(error);
        }
      );
    });
  };

  if (project === null || project.length === 0) {
    return <View></View>;
  }

  return (
    <View>
      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        <View style={styles.headerContainer}>
          <List.Item
            title={project.customer}
            description={`${project.street} ${project.number}, ${project.zip} ${project.city}`}
            left={() => (
              <List.Icon icon="home-account" color={colors.white.high_emph} />
            )}
            theme={{ colors: { text: colors.white.high_emph } }}
          />
          <TextInput
            label="Raum-/Fenstername"
            value={window.windowName}
            onChangeText={(text) => setValue("windowName", text)}
            style={styles.windowNameInput}
            underlineColor={colors.white.medium_high_emph}
            theme={{
              colors: {
                text: colors.white.high_emph,
                primary: colors.secondary._600,
                placeholder: colors.white.medium_high_emph,
              },
            }}
          />
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
          <TextInput
            label="Breite"
            mode="outlined"
            keyboardType="number-pad"
            value={temp.windowWidth}
            onChangeText={(text) => setTempValue("windowWidth", text)}
            onBlur={() => setValue("windowWidth", temp.windowWidth)}
            style={styles.halfTextInput}
            right={<TextInput.Affix text="cm" />}
          />
          <TextInput
            label="Höhe"
            mode="outlined"
            keyboardType="number-pad"
            value={temp.windowHeight}
            onChangeText={(text) => setTempValue("windowHeight", text)}
            onBlur={() => setValue("windowHeight", temp.windowHeight)}
            style={styles.halfTextInput}
            right={<TextInput.Affix text="cm" />}
          />
          <WindowPreview
            width={window.windowWidth}
            height={window.windowHeight}
            sensorPosH={window.sensorPosH}
            sensorPosV={window.sensorPosV}
            sensorCorner={window.sensorCorner}
          />
          <View style={styles.sensorContainer}>
            <Caption style={styles.dimCaption}>SENSORPOSITION</Caption>
            <SensorPositionToggle
              value={window.sensorCorner}
              setSensorCorner={setValue}
            />
            <TextInput
              label="horizontal"
              mode="outlined"
              keyboardType="number-pad"
              value={temp.sensorPosH}
              onChangeText={(text) => setTempValue("sensorPosH", text)}
              onBlur={() => setValue("sensorPosH", temp.sensorPosH)}
              style={styles.fullTextInput}
              right={<TextInput.Affix text="cm" />}
            />
            <TextInput
              label="vertikal"
              mode="outlined"
              keyboardType="number-pad"
              value={temp.sensorPosV}
              onChangeText={(text) => setTempValue("sensorPosV", text)}
              onBlur={() => setValue("sensorPosV", temp.sensorPosV)}
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
            <TextInput
              label="QR-Kennung"
              value={route.params.qr.data}
              mode="outlined"
              disabled="true"
              style={styles.qrInput}
            />
          </View>
          <TextInput
            label="Anmerkungen"
            mode="outlined"
            multiline={true}
            value={window.annotations}
            onChangeText={(text) => setValue("annotations", text)}
            style={styles.fullTextInput}
          />
        </View>
      </ScrollView>
      <View style={styles.fabView}>
        <FAB
          style={styles.fab}
          icon="content-save"
          label="Speichern"
          onPress={() => {
            console.log("Pressed save window");
            add();
            navigation.navigate("windowList");
          }}
        />
      </View>
    </View>
  );
}

var marginHorizontal = "2%";
var marginVertical = "0.5%";

const styles = StyleSheet.create({
  // --- Input field stylings ---
  windowNameInput: {
    backgroundColor: colors.primary._900,
    marginHorizontal: "3%",
  },
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
