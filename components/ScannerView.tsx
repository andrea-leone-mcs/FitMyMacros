import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet } from "react-native";
import Colors from "../styles/Colors";

import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner
} from 'react-native-vision-camera';
import { useEffect, useState } from "react";
import { ThemedView } from "./ThemedComponents";
import Icon from "@react-native-vector-icons/ionicons";

const PROTEIN_BISCUIT_BARCODE = '5055534301012';

// Define the ScannerScreen component
export function ScannerView({ setBarcode, setScannerEnabled, setLoading }) {
  // State variables
  const [torchOn, setTorchOn] = useState(false);
  const [enableOnCodeScanned, setEnableOnCodeScanned] = useState(true);

  // Camera permission hooks
  const {
    hasPermission: cameraHasPermission,
    requestPermission: requestCameraPermission,
  } = useCameraPermission();

  // Get the camera device (back camera)
  const device = useCameraDevice('front');

  // Handle camera permission on component mount
  useEffect(() => {
    console.log("Handling camera permission");
    handleCameraPermission();
  }, []);

  // Use the code scanner hook to configure barcode scanning
  const codeScanner = useCodeScanner({
    codeTypes: ['ean-13'],
    onCodeScanned: (codes) => {
      // Check if code scanning is enabled
      if (enableOnCodeScanned) {
        let value = codes[0]?.value;
        let type = codes[0]?.type;

        console.log(codes[0]);

        // Handle code
        if (type === 'ean-13' && value !== undefined) {
          setBarcode(value);
          setScannerEnabled(false);
          setLoading(true);
        }

        // Disable code scanning to prevent rapid scans
        setEnableOnCodeScanned(false);
      }
    },
  });

  // Handle camera permission
  const handleCameraPermission = async () => {
    const granted = await requestCameraPermission();

    if (!granted) {
      alert(
        'Camera permission is required to use the camera. Please grant permission in your device settings.'
      );

      // Optionally, open device settings using Linking API
      // Linking.openSettings();
    }
  };

  // // Show alert with customizable content
  // const showAlert = (
  //   value = '',
  //   countryOfOrigin = '',
  //   showMoreBtn = true
  // ) => {
  //   Alert.alert(
  //     value,
  //     countryOfOrigin,
  //     showMoreBtn
  //       ? [
  //         {
  //           text: 'Cancel',
  //           onPress: () => console.log('Cancel Pressed'),
  //           style: 'cancel',
  //         },
  //         {
  //           text: 'More',
  //           onPress: () => {
  //             setTorchOn(false);
  //             setEnableOnCodeScanned(true);
  //             // openExternalLink(
  //             //   'https://www.barcodelookup.com/' + value
  //             // );
  //           },
  //         },
  //       ]
  //       : [
  //         {
  //           text: 'Cancel',
  //           onPress: () => setEnableOnCodeScanned(true),
  //           style: 'cancel',
  //         },
  //       ],
  //     { cancelable: false }
  //   );
  // };

  // Round button component with image
  const FlashButton = props => {
    return (
      <TouchableOpacity
        onPress={() => setTorchOn((prev) => !prev)}>
        <View>
          <Icon name={torchOn ? "flash-sharp" : "flash-off-sharp"}
            size={40}
            color={torchOn ? '#FFD700' : '#808080'}
            style={{ borderColor: Colors.white }}
          />
          <Text style={{ color: Colors.white, fontSize: 14, marginTop: 6, textAlign: 'center' }}>
            {torchOn ? 'ON' : 'OFF'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  const CloseButton = props => {
    return (
      <TouchableOpacity
        onPress={() => setScannerEnabled(false)}>
        <View>
          <Icon name="close-outline"
            size={40}
            color={Colors.light}
            style={{ borderColor: Colors.white }}
          />
          <Text style={{ color: Colors.white, fontSize: 14, marginTop: 6, textAlign: 'center' }}>
            Close
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  // Render content based on camera device availability
  if (device == null)
    return (
      <View
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <Text style={{ margin: 10 }}>Camera Not Found</Text>
      </View>
    );

  // Return the main component structure
  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.cameraContainer}>
        <Camera
          codeScanner={codeScanner}
          style={styles.camera}
          device={device}
          isActive={true}
          torch={torchOn ? 'on' : 'off'}
          onTouchEnd={() => setEnableOnCodeScanned(true)}
        />
        <ThemedView style={styles.cameraButtons}>
          <FlashButton />
          <CloseButton />
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    //flex: 1,
    backgroundColor: Colors.darker,
    width: '100%',
  },
  cameraContainer: {
    backgroundColor: Colors.darker,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    //...StyleSheet.absoluteFillObject,
    width: '90%',
    height: 250,
  },
  cameraButtons: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    flexDirection: 'row',
    width: '50%',
  },
});