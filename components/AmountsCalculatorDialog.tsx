import { TextInput } from "react-native-gesture-handler";
import { ThemedText } from "./ThemedComponents";
import { StyleSheet, ToastAndroid, View } from "react-native";
import Colors from "../styles/Colors";
import DialogContainer from "react-native-dialog/lib/Container";
import { useEffect, useState } from "react";
import DialogButton from "react-native-dialog/lib/Button";
import { getMacroSource, solveSystemOfEquations } from "../utils/utils";

// Dialog in the middle of the screen to select the amount of food
function AmountsCalculatorDialog({ foods, visible, setVisible, editCallback }) {
  const [desiredState, setDesiredState] = useState({
    kcals: '',
    carbs: Math.round(foods.reduce((acc, food) => acc + food.carbs * food.amount / 100.0, 0)).toString(),
    pros: Math.round(foods.reduce((acc, food) => acc + food.proteins * food.amount / 100.0, 0)).toString(),
    fats: Math.round(foods.reduce((acc, food) => acc + food.fats * food.amount / 100.0, 0)).toString(),
  });

  useEffect(() => {
    const carbs = desiredState['carbs'] ? parseInt(desiredState['carbs']) : 0;
    const pros = desiredState['pros'] ? parseInt(desiredState['pros']) : 0;
    const fats = desiredState['fats'] ? parseInt(desiredState['fats']) : 0;

    const kcals = carbs * 4 + pros * 4 + fats * 9;
    if (kcals.toString() !== desiredState['kcals'])
      setDesiredState(oldState => ({ ...oldState, kcals: kcals.toString() }));
  }, [desiredState]);

  const handleOnChangeText = (text, field) => {
    if (field == 'kcals') return;
    const tmp = parseInt(text);
    if (isNaN(tmp) || tmp < 0) {
      setDesiredState(oldState => ({ ...oldState, [field]: '' }));
    } else {
      setDesiredState(oldState => ({ ...oldState, [field]: text }));
    }
  };

  const handleCancel = () => {
    setVisible(false);
    setDesiredState({ kcals: '', carbs: '', pros: '', fats: '' });
  }

  const handleCalculate = () => {
    const carbsSource = getMacroSource(foods, 'carbs');
    const prosSource = getMacroSource(foods, 'proteins');
    const fatsSource = getMacroSource(foods, 'fats');
    const otherFoods = foods.filter(food => food.id !== carbsSource['id'] && food.id !== prosSource['id'] && food.id !== fatsSource['id']);
    console.log('carbs, pros and fats sources: ', carbsSource, prosSource, fatsSource);

    let C = parseInt(desiredState['carbs']);
    let P = parseInt(desiredState['pros']);
    let F = parseInt(desiredState['fats']);

    otherFoods.forEach(food => {
      C -= food.carbs * food.amount / 100;
      P -= food.proteins * food.amount / 100;
      F -= food.fats * food.amount / 100;
    });

    const A =
      [[carbsSource['carbs'], prosSource['carbs'], fatsSource['carbs']],
      [carbsSource['proteins'], prosSource['proteins'], fatsSource['proteins']],
      [carbsSource['fats'], prosSource['fats'], fatsSource['fats']]];
    const B = [C, P, F];
    console.log("Targets: ", B);

    const X = solveSystemOfEquations(A, B);

    console.log("carbs, pros and fats sources amounts: ", X);

    if (X && X[0] >= 0 && X[1] >= 0 && X[2] >= 0) {
      // round to the nearest 5 the new amounts
      const newAmounts = X.map((x, _) => Math.floor(Math.round(x * 100.0) / 5) * 5);
      editCallback({ ...carbsSource, 'amount': newAmounts[0] });
      editCallback({ ...prosSource, 'amount': newAmounts[1] });
      editCallback({ ...fatsSource, 'amount': newAmounts[2] });

      ToastAndroid.show("Food amounts adjusted.", ToastAndroid.SHORT);
    } else {
      console.log("No solution found");
      ToastAndroid.show("Cannot adjust amounts.", ToastAndroid.SHORT);
    }
    setVisible(false);
  };

  return (
    <DialogContainer visible={visible} headerStyle={{ margin: 5, }} contentStyle={{ alignItems: "center" }}>
      <ThemedText style={{ fontSize: 20, marginBottom: 8 }}>Desired Macros</ThemedText>
      <View style={styles.rowView}>
        <ThemedText style={{
          width: '100%',
          textAlign: 'center',
          fontSize: 16,
        }}>
          Kcals: {desiredState['kcals']}</ThemedText>
      </View>
      <View style={styles.rowView}>
        <ThemedText style={styles.textInputLabel}>Carbs</ThemedText>
        <ThemedText style={styles.textInputLabel}>Pros</ThemedText>
        <ThemedText style={styles.textInputLabel}>Fats</ThemedText>
      </View>
      <View style={styles.rowView}>
        <TextInput style={styles.textInput} placeholder='0' keyboardType="numeric"
          value={desiredState['carbs']} onChangeText={text => handleOnChangeText(text, 'carbs')} />
        <TextInput style={styles.textInput} placeholder='0' keyboardType="numeric"
          value={desiredState['pros']} onChangeText={text => handleOnChangeText(text, 'pros')} />
        <TextInput style={styles.textInput} placeholder='0' keyboardType="numeric"
          value={desiredState['fats']} onChangeText={text => handleOnChangeText(text, 'fats')} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: "space-between", width: "100%", paddingHorizontal: 30, marginTop: 20 }}>
        <DialogButton style={{ fontSize: 16 }} label="Cancel" onPress={handleCancel} />
        <DialogButton style={{ fontSize: 16 }} label="Calculate" onPress={handleCalculate} />
      </View>
    </DialogContainer>
  );
}

export default AmountsCalculatorDialog;

const styles = StyleSheet.create({
  textInputLabel: {
    width: '33%',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 16
  },
  textInput: {
    width: 70,
    height: 40,
    padding: 5,
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
    color: Colors.light,
    // borderBottomWidth: 1,
    // borderBottomColor: Colors.light,
  },
  rowView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
});