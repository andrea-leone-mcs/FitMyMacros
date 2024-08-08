import React, { useEffect, useState, } from "react";
import { StyleSheet, TextInput, View, Keyboard, Button, ActivityIndicator } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import Colors from "../styles/Colors";
import { findFoodById, findMatchingFoods } from "../apis/apis";
import { ThemedView } from "./ThemedComponents";
import SelectAmountDialog from "./SelectAmountDialog";

const SearchBar = ({ navigation, setSearchResults, addCallback, barcode }) => {
  const [clicked, setClicked] = useState(false);
  const [searchPhrase, setSearchPhrase] = useState("");
  const [scanFood, setScanFood] = useState<object>({});
  const [scanDialogVisible, setScanDialogVisible] = useState(false);
  const [scanAmount, setScanAmount] = useState(100);
  const [loading, setLoading] = useState(barcode !== undefined);

  useEffect(() => {
    console.log('barcode', barcode);
    if (barcode !== undefined) {
      setLoading(true);
      findFoodById(barcode).then((food: object) => {
        setScanFood(food);
        setScanDialogVisible(true);
        barcode = undefined;
      });
    }
  }, [barcode]);

  useEffect(() => {
    setLoading(barcode !== undefined && !scanDialogVisible);
  }, [scanDialogVisible]);

  return (
    <>
      {scanFood &&
        <SelectAmountDialog
          food={scanFood}
          visible={scanDialogVisible}
          setVisible={setScanDialogVisible}
          amount={scanAmount}
          setAmount={setScanAmount}
          addCallback={addCallback}
          editCallback={undefined} />
      }
      <ThemedView style={styles.container}>
        <ThemedView style={clicked ? styles.searchBar__clicked : styles.searchBar__unclicked}>
          <Ionicons
            name="search-outline"
            size={20}
            color={Colors.light}
            style={{ marginLeft: 10, marginRight: 5 }}
          />
          <TextInput
            style={styles.input}
            placeholder="Search Food..."
            value={searchPhrase}
            onChangeText={setSearchPhrase}
            onFocus={() => {
              setClicked(true);
            }}
            onSubmitEditing={async () => {
              const matches = await findMatchingFoods(searchPhrase);
              console.log(matches);
              setSearchResults(matches);
            }}
            returnKeyType="search"
          />
          {clicked && (
            <Ionicons
              name="close-outline"
              size={20}
              color={Colors.light}
              style={{ padding: 1, start: 0, marginRight: 10 }}
              onPress={() => {
                setSearchPhrase("");
              }}
            />
          )}
        </ThemedView>
        <ThemedView style={styles.btnView}>
          {clicked ?
            <Button
              title="Cancel"
              color={Colors.darker}
              onPress={() => {
                Keyboard.dismiss();
                setClicked(false);
                setSearchResults([]);
              }}
            />
            :
            <Ionicons
              name="barcode-outline"
              size={36}
              color={Colors.light}
              style={{ paddingStart: 15, paddingEnd: 15 }}
              onPress={() => {
                navigation.navigate("Scanner");
              }}
            />
          }
        </ThemedView>
      </ThemedView>
      {
        loading && <ActivityIndicator size="large" />
      }
    </>
  );
};

// styles
const styles = StyleSheet.create({
  container: {
    margin: 15,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: "row",
    width: "90%",
  },
  searchBar__unclicked: {
    padding: 10,
    flexDirection: "row",
    width: "80%",
    backgroundColor: Colors.dark,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  searchBar__clicked: {
    padding: 10,
    flexDirection: "row",
    width: "80%",
    backgroundColor: Colors.dark,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  input: {
    fontSize: 20,
    marginLeft: 10,
    width: "90%",
  },
  btnView: {
    margin: 0,
    marginLeft: 10,
    padding: 0,
  }
});

export default SearchBar;
