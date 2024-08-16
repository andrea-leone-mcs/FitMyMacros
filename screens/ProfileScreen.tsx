import { StyleSheet, ToastAndroid, View } from "react-native";
import { HLine, HSpaceView, ThemedText, ThemedView, VSpaceView } from "../components/ThemedComponents";
import { TextInput } from "react-native-gesture-handler";
import Colors from "../styles/Colors";
import { useEffect, useState } from "react";
import { Button, RadioButton } from "react-native-paper";
import { loadPreferences, updatePreferences } from "../storage/preferences";

const MacroRow = ({ label, value, setValue }) => {
  const [txtValue, setTxtValue] = useState(value ? value.toString() : "");
  
  // Sync txtValue with the value prop whenever it changes
  useEffect(() => {
    setTxtValue(value ? value.toString() : "");
  }, [value]);

  return (
    <ThemedView style={styles.row}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <HSpaceView size={20} />
      <TextInput style={styles.textInput}
        keyboardType="numeric"
        placeholder="-"
        value={txtValue}
        onChangeText={text => {
          setTxtValue(text.replace(/[^0-9]/g, ''));
        }}
        onEndEditing={event => {
          setValue(txtValue === "" ? null : parseInt(event.nativeEvent.text));
        }} />
    </ThemedView>
  );
};

function ProfileScreen({ }): React.JSX.Element {
  const [pros, setPros] = useState(null);
  const [fats, setFats] = useState(null);
  const [carbs, setCarbs] = useState(null);
  const [kcals, setKcals] = useState(0);
  const [tag, setTag] = useState("omnivore");

  useEffect(() => {
    const proKcals = pros ? pros * 4 : 0;
    const fatKcals = fats ? fats * 9 : 0;
    const carbKcals = carbs ? carbs * 4 : 0;
    setKcals(proKcals + fatKcals + carbKcals);
  }, [pros, fats, carbs]);

  useEffect(() => {
    // load preferences
    const _loadPreferences = async () => {
      const savedPreferences = await loadPreferences();
      console.log("Preferences loaded", savedPreferences);
      setCarbs(savedPreferences.goals.carbs);
      setPros(savedPreferences.goals.proteins);
      setFats(savedPreferences.goals.fats);
      setTag(savedPreferences.diet);
    };

    _loadPreferences();
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.row}>
        <ThemedText style={{ fontSize: 22 }}>Daily Goal</ThemedText>
      </ThemedView>
      <ThemedView style={styles.row}>
        <ThemedText style={{ fontSize: 16 }}>Set your daily macros and calories goals</ThemedText>
      </ThemedView>
      <VSpaceView size={20} />
      <MacroRow label="Proteins" value={pros} setValue={setPros} />
      <MacroRow label="Fats" value={fats} setValue={setFats} />
      <MacroRow label="Carbohydrates" value={carbs} setValue={setCarbs} />

      <ThemedView style={styles.row}>
        <ThemedText style={styles.label}>Calories</ThemedText>
        <HSpaceView size={20} />
        <TextInput style={[styles.textInput, { borderWidth: 0 }]} value={kcals.toString()} editable={false} />
      </ThemedView>

      <HLine width="90%" topMargin={10} bottomMargin={20} />

      <ThemedView style={[styles.row]}>
        <ThemedText style={{ fontSize: 22 }}>Food Preferences</ThemedText>
      </ThemedView>

      <RadioButton.Group onValueChange={setTag} value={tag}>
        <ThemedView style={styles.row}>
          <RadioButton value="omnivore" />
          <ThemedText style={styles.label}>Omnivore</ThemedText>
          <RadioButton value="vegetarian" />
          <ThemedText style={styles.label}>Vegetarian</ThemedText>
        </ThemedView>
        <ThemedView style={styles.row}>
          <RadioButton value="vegan" />
          <ThemedText style={styles.label}>Vegan</ThemedText>
          <RadioButton value="carnivore" />
          <ThemedText style={styles.label}>Carnivore</ThemedText>
        </ThemedView>
      </RadioButton.Group>

      <VSpaceView size={20} />
      <Button mode="contained" onPress={() => {
        const newPreferences = { goals: { proteins: pros, fats, carbs, kcals }, diet: tag };
        updatePreferences(newPreferences);
        console.log("Preferences updated", newPreferences);
        ToastAndroid.show("Preferences saved", ToastAndroid.SHORT);
      }}>Save</Button>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 15,
    justifyContent: 'center',
    alignItems: 'center',
    width: "90%",
    marginTop: 30,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 4,
  },
  label: {
    fontSize: 16,
    width: 120,
  },
  textInput: {
    fontSize: 16,
    width: 80,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: Colors.light,
    borderRadius: 50,
    paddingHorizontal: 10,
    color: Colors.white,
  },
  radioLabel: {
    fontSize: 16,
  },
});

export default ProfileScreen;