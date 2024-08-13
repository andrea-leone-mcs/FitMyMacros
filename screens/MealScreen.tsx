import { ThemedText, ThemedView } from "../components/ThemedComponents";
import { useContext, useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import FoodsList from "../components/FoodsList";
import Colors from "../styles/Colors";
import { View } from "react-native";
import { addFoodTX, DatabaseContext, delFoodTX, edtFoodTX } from "../storage/dbContext";
import { ScannerView } from "../components/ScannerView";
import { findFoodById } from "../apis/apis";
import SelectAmountDialog from "../components/SelectAmountDialog";

const PROTEIN_BISCUIT_BARCODE = '5055534301012';


function MealScreen({ route }): React.JSX.Element {
  const mealId = route.params?.mealId;
  const mealName = route.params?.mealName;
  const foodsParam = route.params?.foods;
  const recentFoods = route.params?.recentFoods;

  const [foods, setFoods] = useState<object[]>(foodsParam);
  const [searchFoods, setSearchFoods] = useState<object[] | null>(null);

  const [barcode, setBarcode] = useState(undefined);
  const [scannerEnabled, setScannerEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scannedFoodObj, setScannedFoodObj] = useState<object | undefined>(undefined);
  const [selectAmountVisible, setSelectAmountVisible] = useState(false);
  const [scannedAmount, setScannedAmount] = useState(100);
  const [shownRecentFoods, setShownRecentFoods] = useState([]);

  const db = useContext(DatabaseContext);
  if (!db) { throw new Error("Can't retrieve db from DatabaseContext"); }

  const addCallback = (food) => {
    console.log(foods);
    setFoods([...foods, food]);
    setSearchFoods(null);

    addFoodTX(db, mealId, food);
  };

  const removeCallback = (food) => {
    console.log("remove callback ", food.id);
    setFoods(foods.filter(f => f["id"] !== food["id"]));

    delFoodTX(db, mealId, food);
  };

  const editCallback = (food) => {
    setFoods(foods.map(f => {
      if (f["id"] === food["id"]) {
        return food;
      }
      return f;
    }));

    edtFoodTX(db, mealId, food);
  };

  useEffect(() => {
    console.log('FOODS', foods);
    console.log('RECENTS', recentFoods);
    setShownRecentFoods(recentFoods.filter(food => !foods.find(f => f["id"] === food["id"])));
  }, [foods]);

  useEffect(() => {
    setLoading(false);
  }, [searchFoods]);

  useEffect(() => {
    if (barcode) {
      findFoodById(barcode).then((food: object) => {
        setScannedFoodObj(food);
        setBarcode(undefined);
        setLoading(false);
        setSelectAmountVisible(true);
      });
    }
  }, [barcode]);

  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText style={{
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 20,
      }}>{mealName}</ThemedText>
      <FoodsList foods={foods} addCallback={undefined} removeCallback={removeCallback} editCallback={editCallback} loading={false} />
      <View style={{
        height: 1,
        width: '90%',
        borderBottomColor: Colors.light,
        borderBottomWidth: 1,
      }} />
      {/* {<ThemedText style={{
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 10,
      }}>Search Food</ThemedText>} */}
      {
        scannerEnabled ?
          <ScannerView setBarcode={setBarcode} setScannerEnabled={setScannerEnabled} setLoading={setLoading} />
          :
          <>
            <SearchBar setSearchResults={setSearchFoods} setScannerEnabled={setScannerEnabled} enabled={!loading} setLoading={setLoading} />
            { selectAmountVisible && <SelectAmountDialog visible={true} setVisible={setSelectAmountVisible} food={scannedFoodObj} amount={scannedAmount} setAmount={setScannedAmount} addCallback={addCallback} editCallback={editCallback} />}
            <FoodsList foods={searchFoods ? searchFoods : shownRecentFoods} addCallback={addCallback} removeCallback={undefined} editCallback={undefined} loading={loading} />
          </>
      }
    </ThemedView>
  );
}

export default MealScreen;