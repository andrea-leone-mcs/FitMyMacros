import React, { useContext, useEffect, useState } from "react";
import SQLite from "react-native-sqlite-storage";

const DatabaseContext = React.createContext<SQLite.SQLiteDatabase | null>(null);

const DatabaseContextProvider = ({ children }) => {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

  useEffect(() => {
    const openDB = async () => {
      const dbInstance = await SQLite.openDatabase({
        name: "local.sqlite",
        location: "default",
      },
        () => {
          console.log("Database opened successfully");
        },
        error => console.log("Database open error: ", error)
      );
      dbInstance.transaction(tx => {
        tx.executeSql("CREATE TABLE IF NOT EXISTS foods (id TEXT, name TEXT, brand TEXT, kcals FLOAT, carbs FLOAT, proteins FLOAT, fats FLOAT, timestamp DATETIME)", [],
          () => {
            console.log("Table 'food' created successfully");
          },
          error => {
            console.log("Table 'food' creation error: ", error);
            throw error;  // Stop further execution if creation fails
          }
        );
        tx.executeSql("CREATE TABLE IF NOT EXISTS meals (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, date DATE)", [],
          () => {
            console.log("Table 'meals' created successfully");
          },
          error => {
            console.log("Table 'meals' creation error: ", error);
            throw error;  // Stop further execution if creation fails
          }
        );
        tx.executeSql("CREATE TABLE IF NOT EXISTS eaten_food (id INTEGER PRIMARY KEY AUTOINCREMENT, meal_id INTEGER, food_id TEXT, amount INTEGER)", [],
          () => {
            console.log("Table 'eaten_food' created successfully");
          },
          error => {
            console.log("Table 'eaten_food' creation error: ", error);
            throw error;  // Stop further execution if creation fails
          }
        );
      });
      setDb(dbInstance);
    };
    openDB();
  }, []);

  return (
    <DatabaseContext.Provider value={db}>
      {children}
    </DatabaseContext.Provider>
  );
};

const getMeals = async (db: SQLite.SQLiteDatabase, day: Date) => {
  let res = {};

  await db.transaction(tx => {
    const mealDate = day.toISOString().split('T')[0];
    tx.executeSql("SELECT * FROM meals WHERE date = ?", [mealDate],
      (tx, results) => {
        console.log("SELECT meals success: ", results.rows.length, " results.");
        if (results.rows.length == 0) {
          tx.executeSql("INSERT INTO meals(name, date) VALUES (?, ?), (?, ?), (?, ?), (?, ?)",
            ["Breakfast", mealDate, "Lunch", mealDate, "Snacks", mealDate, "Dinner", mealDate],
            (tx, results) => {
              console.log("INSERT meals success: ", results);
              tx.executeSql("SELECT * FROM meals WHERE date = ?", [mealDate],
                (tx, results) => {
                  console.log("SELECT2 meals success: ", results.rows.length, " results.");
                  for (let i = 0; i < results.rows.length; i++)
                    res[results.rows.item(i).name] = results.rows.item(i).id;
                },
                error => console.log("Select2 error: ", error)
              );
            }, error => console.log("Insertion error: ", error));
        } else {
          for (let i = 0; i < results.rows.length; i++)
            res[results.rows.item(i).name] = results.rows.item(i).id;
        }
      },
      error => console.log("Select error: ", error)
    );
  });

  return res;
}

const getRecentFoods = async (db: SQLite.SQLiteDatabase) => {
  if (!db) { throw new Error("Can't retrieve db from DatabaseContext"); }

  let res = { "Breakfast": [], "Lunch": [], "Snacks": [], "Dinner": [] };

  await db.transaction(tx => {
    tx.executeSql("SELECT name AS meal_name, food_id FROM eaten_food, meals WHERE eaten_food.meal_id = meals.id AND meals.date > datetime('now', '-7 day')", [],
      (tx, results) => {
        console.log("SELECT eaten_food, meals success: ", results.rows.length, " results.");
        let foods_per_meal = { "Breakfast": new Set<string>(), "Lunch": new Set<string>(), "Snacks": new Set<string>(), "Dinner": new Set<string>() };
        for (let i = 0; i < results.rows.length; i++) {
          const item = results.rows.item(i);
          if (item.food_id !== null) // Could happen for malformed data
            foods_per_meal[item.meal_name].add(item.food_id);
        }
        let all_foods: string[] = []
        for (const meal in foods_per_meal) {
          foods_per_meal[meal] = [...foods_per_meal[meal]];
          all_foods = [...all_foods, ...foods_per_meal[meal]];
        }
        const in_list = "(" + all_foods.map(() => "?").join(",") + ")";
        console.log('Foods per meal', foods_per_meal);
        tx.executeSql("SELECT id, name, brand, kcals, proteins, carbs, fats FROM foods WHERE id IN " + in_list, all_foods,
          (tx, results) => {
            console.log("SELECT foods success: ", results.rows.length, " results.");
            let foods = {};
            for (let i = 0; i < results.rows.length; i++) {
              // TODO: check timestamp and request new data if too old
              const item = results.rows.item(i);
              foods[item.id] = item;
            }
            for (const meal in foods_per_meal) {
              res[meal] = foods_per_meal[meal].map(id => foods[id]);
            }
          },
          error => console.log("Select error: ", error)
        );
      },
      error => console.log("Select error: ", error)
    );
  });
  console.log('All recent foods: ', res);
  return res;
}

