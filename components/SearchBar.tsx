import React, { useState, } from "react";
import { StyleSheet, TextInput, Keyboard, Button } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import Colors from "../styles/Colors";
import { ThemedView } from "./ThemedComponents";

const SearchBar = ({ searchPhrase, setSearchPhrase, setScannerEnabled, enabled, setLoading }) => {
  // has the search bar been clicked? - used to show/hide buttons
  const [clicked, setClicked] = useState(false);
  const [displayedSearchPhrase, setDisplayedSearchPhrase] = useState(searchPhrase);

  return (
    <>
      <ThemedView style={styles.container}>
        <ThemedView style={clicked ? styles.searchBar__clicked : styles.searchBar__unclicked}>
          <Ionicons name="search-outline" size={20} color={Colors.light} style={{ marginLeft: 10, marginRight: 5 }} />
          <TextInput
            style={styles.input}
            placeholder="Search Food..."
            value={displayedSearchPhrase}
            onChangeText={setDisplayedSearchPhrase}
            returnKeyType="search"
            onFocus={() => setClicked(true)}
            onSubmitEditing={async () => {
              setSearchPhrase(displayedSearchPhrase);
              setLoading(true);
            }}
          />
          {clicked && (
            <Ionicons
              name="close-outline"
              size={20}
              color={Colors.light}
              style={{ padding: 1, start: 0, marginRight: 10 }}
              onPress={() => {
                if (enabled) {
                  setSearchPhrase("");
                  setDisplayedSearchPhrase("");
                }
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
                if (!enabled) return;
                Keyboard.dismiss();
                setClicked(false);
              }}
            />
            :
            <Ionicons
              name="barcode-outline"
              size={36}
              color={Colors.light}
              style={{ paddingStart: 15, paddingEnd: 15 }}
              onPress={() => { if(enabled) setScannerEnabled(true); }}
            />
          }
        </ThemedView>
      </ThemedView>
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
