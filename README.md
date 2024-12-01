# FitMyMacros
## Description
This project's goal is to practice **React Native** and **Typescript** by creating a simple app that calculates the user's daily macronutrient intake based on their goals.\
The choice of this project comes from a personal need of tracking macros and the lack of a simple, basic, clean app to do that. Most of the apps on the market compute the user's daily intake based on their weight, height, age, and activity level, but they don't allow the user to set a specific goal (at least not in the free version).

**FitMyMacros** is intended to be used by people with a basic understanding of macronutrients, calories, and their goals. Since there is no magic formula to calculate the perfect intakes, the user should set his goals on his own, based on his knowledge and personal experience. However, including a basic calculator to help the user set his goals is an idea for future development.

### New Feature: Flexible Dieting / IIFYM Support
This application includes a feature that is particularly useful for individuals following a _flexible dieting_ or _IIFYM_ (If It Fits Your Macros) approach. If you want to eat a specific dish but are unsure of the ingredient proportions needed to meet your target macros for that meal, this feature can help. You can add foods with their default amounts and use this feature to adjust the quantities to reach your target macros. The app will automatically adjust the main sources of carbs, proteins, and fats to meet your goals, while keeping the other foods at their default amounts.

For example, if you plan to eat pasta with olive oil and parmesan, along with some chicken, and your goal is to consume 80g of carbs, 20g of fats, and 40g of proteins, the app will calculate the required amounts of pasta (main source of carbs), oil (main source of fats), and chicken (main source of proteins) to meet these targets. On the other hand, it won't touch the amount of cheese. However, you usually put something like a tablespoon of parmesan on your dish (~10 grams), so you can just record that amount for parmesan and then let the app calculate the rest. Since parmesan is a good source of fats and proteins, you will need a bit less oil and a bit less chicken to reach your goal.

This is something I have often done manually, and I think it would be a great feature to have in a macro tracking app.

## User Interface
The UI is intended to be as simple and clean as possible: no fancy graphics and animations, just a basic, easy-to-use interface.\
Here follows a sample app usage:\
<img src="app-demo.gif"/>
