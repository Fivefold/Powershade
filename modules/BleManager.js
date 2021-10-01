import { BleManager } from "react-native-ble-plx";

import { Base64, decode_base64 } from "./Base64";

export const bleManager = new BleManager({
  restoreStateIdentifier: "bleManagerRestoredState",
  restoreStateFunction: (bleRestoredState) => {
    if (bleRestoredState == null) {
      // BleManager was constructed for the first time.
      return new BleManager();
    } else {
      // BleManager was restored. Check `bleRestoredState.connectedPeripherals` property.
      console.log(
        "[INFO] restored BleManager state: " +
          bleRestoredState.connectedPeripherals[0]
      );
      bleRestoredState.connectedPeripherals[0].connect();
      bleDevice = bleRestoredState.connectedPeripherals[0];
    }
  },
});

const bleDeviceID = "B8:27:EB:96:29:D3"; // MAC address of the bluetooth device

// this stores the uuids of all relevant services, characteristics and descriptors
export const bleServices = {
  battery: {
    uuid: "180F",
    characteristics: {
      level: {
        uuid: "2A19",
      },
    },
  },
  measurementStatus: {
    uuid: "ce259a55-350a-462f-853b-a9d537784645",
    characteristics: {
      status: {
        uuid: "c12f029b-a8ff-423f-ace5-c05e38fd567d",
        descriptors: {
          desc: "2901",
        },
      },
    },
  },
  measurementValues: {
    uuid: "0c0f62da-065d-4346-80c9-8c651ff0ff76",
    characteristics: {
      latitude: {
        uuid: "1dbb5f6d-2025-45c8-aa59-a120c864833a",
        descriptors: {
          desc: "2901",
        },
      },
      longitude: {
        uuid: "0c448fb7-8d70-4770-83b6-ae198f55b60f",
        descriptors: {
          desc: "2901",
        },
      },
      altitude: {
        uuid: "a66cbce5-a9f3-4964-81ea-50478b62fc06",
        descriptors: {
          desc: "2901",
        },
      },
      azimuth: {
        uuid: "8d59fcc0-f53f-42aa-9aa0-b584b0a4a499",
        descriptors: {
          desc: "2901",
        },
      },
      inclination: {
        uuid: "9643a29b-d630-4cd8-91f4-56fe15e82c11",
        descriptors: {
          desc: "2901",
        },
      },
    },
  },
};
export var bleDevice;

export async function logChar(deviceID, serviceUUID, characteristicUUID) {
  try {
    var characteristic = await bleManager.readCharacteristicForDevice(
      deviceID,
      serviceUUID,
      characteristicUUID
    );
    characteristic = await characteristic.read();
  } catch (error) {
    console.warn(error);
  }

  console.log("characteristic value: " + Base64.decode(characteristic.value));

  return;
}

export async function logAllChars() {
  measurementValuesUUIDs = [
    bleServices.measurementValues.characteristics.latitude.uuid,
    bleServices.measurementValues.characteristics.longitude.uuid,
    bleServices.measurementValues.characteristics.altitude.uuid,
    bleServices.measurementValues.characteristics.azimuth.uuid,
    bleServices.measurementValues.characteristics.inclination.uuid,
  ];

  measurementValuesUUIDs.forEach((charUUID) => {
    logChar(bleDeviceID, bleServices.measurementValues.uuid, charUUID);
  });
}

export async function getBluetoothData() {
  let devices = await bleManager.devices([bleDeviceID]);
  console.log("device done");
  let services = await devices[0].services();
  console.log("services done");
  let data = [];

  await Promise.all(
    services.forEach(async (el) => {
      console.log("service forEach");
      let characteristics = await el.characteristics();
      let newCharacteristics = await Promise.all(
        characteristics.map(async (char) => {
          let newChar = await char.read();
          console.log(Base64.decode(newChar.value));
          return newChar;
        })
      );
    })
  );

  console.log(JSON.stringify(data));
}

export async function scanAndConnect() {
  // TODO: refactor this into several functions and maybe async/await syntax
  if (bleDevice != undefined) {
    bleDevice = await bleManager.connectToDevice(bleDeviceID);
    bleDevice = await bleDevice.discoverAllServicesAndCharacteristics();

    console.log(
      `[INFO] BLE device connected! name: ${bleDevice.name}, id: ${bleDevice.id}`
    );
    return true;
  } else {
    let promise = new Promise((resolve, reject) => {
      bleManager
        .isDeviceConnected(bleDeviceID)
        .then((isConnected) => {
          if (isConnected) {
            console.log("[INFO] BLE device is already connected!");
            throw new Error("alreadyConnected"); // ! this is not working yet
          } else {
            console.log(
              "[INFO] BLE device is not connected! Restarting bluetooth module"
            );
          }
        })
        .then(() => bleManager.state())
        .then((state) => {
          /* Workaround: sometimes after restarting the app the phone is still
              connected but does not recognize the device. Restarting the BT module
              kills the connection */
          if (state === "PoweredOn") {
            return bleManager.disable().then(() => {
              console.log("[INFO] BT disabled");
              return bleManager.enable();
            });
          } else if (state === "PoweredOff") {
            return bleManager.enable();
          } else {
            console.warn("[WARN] bleManager state problem! state is: " + state);
            reject("bleManager state problem! state is: " + state);
          }
        })
        .then(() => {
          console.log("[INFO] BT enabled");

          bleManager.startDeviceScan(null, null, (error, device) => {
            if (error) {
              // Handle error (scanning will be stopped automatically)
              console.warn(
                "[WARN] Bluetooth scanAndConnect error: " + error.message
              );
              reject("Bluetooth scanAndConnect error: " + error.message);
            }

            if (device.id === bleDeviceID) {
              bleManager.stopDeviceScan(); // only one device needed

              // Proceed with connection.
              device
                .connect()
                .then((device) => {
                  return device.discoverAllServicesAndCharacteristics();
                })
                .then((device) => {
                  console.log(
                    `[INFO] BLE device connected! name: ${device.name}, id: ${device.id}`
                  );
                  bleDevice = device;
                  resolve(true);
                })
                .catch((error) => {
                  console.warn(
                    "[WARN] Bluetooth device.connect error: " + error.message
                  );
                  reject("Bluetooth device.connect error: " + error.message);
                });
            }
          });
        })
        .catch((error) => {
          error.message === "alreadyConnected"
            ? resolve(true)
            : console.warn(error);
        });
    });

    let result = await promise;
    return result;
  }
}

export async function disconnect() {
  bleDevice = await bleManager.cancelDeviceConnection(bleDeviceID);
  console.log("[INFO] BLE device disconnected!");
  return 1;
}

async function checkIsConnected() {
  // ! this is not working yet, always continuing outside before enable is done
  return await bleManager.isDeviceConnected(bleDeviceID).then((isConnected) => {
    if (isConnected) {
      console.log("[INFO] BLE device is already connected!");
      return true;
    } else {
      console.log("[INFO] BLE device is not connected!");
      bleManager.disable().then(() => {
        /* Workaround: sometimes after restarting the app the phone is still
          connected but does not recognize the device. Restarting the BT module
          kills the connection */
        console.log("[INFO] BT disabled");
        return bleManager.enable();
      });
      // .then((res) => {
      //   console.log("[INFO] BT enabled");
      //   return;
      // });
    }
  });
}
