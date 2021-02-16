import React from "react";
import { View, Button, StyleSheet, SafeAreaView } from "react-native";
import {
  Appbar,
  List,
  IconButton,
  Text,
  Paragraph,
  RadioButton,
  Divider,
  FAB,
} from "react-native-paper";
import { createStackNavigator } from "@react-navigation/stack";
import { ScrollView } from "react-native-gesture-handler";
import { windowListScreen } from "./windowListScreen";
import { newObjectScreen } from "./newObjectScreen";
import { CommonActions, TabActions } from "@react-navigation/native";
import colors from "../constants/colors";

const HomeStack = createStackNavigator();
const StatusBarHeight = 20;

const ObjectRadioButton = () => {
  const [checked, setChecked] = React.useState("first");

  return (
    <View style={styles.objectRadioButton}>
      <RadioButton
        value="second"
        status={checked === "second" ? "checked" : "unchecked"}
        onPress={() => setChecked("second")}
      />
    </View>
  );
};

export function homeStackNavigator() {
  return (
    <HomeStack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary._800,
        },
        headerTintColor: colors.white.high_emph,
        headerTitleStyle: {},
      }}
    >
      <HomeStack.Screen
        name="selectObject"
        component={homeScreen}
        options={{
          title: "Aktives Objekt auswählen",
          headerRight: () => (
            <View style={styles.stackIcons}>
              <IconButton
                icon="magnify"
                color={colors.white.high_emph}
                onPress={() => console.log("Pressed search")}
              />
              <IconButton
                icon="download"
                color={colors.white.high_emph}
                onPress={() => console.log("Pressed download")}
              />
            </View>
          ),
        }}
      />
      <HomeStack.Screen
        name="newObject"
        component={newObjectScreen}
        options={{
          title: "Neues Objekt erstellen",
          headerRight: () => (
            <View style={styles.stackIcons}>
              <IconButton
                icon="content-save"
                color={colors.white.high_emph}
                onPress={() => console.log("Pressed save object")}
              />
            </View>
          ),
        }}
      />
    </HomeStack.Navigator>
  );
}

export function homeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <ScrollView>
        <List.Item
          title="Max Mustermann"
          description="Musterstraße 12, 1234 Musterstadt"
          style={styles.listEntry}
          onPress={() => console.log("Pressed List item")}
          right={() => <ObjectRadioButton />}
        />
        <Divider />
        <List.Item
          title="HELLA Sonnen- und Wetterschutztechnik GmbH"
          description="Abfaltersbach 125, 9913 Abfaltersbach"
          right={() => <ObjectRadioButton />}
        />
        <Divider />
        <List.Item
          title="HELLA Sonnen- und Wetterschutztechnik GmbH Max Mustermann"
          description="HELLA Sonnen- und Wetterschutztechnik GmbH HELLA Sonnen- und Wetterschutztechnik GmbH"
          titleEllipsizeMode="tail"
          descriptionEllipsizeMode="tail"
          right={() => <ObjectRadioButton />}
        />
        <Divider />
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        label="Objekt"
        onPress={() =>
          navigation.dispatch(
            CommonActions.navigate({
              name: "newObject",
            })
          )
        }
      />
    </View>
  );
}

function CustomNavigationBar({ navigation, previous }) {
  return (
    <Appbar.Header>
      {previous ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      <Appbar.Content title="My awesome app" />
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "flex-start",
  },
  stackIcons: {
    flexDirection: "row",
    right: 4,
  },
  appbar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: StatusBarHeight,
    height: 56 + StatusBarHeight,
  },
  listEntry: { alignItems: "center" },
  objectRadioButton: {
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

/*
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          header: (props) => <CustomNavigationBar {...props} />,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
      */

/* --- old Appbar on top. Maybe useful for later 
      <Appbar style={styles.appbar}>
        <Appbar.Content title="Aktives Objekt auswählen" />
        <Appbar.Action
          icon="magnify"
          onPress={() => console.log("Pressed search")}
        />
        <Appbar.Action
          icon="download"
          onPress={() => console.log("Pressed export")}
        />
      </Appbar> */