const getMealData = async (db: SQLite.SQLiteDatabase, mealId: number) => {
  if (!db) { throw new Error("Can't retrieve db from DatabaseContext"); }

  let foods = {};
  let eaten = {};
  let stats = [0, 0, 0, 0];

  await db.transaction(tx => {
    tx.executeSql("SELECT food_id, amount FROM eaten_food WHERE meal_id = ?", [mealId],
      (tx, results) => {
        console.log("SELECT eaten_food success: ", results.rows.length, " results.");
        for (let i = 0; i < results.rows.length; i++) {
          const item = results.rows.item(i);
          if (item.food_id in eaten) {
            eaten[item.food_id] += item.amount;
          } else {
            eaten[item.food_id] = item.amount;
          }

        }
        const eaten_ids: string[] = Object.keys(eaten);
        console.log('eaten_ids', eaten_ids);
        if (eaten_ids.length > 0) {
          const in_list = "(" + eaten_ids.map(() => "?").join(",") + ")";
          tx.executeSql("SELECT id, name, brand, kcals, proteins, carbs, fats FROM foods WHERE id IN " + in_list, eaten_ids,
            (tx, results) => {
              console.log("SELECT foods success: ", results.rows.length, " results.");
              for (let i = 0; i < results.rows.length; i++) {
                const item = results.rows.item(i);
                foods[item.id] = item;
                console.log('item', item);
              }
              for (const key in eaten) {
                const amount = eaten[key];
                const food = foods[key];

                stats[0] += food.kcals * amount * 0.01;
                stats[1] += food.carbs * amount * 0.01;
                stats[2] += food.proteins * amount * 0.01;
                stats[3] += food.fats * amount * 0.01;

                foods[key].amount = amount;
              }
            },
            error => console.log("Select error: ", error)
          );
        }
      },
      error => console.log("Select error: ", error)
    );
  });
  console.log('Stats ', stats);
  return [Object.values(foods), stats];
}

const addFoodTX = (db, mealId, food) => {
  db.transaction(tx => {
    tx.executeSql("INSERT INTO foods (id, name, brand, kcals, carbs, proteins, fats, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [food.id, food.name, food.brand, food.kcals, food.carbs, food.proteins, food.fats, food.timestamp ? food.timestamp : new Date().toISOString()],
      () => console.log("Food item added to database"),
      error => { console.log("Food item add error: ", error); throw error; }
    );

    tx.executeSql("SELECT amount FROM eaten_food WHERE meal_id=? AND food_id=?", [mealId, food.id],
      (tx, results) => {
        if (results.rows.length > 1) {
          throw new Error("Multiple food items with same id in meal");
        }
        else if (results.rows.length == 1) {
          const amount = results.rows.item(0).amount + food.amount;
          tx.executeSql("UPDATE eaten_food SET amount=? WHERE meal_id=? AND food_id=?", [amount, mealId, food.id],
            () => console.log("Food amount updated"),
            error => { console.log("Food amount update error: ", error); throw error; }
          );
        } else {
          tx.executeSql("INSERT INTO eaten_food (meal_id, food_id, amount) VALUES (?, ?, ?)", [mealId, food.id, food.amount],
            () => console.log("Food added to meal"),
            error => { console.log("Eaten food add error: ", error); throw error; }
          );
        }
      },
      error => console.log("Select error: ", error)
    );
  });
}

const delFoodTX = (db, mealId, food) => {
  db.transaction(tx => {
    tx.executeSql("DELETE FROM eaten_food WHERE meal_id=? AND food_id=? AND amount=?", [mealId, food.id, food.amount],
      () => console.log("Food removed from meal"),
      error => { console.log("Eaten food remove error: ", error); throw error; }
    );
  });
}

const edtFoodTX = (db, mealId, food) => {
  db.transaction(tx => {
    tx.executeSql("UPDATE eaten_food SET amount=? WHERE meal_id=? AND food_id=?", [food.amount, mealId, food.id],
      () => console.log("Food amount updated"),
      error => { console.log("Food amount update error: ", error); throw error; }
    );
  });
}

export { DatabaseContext, DatabaseContextProvider, getMeals, getRecentFoods, getMealData, addFoodTX, delFoodTX, edtFoodTX };