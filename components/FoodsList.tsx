import { FlatList, } from "react-native-gesture-handler";
import { ThemedText, ThemedView } from "./ThemedComponents";
import { ActivityIndicator, StyleSheet, ToastAndroid, TouchableOpacity, View } from "react-native";
import Colors from "../styles/Colors";
import { useEffect, useState } from "react";
import SelectAmountDialog from "./SelectAmountDialog";
import Ionicons from "@react-native-vector-icons/ionicons";
import { roundToDecimalPlaces } from "../utils/utils";
import { findMatchingFoods } from "../apis/apis";
import { loadPreferences } from "../storage/preferences";

// single item in the list
// buttons are displayed based on the callbacks passed as props
function FoodItem({ food, addCallback, removeCallback, editCallback }) {

  // amount of food, multiplied the stats per 100g in order to display the correct stats
  // defaults to 100 for foods with no specified amount
  const [amount, setAmount] = useState(food.amount ? food.amount : 100);
  // is the dialog to select the amount of food visible?
  const [dialogVisible, setDialogVisible] = useState(false);
  // color of the trash icon - just for a nice effect
  const [trashBgColor, setTrashBgColor] = useState(Colors.dark);

  return (
    <>
      {(addCallback || editCallback) && <SelectAmountDialog food={food} visible={dialogVisible} setVisible={setDialogVisible} amount={amount} setAmount={setAmount} addCallback={addCallback} editCallback={editCallback} />}
      <ThemedView style={[styles.listItem, styles.row, { marginBottom: 10, paddingVertical: 8, paddingLeft: 4 }]}>
        {
          removeCallback &&
          <ThemedView style={{ backgroundColor: trashBgColor, padding: 6 }}>
            <Ionicons name="trash-outline" size={24} color={Colors.light}
              onPressIn={() => setTrashBgColor(Colors.darker)}
              onPressOut={() => setTrashBgColor(Colors.dark)}
              onPress={() => removeCallback(food)} />
          </ThemedView>
        }
        <TouchableOpacity style={{ flex: 1 }} onPress={() => { if (addCallback || editCallback) setDialogVisible(true); }}>
          <ThemedView style={{ backgroundColor: Colors.dark, paddingHorizontal: 10, }}>
            <ThemedView style={{ backgroundColor: Colors.dark, justifyContent: "space-between", marginBottom: 4 }}>
              <ThemedText style={{ fontSize: 18, width: '75%' }}>{food.name}</ThemedText>
              {
                food.brand && <ThemedText style={{ verticalAlign: 'middle' }}>{food.brand}</ThemedText>
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
              {
                food.amount && <ThemedText style={{ fontSize: 14, verticalAlign: 'middle' }}>{food.amount} grams</ThemedText>
              }
            </ThemedView>
          </ThemedView>
        </TouchableOpacity>
      </ThemedView>
    </>
  );
};

interface DynamicFoodsListProps {
  foods: object[],
  setFoods: Function,
  searchPhrase: string,
  addCallback?: Function,
  removeCallback?: Function,
  editCallback?: Function,
  loading?: boolean,
  setLoading?: Function,
};

const DynamicFoodsList: React.FC<DynamicFoodsListProps> = ({ foods, setFoods, searchPhrase, addCallback, removeCallback, editCallback, loading, setLoading }) => {
  const [noMoreData, setNoMoreData] = useState(false);
  const [page, setPage] = useState(1);

  const fetchMoreData = async () => {
    if (searchPhrase === "") return;
    console.log('fetching more data');
    if (setLoading)
      setLoading(true);
    
    const preferences = await loadPreferences();
    const response = await findMatchingFoods(searchPhrase, preferences.diet, page);
    setPage(page + 1);
    
    if (response.status === 200) {  // success
      const new_foods = response.foods;
      if (new_foods.length === 0)
        setNoMoreData(true);
      else
        setFoods([...foods, ...new_foods]);
    } else {
      const toastText = response.status === 404 ? 'No foods found.' :
        response.status === 429 ? 'Too many requests. Please try again later.' :
          'Error fetching foods. Please try again later.';
      ToastAndroid.show(toastText, ToastAndroid.SHORT);
      setNoMoreData(true);
    }
    
    if (setLoading)
      setLoading(false);
  };

  useEffect(() => {
    console.log('loading', loading);
  }, [loading]);
  useEffect(() => {
    setNoMoreData(searchPhrase === "");
    setPage(1);
    setFoods([]);
  }, [searchPhrase]);

  // actual list of foods
  return (
    <FlatList
      style={{ width: '90%' }}
      data={foods}
      renderItem={({ item }) => (
        <FoodItem food={item} addCallback={addCallback} removeCallback={removeCallback} editCallback={editCallback} />
      )}
      keyExtractor={item => item["id"]}
      onEndReached={noMoreData ? undefined : fetchMoreData}
      onEndReachedThreshold={0.8} // Load more when 80% of the list is visible
      ListFooterComponent={loading ? <ActivityIndicator size="large" color={Colors.light} /> : <></>}
    />
  );
};

interface StaticFoodsListProps {
  foods: object[],
  addCallback?: Function,
  removeCallback?: Function,
  editCallback?: Function,
};

const StaticFoodsList: React.FC<StaticFoodsListProps> = ({ foods, addCallback, removeCallback, editCallback }) => {
  return (
    <FlatList
      style={{ width: '90%' }}
      data={foods}
      renderItem={({ item }) => (
        <FoodItem food={item} addCallback={addCallback} removeCallback={removeCallback} editCallback={editCallback} />
      )}
      keyExtractor={item => item["id"]}
    />
  );
};

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

export { DynamicFoodsList, StaticFoodsList };