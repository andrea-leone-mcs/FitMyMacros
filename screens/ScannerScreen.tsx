import { View, Text, SafeAreaView, ScrollView, useColorScheme, Linking, Alert, TouchableOpacity, Button, StyleSheet } from "react-native";
import Colors from "../styles/Colors";

import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner
} from 'react-native-vision-camera';
import { useEffect, useState } from "react";
import { findFoodById } from "../apis/apis";

const PROTEIN_BISCUIT_BARCODE = '5055534301012';

// Define the ScannerScreen component
export function ScannerScreen({ navigation }) {
  // State variables
  const [torchOn, setTorchOn] = useState(false);
  const [enableOnCodeScanned, setEnableOnCodeScanned] = useState(true);

  // Camera permission hooks
  const {
    hasPermission: cameraHasPermission,
    requestPermission: requestCameraPermission,
  } = useCameraPermission();

  // Get the camera device (back camera)
  const device = useCameraDevice('back');

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
          // showAlert(value, '--', false);
          navigation.navigate("Meal", { barcode: value });
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
  const RoundButtonWithImage = props => {
    return (
      <TouchableOpacity
        onPress={() => setTorchOn((prev) => !prev)}>
        <View>
          <Button title={torchOn ? 'Turn Off' : 'Turn On'} />
        </View>
      </TouchableOpacity>
    );
  };

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
    <SafeAreaView style={{ flex: 1 }}>
      <Camera
        codeScanner={codeScanner}
        style={styles.cameraContainer}
        device={device}
        isActive={true}
        torch={torchOn ? 'on' : 'off'}
        onTouchEnd={() => setEnableOnCodeScanned(true)}
      />
      <View style={styles.overlay}>
        <RoundButtonWithImage />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'grey',
  },
  cameraContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,

  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
