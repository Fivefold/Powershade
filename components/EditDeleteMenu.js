import * as React from "react";
import { View } from "react-native";
import {
  IconButton,
  Menu,
  Text,
  Button,
  Paragraph,
  Dialog,
  Portal,
  Divider,
} from "react-native-paper";

const DeleteDialog = (props) => {
  return (
    <View>
      <Portal>
        <Dialog visible={props.visible} onDismiss={props.hideDialog}>
          <Dialog.Title>Löschen</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Wirklich {props.deleteWindow ? "Fenster " : "Objekt "}
              <Text style={{ fontWeight: "bold" }}>„{props.name}“</Text>{" "}
              löschen?
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={props.hideDialog}>Nein</Button>
            <Button
              onPress={() => {
                // window mode
                if (props.deleteWindow) props.deleteWindow(props.id);
                // project mode
                else props.deleteProject(props.id);
                props.hideDialog;
              }}
            >
              Ja
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const WindowWarnings = (props) => {
  // Add Menu entries for warnings if any warning flags are in the props.
  let noDimensions = (
    <Menu.Item
      key="noDimensions"
      icon="application"
      disabled={true}
      title="Keine Fenstermaße"
    />
  );
  let noFields = (
    <Menu.Item
      key="noFields"
      icon="qrcode"
      disabled={true}
      title="Kein QR-Code"
    />
  );
  let noMeasurement = (
    <Menu.Item
      key="noMeasurement"
      icon="crosshairs-question"
      disabled={true}
      title="Keine Messung"
    />
  );

  let array = [];

  if (props.noDimensions) array.push(noDimensions);
  if (props.fieldsIncomplete) array.push(noFields);
  if (props.measureIncomplete) {
    array.push(noMeasurement);
  }

  if (array.length === 0) return null;
  else {
    array.push(<Divider key="divider" />);
    return array;
  }
};

export const EditDeleteMenu = (props) => {
  const [visible, setVisible] = React.useState(false);
  const [dialogVisible, setDialogVisible] = React.useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const showDialog = () => {
    setVisible(false); // the menu is above the dialog. hide it
    setDialogVisible(true);
  };
  const hideDialog = () => setDialogVisible(false);

  return (
    <View>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={<IconButton icon="dots-vertical" onPress={openMenu} />}
      >
        {props.deleteWindow ? <WindowWarnings {...props} /> : null}
        <Menu.Item
          icon="pencil"
          onPress={() => {
            setVisible(false);
            // window mode
            if (props.deleteWindow)
              props.navigation.navigate("newWindow", {
                windowId: props.id,
                qr: "",
              });
            // project mode
            else props.navigation.navigate("newObject", { id: props.id });
          }}
          title="Bearbeiten"
        />
        <Menu.Item icon="delete" onPress={showDialog} title="Löschen" />
      </Menu>
      <DeleteDialog
        {...props}
        visible={dialogVisible}
        showDialog={showDialog}
        hideDialog={hideDialog}
      />
    </View>
  );
};
