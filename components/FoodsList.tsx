import { FlatList, Swipeable, TextInput } from "react-native-gesture-handler";
import { ThemedText, ThemedView } from "./ThemedComponents";
import { ActivityIndicator, Keyboard, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import Colors from "../styles/Colors";
import DialogContainer from "react-native-dialog/lib/Container";
import { useEffect, useState } from "react";
import SelectAmountDialog from "./SelectAmountDialog";
import Ionicons from "@react-native-vector-icons/ionicons";
import { roundToDecimalPlaces } from "../utils/utils";

function FoodItem({ food, addCallback, removeCallback, editCallback }) {
  const [amount, setAmount] = useState(food.amount ? food.amount : 100);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [trashBackgroundColor, setTrashBackgroundColor] = useState(Colors.dark);

  return (
    <>
      {(addCallback || editCallback) && <SelectAmountDialog food={food} visible={dialogVisible} setVisible={setDialogVisible} amount={amount} setAmount={setAmount} addCallback={addCallback} editCallback={editCallback} />}
      <ThemedView style={[styles.listItem, styles.row, {
        marginBottom: 10,
        paddingVertical: 8,
        paddingLeft: 4
      }]}>
        {
          removeCallback &&
          <ThemedView style={{ backgroundColor: trashBackgroundColor, padding: 6 }}>
            <Ionicons
              name="trash-outline"
              size={24}
              color={Colors.light}
              onPressIn={() => setTrashBackgroundColor(Colors.darker)}
              onPressOut={() => setTrashBackgroundColor(Colors.dark)}
              onPress={() => removeCallback(food)} />
          </ThemedView>
        }
        <TouchableOpacity style={{ flex: 1 }} onPress={() => {
          if (addCallback || editCallback)
            setDialogVisible(true);
        }}
        >
          <ThemedView style={{ backgroundColor: Colors.dark, paddingHorizontal: 10, }}>
            <ThemedView style={{ backgroundColor: Colors.dark, justifyContent: "space-between", marginBottom: 4 }}>
              <ThemedText style={{ fontSize: 18, width: '75%' }}>{food.name}</ThemedText>
              {
                food.brand &&
                <ThemedText style={{ verticalAlign: 'middle' }}>
                  {food.brand}
                </ThemedText>
              }
            </ThemedView>
            <View style={styles.line} />
            <ThemedView style={[styles.row, { backgroundColor: Colors.dark, marginHorizontal: 12 }]}>
              <ThemedView style={{ backgroundColor: Colors.dark, width: food.amount ? '60%' : '100%' }}>
                <ThemedView style={[styles.row,]}>
                  <ThemedText>kcal</ThemedText>
                  <ThemedText>carbs</ThemedText>
                  <ThemedText>pros</ThemedText>
                  <ThemedText>fats</ThemedText>
                </ThemedView>
                <ThemedView style={[styles.row,]}>
                  <ThemedText>{roundToDecimalPlaces(amount * 0.01 * food.kcals, 1)}</ThemedText>
                  <ThemedText>{roundToDecimalPlaces(amount * 0.01 * food.carbs, 1)}</ThemedText>
                  <ThemedText>{roundToDecimalPlaces(amount * 0.01 * food.proteins, 1)}</ThemedText>
                  <ThemedText>{roundToDecimalPlaces(amount * 0.01 * food.fats, 1)}</ThemedText>
                </ThemedView>
              </ThemedView>
              { food.amount &&
                (<ThemedText style={{ fontSize: 14, verticalAlign: 'middle' }}>
                  {food.amount} grams
                </ThemedText>)
              }
            </ThemedView>
          </ThemedView>
        </TouchableOpacity>

      </ThemedView>
    </>
  );
}

function FoodsList({ foods, addCallback, removeCallback, editCallback, loading }) {
  return (
    loading ?
      <ActivityIndicator size="large" color={Colors.light} style={{ flex: 1, alignContent: 'center', justifyContent: 'center' }} />
      :
      <FlatList
        style={{ width: '90%' }}
        data={foods}
        renderItem={({ item }) => (
          <FoodItem food={item} addCallback={addCallback} removeCallback={removeCallback} editCallback={editCallback} />
        )}
        keyExtractor={item => item.id}
      />
  );
}

export default FoodsList;

const styles = StyleSheet.create({
  listItem: {
    flex: 1,
    backgroundColor: Colors.dark,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    backgroundColor: Colors.dark,
  },
  line: {
    height: 1, // Adjust height as needed
    width: '100%',
    borderBottomColor: Colors.light,
    borderBottomWidth: 1,
  },
});