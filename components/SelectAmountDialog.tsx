import { TextInput } from "react-native-gesture-handler";
import { ThemedText } from "./ThemedComponents";
import { Keyboard, StyleSheet, View } from "react-native";
import Colors from "../styles/Colors";
import DialogContainer from "react-native-dialog/lib/Container";
import { useEffect, useState } from "react";
import DialogButton from "react-native-dialog/lib/Button";
import { roundToDecimalPlaces } from "../utils/utils";
import { AddButton, RemoveButton } from "./Buttons";

// Dialog in the middle of the screen to select the amount of food
function SelectAmountDialog({ food, visible, setVisible, amount, setAmount, addCallback, editCallback }) {
  const [localAmount, setLocalAmount] = useState(amount);

  useEffect(() => {
    if (addCallback) {
      setAmount(100);
      setLocalAmount(100);
    }
    console.log(food);
  }, [visible]);

  return (
    <DialogContainer visible={visible} headerStyle={{ margin: 5, }} contentStyle={{ alignItems: "center" }}>
      <ThemedText style={{ fontSize: 20 }}>{food.name}</ThemedText>
      <View style={[styles.row, { justifyContent: "center", alignItems: "center" }]}>
        <RemoveButton callback={() => {
          if (localAmount >= 5) {
            setLocalAmount(localAmount - 5);
          } else {
            setLocalAmount(0);
          }
          Keyboard.dismiss();
        }} style={{ marginRight: 20 }} />
        <TextInput
          keyboardType="numeric"
          style={{ fontSize: 30 }}
          value={localAmount.toString()}
          onChangeText={(text) => {
            const tmp = parseInt(text);
            if (isNaN(tmp) || tmp < 0) {
              setLocalAmount(0);
            } else {
              setLocalAmount(tmp);
            }
          }}
        />
        <ThemedText style={{ fontSize: 20 }}> grams</ThemedText>
        <AddButton callback={() => {
          setLocalAmount(localAmount + 5);
          Keyboard.dismiss();
        }} style={{ marginLeft: 20 }} />
      </View>
      <View style={[styles.listItem, styles.row]}>
        <ThemedText>kcal</ThemedText>
        <ThemedText>carbs</ThemedText>
        <ThemedText>pros</ThemedText>
        <ThemedText>fats</ThemedText>
      </View>
      <View style={[styles.listItem, styles.row]}>
        <ThemedText>{roundToDecimalPlaces(food.kcals / 100 * localAmount, 1)}</ThemedText>
        <ThemedText>{roundToDecimalPlaces(food.carbs / 100 * localAmount, 1)}</ThemedText>
        <ThemedText>{roundToDecimalPlaces(food.proteins / 100 * localAmount, 1)}</ThemedText>
        <ThemedText>{roundToDecimalPlaces(food.fats / 100 * localAmount, 1)}</ThemedText>
      </View>
      <View style={[styles.row, { justifyContent: "space-between", width: "100%", paddingHorizontal: 30, marginTop: 20 }]}>
        <DialogButton style={{ fontSize: 16 }} label="Cancel" onPress={() => {
          console.log("cancel");
          Keyboard.dismiss();
          setVisible(false);
        }} />
        <DialogButton style={{ fontSize: 16 }} label={addCallback ? "Add" : "Edit"} onPress={() =>  {
          console.log("add");
          Keyboard.dismiss();
          setAmount(localAmount);
          addCallback ? addCallback({...food, "amount": localAmount}) : editCallback({...food, "amount": localAmount});
          setVisible(false);
        }} />
      </View>
    </DialogContainer>
  );
}

export default SelectAmountDialog;

const styles = StyleSheet.create({
  listItem: {
    paddingLeft: 10,
    paddingRight: 10,
    width: '100%',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  line: {
    height: 1, // Adjust height as needed
    width: '100%',
    borderBottomColor: Colors.light,
    borderBottomWidth: 1,
  },
});