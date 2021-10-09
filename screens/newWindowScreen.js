// TODO: this screen/view grew too large over time and needs refactoring into
// TODO: smaller components to improve readability

import * as SQLite from "expo-sqlite";
import React from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Caption,
  FAB,
  HelperText,
  IconButton,
  List,
  Subheading,
  Text,
  TextInput,
} from "react-native-paper";

import { SensorPositionToggle } from "../components/SensorPositionToggle";
import { WindowPreview } from "../components/WindowPreview";
import colors from "../constants/colors";
import {
  abortMeasurement,
  disconnect,
  monitorMeasurementStatus,
  startMeasurement,
  stopMonitoring,
} from "../modules/BleManager";
import { StateContext } from "../modules/Context";

const db = SQLite.openDatabase("powershade.db");

/** Input screen for creating a new window. Inputs for various metadata (name,
 * dimensions, comments) as well as a button with a redirect to a QR scanner and
 * a button to initiate the measurements.
 */
export function NewWindowScreen({ route, navigation }) {
  const {
    bluetoothConnected,
    setBluetoothConnected,
    measurementStatus,
    setMeasurementStatus,
  } = React.useContext(StateContext);

  // either new window values or filled with initial data during window editing.
  // Compared when leaving the screen to check if inputs have been changed
  const [windowInitialState, setWindowInitialState] = React.useState({
    name: "",
    width: "",
    height: "",
    sensorCorner: "lowerRight",
    sensorPosH: "15",
    sensorPosV: "10",
    latitude: null,
    longitude: null,
    altitude: null,
    azimuth: null,
    inclination: null,
    annotations: "",
  });

  // The active project
  const [project, setProject] = React.useState({
    id: "",
    customer: "",
    street: "",
    number: "",
    zip: "",
    city: "",
  });
  // The data of the window.
  const [window, setWindow] = React.useState(windowInitialState);

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

  let inputError =
    Object.values(inputErrors).includes(true) || window.name === "";

  let noUnsavedChanges = Boolean(
    JSON.stringify(window) === JSON.stringify(windowInitialState) &&
      measurementStatus !== "running"
  );

  // Checks if a number is a valid florating point number, either using
  // a point . or a comma ,
  const fpNumberDot = RegExp("^([0-9]+([.][0-9]*)?|[.][0-9]+)$");
  const fpNumberComma = RegExp("^([0-9]+([,][0-9]*)?|[,][0-9]+)$");

  // Warn if the user wants to go back without saving changes
  React.useEffect(
    () =>
      navigation.addListener("beforeRemove", (e) => {
        if (noUnsavedChanges) {
          // If we don't have unsaved changes, then we don't need to do anything
          return;
        }

        e.preventDefault();

        // Prompt the user before leaving the screen
        Alert.alert(
          "Änderungen verwerfen?",
          "Sollen die Änderungen wirklich verworfen werden?",
          [
            { text: "hier bleiben", style: "cancel", onPress: () => {} },
            {
              text: "Verwerfen",
              style: "destructive",
              // If the user confirmed, then we dispatch the action we blocked earlier
              // This will continue the action that had triggered the removal of the screen
              onPress: () => navigation.dispatch(e.data.action),
            },
          ]
        );
      }),
    [navigation, noUnsavedChanges]
  );

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

  /** Update or add all measurementvalues in the 'window' state object.
   * @param {string} latitude - latitude,
   * @param {string} longitude - longitude,
   * @param {string} altitude - altitude,
   * @param {string} azimuth - azimuth,
   * @param {string} inclination - inclination
   */
  const setMeasurementValues = (
    latitude,
    longitude,
    altitude,
    azimuth,
    inclination
  ) => {
    setWindow((oldState) => ({
      ...oldState,
      ["latitude"]: latitude,
      ["longitude"]: longitude,
      ["altitude"]: altitude,
      ["azimuth"]: azimuth,
      ["inclination"]: inclination,
    }));
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
              setWindowInitialState(_array[0]);
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
          window.latitude,
          window.longitude,
          window.altitude,
          window.azimuth,
          window.inclination,
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
          window.latitude,
          window.longitude,
          window.altitude,
          window.azimuth,
          window.inclination,
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

  React.useEffect(() => {
    if (measurementStatus === "running") {
    } else if (measurementStatus === "done") {
      stopMonitoring();
      setMeasurementStatus("idle");
    }
  }, [measurementStatus]);

  // delete Bluetooth measurements
  const delMeasurement = () => {
    // Prompt the user before deleting the measurements
    Alert.alert(
      "Messung löschen?",
      "Soll die Messung wirklich gelöscht werden?",
      [
        { text: "abbrechen", style: "cancel", onPress: () => {} },
        {
          text: "löschen",
          style: "destructive",

          onPress: () => {
            setMeasurementValues(null, null, null, null, null);
          },
        },
      ]
    );
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
  if (window.inclination !== undefined && window.inclination !== null) {
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
              onPress={() => delMeasurement()}
            />
          </View>
        </View>
      </View>
    );
  } else if (measurementStatus === "running" || measurementStatus === "done") {
    measurementContainer = (
      <View>
        <Caption style={{ color: colors.white.high_emph }}>
          MESSUNGSSTATUS
        </Caption>
        <View style={styles.measurementRunning}>
          <ActivityIndicator animating={true} color={colors.secondary._600} />
          <Subheading style={[styles.measurementText]}>
            Warte auf Messergebnis...{" "}
          </Subheading>
          <Button
            mode="contained"
            color={colors.red.danger}
            onPress={() => {
              abortMeasurement();
              setMeasurementStatus("idle");
            }}
          >
            Abbrechen
          </Button>
        </View>
      </View>
    );
  } else if (bluetoothConnected === false) {
    measurementContainer = (
      <Button
        icon="bluetooth"
        mode="contained"
        color={colors.secondary._600}
        onPress={() => navigation.navigate("Gerätestatus")}
      >
        Mit Messgerät verbinden
      </Button>
    );
  } else {
    measurementContainer = (
      <Button
        icon="bluetooth"
        mode="contained"
        color={colors.secondary._600}
        onPress={async () => {
          // change the status here instead of via the notifying bluetooth device
          // to change the view immediately
          setMeasurementStatus("running");

          await startMeasurement();

          // get notified once the measurement is complete
          await monitorMeasurementStatus(
            setMeasurementStatus,
            setMeasurementValues
          );
        }}
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
      <View style={styles.fabView}>
        <FAB
          style={styles.fab}
          disabled={inputError}
          icon="content-save"
          label="Speichern"
          onPress={() => {
            navigation.removeListener("beforeRemove"); // no confirmation dialog
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
    justifyContent: "space-between",
  },
  measurementResults: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  measurementText: {
    paddingHorizontal: 15,
    color: colors.white.high_emph,
    textAlignVertical: "center",
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
