import HomeScreen from "./screens/HomeScreen";
import SQLite from "react-native-sqlite-storage";
import { NavigationContainer } from "@react-navigation/native";
import {MyTheme} from "./styles/Themes";
import MealScreen from "./screens/MealScreen";
import { createStackNavigator } from "@react-navigation/stack";
import { useColorScheme } from "react-native";
import Colors from "./styles/Colors";
import { ScannerScreen } from "./screens/ScannerScreen";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { DatabaseContextProvider } from "./storage/dbContext";

SQLite.enablePromise(true);
SQLite.DEBUG(true);

const Stack = createStackNavigator();


function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const safeAreaStyle = {
    flex: 1,
    margin: 0,
    padding: 0,
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <DatabaseContextProvider>
      <SafeAreaProvider>
        <SafeAreaView style={safeAreaStyle}>
          <NavigationContainer theme={MyTheme.dark}>
            <Stack.Navigator>
              <Stack.Screen
                name="Main"
                component={HomeScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen name="Meal" component={MealScreen} />
              <Stack.Screen
                name="Scanner"
                component={ScannerScreen}
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaView>
      </SafeAreaProvider>
    </DatabaseContextProvider>
  );
}

export default App;
