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

/*
  18326823-60b5-4f48-9585-c2dc8b72edfa custom service
  d23a7990-a904-4ae4-9244-2d929c60d907 custom characteristic
  b628c863-cb9d-475b-a3d0-a7dde4a28bf9 custom descriptor
*/

/* gobbledegook
  00000001-1e3c-fad4-74e2-97a033f1bfaa service
  00000002-1e3c-fad4-74e2-97a033f1bfaa characteristic
*/

const bleDeviceID = "B8:27:EB:96:29:D3";

export const uuids = {
  services: {
    magnetometer: "00000001-1e3c-fad4-74e2-97a033f1bfaa",
  },
};
export var bleDevice;

export function logName() {
  bleManager
    .readCharacteristicForDevice(
      bleDeviceID,
      "00000001-1e3c-fad4-74e2-97a033f1bfaa",
      "00000002-1e3c-fad4-74e2-97a033f1bfaa"
    )
    .then((characteristic) => {
      return characteristic.read();
    })
    .then((characteristic) => {
      console.log("characteristic value: " + characteristic.value);
      console.log(
        "characteristic value (decoded): " + Base64.decode(characteristic.value)
      );
    })
    .catch((error) => {
      console.warn(JSON.stringify(error));
    });
  return;
}

export async function scanAndConnect() {
  // TODO: refactor this into several functions
  let promise = new Promise(
    (resolve, reject) => {
      bleManager
        .isDeviceConnected(bleDeviceID)
        .then((isConnected) => {
          if (isConnected) {
            console.log("[INFO] BLE device is already connected!");
            promise.resolve(true); // ! function does not end here but should
          } else {
            console.log("[INFO] BLE device is not connected!");
            return;
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
          throw error;
        });
    }
    // });
    // });
  );

  let result = await promise;
  return result;
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
