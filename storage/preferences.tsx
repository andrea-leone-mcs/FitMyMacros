import AsyncStorage from "@react-native-async-storage/async-storage";

const defaultPreferences: Record<string, any> = {
  theme: 'dark',
  diet: 'omnivore',
  goals: {
    proteins: null,
    fats: null,
    carbs: null,
    kcals: null,
  },
};

const savePreferences = async (preferences: Record<string, any>) => {
  try {
    await AsyncStorage.setItem('preferences', JSON.stringify(preferences));
  } catch (e) {
    console.error('Error saving preferences: ', e);
  }
}

const loadPreferences = async (): Promise<Record<string, any>> => {
  try {
    const jsonValue = await AsyncStorage.getItem('preferences');
    const savedPreferences = jsonValue != null ? JSON.parse(jsonValue) : {};
    return {
      ...defaultPreferences,
      ...savedPreferences
    };
  } catch (e) {
    // handle error
    console.error('Error loading preferences:', e);
    throw e;
  }
};

const updatePreferences = async (newPreferences: Record<string, any>) => {
  const currentPreferences = await loadPreferences();
  const updatedPreferences = {
    ...currentPreferences,
    ...newPreferences,
  };
  await savePreferences(updatedPreferences);
};

export { loadPreferences, updatePreferences };