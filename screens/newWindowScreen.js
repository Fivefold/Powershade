import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  IconButton,
  List,
  TextInput,
  Button,
  ActivityIndicator,
  Subheading,
  Caption,
  FAB,
  HelperText,
  Dialog,
  Portal,
  Paragraph,
  Text,
} from "react-native-paper";
import * as SQLite from "expo-sqlite";

import colors from "../constants/colors";

import { SensorPositionToggle } from "../components/SensorPositionToggle";
import { WindowPreview } from "../components/WindowPreview";
import { color } from "react-native-reanimated";

const db = SQLite.openDatabase("powershade.db");

const DeleteDialog = (props) => {
  return (
    <View>
      <Portal>
        <Dialog visible={props.visible} onDismiss={props.hideDialog}>
          <Dialog.Title>Löschen</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Wirklich Messung löschen?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button style={{ minWidth: "20%" }} onPress={props.hideDialog}>
              Nein
            </Button>
            <Button style={{ minWidth: "20%" }} onPress={props.delMeasurement}>
              Ja
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

/** Input screen for creating a new window. Inputs for various metadata (name,
 * dimensions, comments) as well as a button with a redirect to a QR scanner and
 * a button to initiate the measurements.
 */
export function NewWindowScreen({ route, navigation }) {
  /* TEMPORARY UNTIL CONTEXT IMPLEMENTATION OF GLOBAL STATE */
  const [bluetoothPaired, setBluetoothPaired] = React.useState(false);
  const [measurementStatus, setMeasurementStatus] = React.useState("init");
  // ^ possible values: "init", "running", "done"
  /* TEMPORARY END */
  // The active project
  const [project, setProject] = React.useState({
    id: "",
    customer: "",
    street: "",
    number: "",
    zip: "",
    city: "",
  });
  // The data of the newly created window.
  const [window, setWindow] = React.useState({
    name: "",
    width: "",
    height: "",
    sensorCorner: "lowerRight",
    sensorPosH: "15",
    sensorPosV: "10",
    qr: "",
    annotations: "",
  });

  /* Temporary state to store input field texts during entry.
   * The real state (window) is updated onBlur.
   */
  const [temp, setTemp] = React.useState({
    width: "",
    height: "",
    sensorPosH: "10",
    sensorPosV: "10",
  });

  // Error flags for each input field. Used for input validation.
  const [inputErrors, setInputErrors] = React.useState({
    name: false,
    width: false,
    height: false,
    sensorPosH: false,
    sensorPosV: false,
  });

  // State of measurement delete dialog
  const [dialogVisible, setDialogVisible] = React.useState(false);

  const showDialog = () => setDialogVisible(true);
  const hideDialog = () => setDialogVisible(false);

  let inputError =
    Object.values(inputErrors).includes(true) || window.name === "";

  const fpNumberDot = RegExp("^([0-9]+([.][0-9]*)?|[.][0-9]+)$");
  const fpNumberComma = RegExp("^([0-9]+([,][0-9]*)?|[,][0-9]+)$");

  /** Update or add a single value in the 'window' state object. No nesting.
   * @param {string} key - The key in the key-value pair
   * @param {*} value - The value in the key-value pair
   */
  const setValue = (key, value) => {
    switch (key) {
      case "width":
      case "height":
      case "sensorPosH":
      case "sensorPosV":
        setWindow((oldState) => ({
          ...oldState,
          [key]: String(value).replace(",", "."), // Only store fp num in db
        }));
        break;
      default:
        setWindow((oldState) => ({
          ...oldState,
          [key]: value,
        }));
    }
  };

  /** Update or add a single value in the 'temp' state object. No nesting.
   * @param {string} key - The key in the key-value pair
   * @param {*} value - The value in the key-value pair
   */
  const setTempValue = (key, value) => {
    setTemp((oldState) => ({
      ...oldState,
      [key]: value,
    }));
  };

  /** Update or add a single value in the 'error' state object. No nesting.
   * @param {string} key - The key in the key-value pair
   * @param {*} value - The value in the key-value pair
   */
  const setError = (key, value) => {
    setInputErrors((oldState) => ({
      ...oldState,
      [key]: value,
    }));
  };

  React.useEffect(() => {
    setValue("qr", route.params.qr.data);
  }, [route.params.qr.data]);

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

        // Editing mode:
        if (route.params.windowId) {
          // get the window to edit for filling the forms
          tx.executeSql(
            `SELECT
              id,
              strftime("%d.%m.%Y %H:%M:%S", last_edit, 'localtime') AS last_edit,
              strftime("%d.%m.%Y %H:%M:%S", created, 'localtime') AS created,
              project, 
              name, 
              width, 
              height,
              sensorCorner,
              sensorPosH,
              sensorPosV, 
              latitude, 
              longitude, 
              altitude, 
              azimuth, 
              inclination, 
              qr, 
              annotations
            FROM windows WHERE id = ?;`,
            [route.params.windowId],
            (_, { rows: { _array } }) => {
              setWindow(_array[0]);
              // set bluetooth measuring status
              _array[0].altitude === null ? null : setMeasurementStatus("done");
              setTemp({
                width: String(_array[0].width),
                height: String(_array[0].height),
                sensorPosH: String(_array[0].sensorPosH),
                sensorPosV: String(_array[0].sensorPosV),
              });
            },
            (t, error) => {
              console.log(error);
            }
          );
        }
      },
      (t) => console.log("query active project in new window: " + t)
    );
  }, []);

  // Add a new window
  const add = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO windows (
          last_edit,
          created,
          project, 
          name, 
          width, 
          height,
          sensorCorner,
          sensorPosH,
          sensorPosV, 
          latitude, 
          longitude, 
          altitude, 
          azimuth, 
          inclination, 
          qr, 
          annotations) VALUES
        (datetime("now"), datetime("now"), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          project.id,
          window.name,
          window.width,
          window.height,
          window.sensorCorner,
          window.sensorPosH,
          window.sensorPosV,
          measurementStatus === "done" ? window.latitude : null,
          measurementStatus === "done" ? window.longitude : null,
          measurementStatus === "done" ? window.altitude : null,
          measurementStatus === "done" ? window.azimuth : null,
          measurementStatus === "done" ? window.inclination : null,
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

  // Update an existing window
  const update = () => {
    //console.log("before update:  " + JSON.stringify(window));
    db.transaction((tx) => {
      tx.executeSql(
        `UPDATE windows
          SET last_edit = datetime("now"),
              name = ?, 
              width = ?, 
              height = ?,
              sensorCorner = ?,
              sensorPosH = ?,
              sensorPosV = ?, 
              latitude = ?, 
              longitude = ?, 
              altitude = ?, 
              azimuth = ?, 
              inclination = ?, 
              qr = ?, 
              annotations = ?
          WHERE id = ?;`,
        [
          window.name,
          window.width,
          window.height,
          window.sensorCorner,
          window.sensorPosH,
          window.sensorPosV,
          measurementStatus === "done" ? window.latitude : null,
          measurementStatus === "done" ? window.longitude : null,
          measurementStatus === "done" ? window.altitude : null,
          measurementStatus === "done" ? window.azimuth : null,
          measurementStatus === "done" ? window.inclination : null,
          window.qr,
          window.annotations,
          route.params.windowId,
        ],
        null,
        (t, error) => {
          console.log(error);
        }
      );
    });
  };

  // delete Bluetooth measurements
  const delMeasurement = () => {
    if (route.params.windowId) {
      //Editing mode:
      db.transaction((tx) => {
        tx.executeSql(
          `UPDATE windows
          SET last_edit = datetime("now"),
          latitude = ?, 
          longitude = ?, 
          altitude = ?, 
          azimuth = ?, 
          inclination = ? 
          WHERE id = ?;`,
          [null, null, null, null, null, route.params.windowId],
          null,
          (t, error) => {
            console.log(error);
          }
        );
      });
    }
    setMeasurementStatus("init");
    setDialogVisible(false);
  };

  /** Adds the abbreviated cardinal direction to the azimuth string.
   * @param {string} azi - The azimuth string in degrees, e.g. "167"
   * @returns {string} the formatted azimuth string
   * e.g. "167" becomes "167° (SSO)"
   */
  const formatAzi = (azi) => {
    let cardinalIndex = Number.parseFloat(azi) / 22.5;
    cardinalIndex = Math.round(cardinalIndex);
    let cardinalName, cardinalFormatted;
    let formattedAzi = Number.parseInt(Math.round(Number.parseFloat(azi)));

    let cardinalNameList = [
      "N",
      "NNO",
      "NO",
      "ONO",
      "O",
      "OSO",
      "SO",
      "SSO",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "NW",
      "NNW",
    ];

    cardinalName = cardinalNameList[cardinalIndex];

    cardinalFormatted = `${formattedAzi}° (${cardinalName})`; // e.g. "167 (SSO)"
    return cardinalFormatted;
  };

  // data has not been fetched yet, show a loading screen
  if (project.id === "") {
    return (
      <View style={styles.emptyPage}>
        <ActivityIndicator
          animating={true}
          size="large"
          color={colors.primary._800}
        />
      </View>
    );
  }

  // measurementContainer for the bluetooth measurements
  let measurementContainer;
  if (measurementStatus === "done") {
    measurementContainer = (
      <View style={styles.measurementResults}>
        <View>
          <Caption style={{ color: colors.white.high_emph }}>
            MESSUNGSSTATUS
          </Caption>
          <View style={styles.measurementRunning}>
            <IconButton
              icon="checkbox-marked-circle-outline"
              color={colors.secondary._600}
              style={styles.checkmark}
            />
            <Subheading style={[styles.measurementText]}>empfangen</Subheading>
          </View>
        </View>
        <View>
          <Caption style={{ color: colors.white.high_emph }}>
            AUSRICHTUNG
          </Caption>
          <View style={styles.measurementResults}>
            <Subheading style={{ color: colors.white.high_emph }}>
              {formatAzi(window.azimuth)}
            </Subheading>
          </View>
        </View>
        <View>
          <Caption style={{ color: colors.white.high_emph }}>NEIGUNG</Caption>
          <View style={styles.measurementResults}>
            <Subheading style={{ color: colors.white.high_emph }}>
              {window.inclination}°
            </Subheading>
          </View>
        </View>
        <View>
          <View style={styles.measurementDelete}>
            <IconButton
              icon="delete"
              color={colors.white.high_emph}
              style={{ margin: 0, padding: 0 }}
              onPress={() => setDialogVisible(true)}
            />
          </View>
        </View>
      </View>
    );
  } else if (measurementStatus === "running") {
    measurementContainer = (
      <View>
        <Caption style={{ color: colors.white.high_emph }}>
          MESSUNGSSTATUS
        </Caption>
        <View style={styles.measurementRunning}>
          <ActivityIndicator animating={true} color={colors.secondary._600} />
          <Subheading
            style={[styles.measurementText]}
            onPress={() => {
              setValue("azimuth", Math.random() * 360);
              setValue("inclination", 90);
              setValue("altitude", 1.2);
              setMeasurementStatus("done");
            }}
          >
            Warte auf Messergebnis...
          </Subheading>
        </View>
      </View>
    );
  } else {
    measurementContainer = (
      <Button
        icon="bluetooth"
        mode="contained"
        color={colors.secondary._600}
        onPress={() => setMeasurementStatus("running")}
      >
        Messung starten
      </Button>
    );
  }

  return (
    <View>
      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        <View style={styles.headerContainer}>
          <List.Item
            title={project.customer}
            description={
              `${project.street} ${project.number}, ` +
              `${project.zip} ${project.city}`
            }
            left={() => (
              <List.Icon icon="home-account" color={colors.white.high_emph} />
            )}
            theme={{ colors: { text: colors.white.high_emph } }}
          />
          <TextInput
            label="Raum-/Fenstername"
            value={window.name}
            error={inputErrors.name}
            onChangeText={(text) => {
              setValue("name", text);
              // if Text is entered, remove the empty field warning
              !(text === "") ? setError("name", false) : setError("name", true);
            }}
            onBlur={() =>
              window.name === ""
                ? setError("name", true)
                : setError("name", false)
            }
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
          <HelperText
            type="error"
            visible={inputErrors.name}
            style={inputErrors.name ? { color: "#F44" } : { display: "none" }}
          >
            Raum-/Fenstername darf nicht leer sein
          </HelperText>
          <View style={styles.measurementContainer}>
            {measurementContainer}
          </View>
        </View>
        <View style={styles.dimContainer}>
          <Caption style={styles.dimCaption}>FENSTERABMESSUNGEN</Caption>
          <TextInput
            label="Breite"
            mode="outlined"
            keyboardType="number-pad"
            value={temp.width}
            error={inputErrors.width}
            onChangeText={(text) => {
              setTempValue("width", text);
              fpNumberDot.test(text) || fpNumberComma.test(text) || text === ""
                ? setError("width", false)
                : setError("width", true);
            }}
            onBlur={() => {
              inputErrors.width ? null : setValue("width", temp.width);
            }}
            style={styles.halfTextInput}
            right={<TextInput.Affix text="cm" />}
          />
          <TextInput
            label="Höhe"
            mode="outlined"
            keyboardType="number-pad"
            value={temp.height}
            error={inputErrors.height}
            onChangeText={(text) => {
              setTempValue("height", text);
              fpNumberDot.test(text) || fpNumberComma.test(text) || text === ""
                ? setError("height", false)
                : setError("height", true);
            }}
            onBlur={() =>
              inputErrors.height ? null : setValue("height", temp.height)
            }
            style={styles.halfTextInput}
            right={<TextInput.Affix text="cm" />}
          />
          <HelperText
            type="error"
            visible={inputErrors.width || inputErrors.height}
            style={
              inputErrors.width || inputErrors.height
                ? null
                : { display: "none" }
            }
          >
            Breite und Höhe müssen in (Komma-)Zahlen eingegeben oder leer
            gelassen werden.
          </HelperText>
          <View style={styles.windowPreviewRow}>
            <WindowPreview
              width={window.width}
              height={window.height}
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
                error={inputErrors.sensorPosH}
                onChangeText={(text) => {
                  setTempValue("sensorPosH", text);
                  fpNumberDot.test(text) || fpNumberComma.test(text)
                    ? setError("sensorPosH", false)
                    : setError("sensorPosH", true);
                }}
                onBlur={() =>
                  inputErrors.sensorPosH
                    ? null
                    : setValue("sensorPosH", temp.sensorPosH)
                }
                style={styles.fullTextInput}
                right={<TextInput.Affix text="cm" />}
              />
              <TextInput
                label="vertikal"
                mode="outlined"
                keyboardType="number-pad"
                value={temp.sensorPosV}
                error={inputErrors.sensorPosV}
                onChangeText={(text) => {
                  setTempValue("sensorPosV", text);
                  fpNumberDot.test(text) || fpNumberComma.test(text)
                    ? setError("sensorPosV", false)
                    : setError("sensorPosV", true);
                }}
                onBlur={() =>
                  inputErrors.sensorPosV
                    ? null
                    : setValue("sensorPosV", temp.sensorPosV)
                }
                style={styles.fullTextInput}
                right={<TextInput.Affix text="cm" />}
              />
              <HelperText
                type="error"
                visible={inputErrors.sensorPosH || inputErrors.sensorPosV}
                style={
                  inputErrors.sensorPosH || inputErrors.sensorPosV
                    ? null
                    : { display: "none" }
                }
              >
                Abstände müssen in (Komma-)Zahlen eingeben werden und dürfen
                nicht leer sein.
              </HelperText>
            </View>
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
              value={window.qr}
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
          {window.last_edit === undefined ? null : (
            <View style={styles.timestampContainer}>
              <View style={styles.timestamp}>
                <Text>Letzte Änderung:</Text>
                <Text>{window.last_edit}</Text>
              </View>

              <View style={styles.timestamp}>
                <Text>Erstellt:</Text>
                <Text>{window.created}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      <DeleteDialog
        visible={dialogVisible}
        showDialog={() => setDialogVisible(true)}
        hideDialog={() => setDialogVisible(false)}
        delMeasurement={() => delMeasurement()}
      />
      <View style={styles.fabView}>
        <FAB
          style={styles.fab}
          disabled={inputError}
          icon="content-save"
          label="Speichern"
          onPress={() => {
            //console.log("Pressed save window");
            route.params.windowId ? update() : add(); // editing or creating?
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
  emptyPage: {
    height: "100%",
    justifyContent: "center",
  },
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
    //height: 60,
    paddingHorizontal: "3%",
    marginTop: 10,
    paddingBottom: 10,
  },
  checkmark: {
    position: "relative",
    top: 3,
    height: 24,
    width: 24,
    margin: 0,
    padding: 0,
  },
  measurementRunning: {
    flexDirection: "row",
  },
  measurementResults: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  measurementText: {
    paddingHorizontal: 15,
    color: colors.white.high_emph,
  },
  measurementDelete: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: -18,
  },
  // --- Input Area ---
  dimContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    //alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
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
  windowPreviewRow: {
    width: "100%",
    flexDirection: "row",
    marginBottom: 7,
  },
  sensorContainer: {
    width: 168,
    marginTop: 10,
    marginLeft: 15,
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
  timestampContainer: {
    padding: 10,
    width: "100%",
    flexDirection: "row",
    color: colors.black.medium_high_emph,
  },
  timestamp: {
    flex: 1,
  },
  fab: {
    position: "absolute",
    bottom: 0,
    right: 0,
    margin: 16,
  },
});
