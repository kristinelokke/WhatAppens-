import React, { Component } from "react";
import {
  Text,
  StyleSheet,
  View,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  MenuProvider,
} from "react-native-popup-menu";
import { SafeAreaView } from "react-native-safe-area-context";
import FormComponent from "../components/FormScreenComponents/FormComponent";
import { divideArray } from "../utils/divideArray";
import axios from "axios";
import { extractQuestionnaires } from "../utils/extractQuestionnaires";
import ProgressTracker from "../components/ProgressTracker";
import {
  scheduleMorningNotification,
  scheduleNoonNotification,
  scheduleAfternoonNotification,
  scheduleEveningNotification,
} from "../components/Notifications";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

const RESET_PROGRESS_TASK = "resetProgressTask";

export default class HomeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      generalQuestionnaires: [],
      morningPointsArray: [],
      noonPointsArray: [],
      afternoonPointsArray: [],
      eveningPointsArray: [],
      localObjectsArray: [],
      finalAnswersArray: [],
      currentStep: 0,
      completedForms: [],
      streakCount: 0,
    };
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState !== this.state) {
      AsyncStorage.setItem("streakCount", JSON.stringify(this.state.streakCount));
      this.storeData();
    }
  }

  getNettskjemaData = () => {
    axios
      .get("https://nettskjema.no/answer/answer.json?formId=322108")
      .then((res) => {
        const questionnaires = [];
        extractQuestionnaires(res.data.form.pages[0].elements, questionnaires);
        this.setState({ generalQuestionnaires: questionnaires });
      });
  };

  // Refresh the application data and reset progress
  refreshApp = async () => {
    this.retrieveData();
    this.getNettskjemaData();
  };

  componentDidMount() {
    this.getNettskjemaData();
    scheduleMorningNotification();
    scheduleNoonNotification();
    scheduleAfternoonNotification();
    scheduleEveningNotification();
    this.retrieveData();

    // Define the task before registering it
    TaskManager.defineTask(RESET_PROGRESS_TASK, async () => {
      const now = new Date();
      const midnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        0,
        0
      );
      const isMidnight = now.getTime() === midnight.getTime();

      if (isMidnight) {
        await this.resetProgress();
      }

      return isMidnight
        ? BackgroundFetch.Result.NewData
        : BackgroundFetch.Result.NoData;
    });

    // Register the background task
    this.registerBackgroundTask();

    // Call the new function to reset state and Async Storage at midnight
    this.checkMidnightReset();
  }

  checkMidnightReset = async () => {
    const now = new Date();
    const resetTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      0,
      0
    );
    if (now >= resetTime) {
      resetTime.setDate(resetTime.getDate() + 1); // Set the reset time for the next day
    }

    const timeToMidnight = resetTime.getTime() - now.getTime();

    setTimeout(async () => {
      await this.resetProgress();
      this.checkMidnightReset();
    }, timeToMidnight);
  };

  // Reset progress tracker and forms at midnight
  resetProgress = async () => {
    await this.setState({
      completedForms: [],
      morningPointsArray: [],
      noonPointsArray: [],
      afternoonPointsArray: [],
      eveningPointsArray: [],
      currentStep: 0,
    });
    await AsyncStorage.setItem("morningPointsArray", JSON.stringify([]));
    await AsyncStorage.setItem("noonPointsArray", JSON.stringify([]));
    await AsyncStorage.setItem("afternoonPointsArray", JSON.stringify([]));
    await AsyncStorage.setItem("eveningPointsArray", JSON.stringify([]));
    this.storeData();
  };
  registerBackgroundTask = async () => {
    try {
      await BackgroundFetch.registerTaskAsync(RESET_PROGRESS_TASK, {
        minimumInterval: 86400, // 1 day in seconds
        stopOnTerminate: false,
        startOnBoot: true,
      });
    } catch (error) {
      console.log("Error registering background task:", error);
    }
  };

  // Save the current step and the completed forms in AsyncStorage
  storeData = async () => {
    try {
      await AsyncStorage.setItem(
        "progress",
        JSON.stringify({
          currentStep: this.state.currentStep,
          completedForms: this.state.completedForms,
        })
      );
    } catch (error) {
      console.log("Error storing data: ", error);
    }
  };

  // Retrieve the current step, the completed forms, and the points arrays from AsyncStorage
  retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem("progress");
      const streakCount = await AsyncStorage.getItem("streakCount");
      if (value !== null) {
        const data = JSON.parse(value);
        const morningPoints = await AsyncStorage.getItem("morningPointsArray");
        const noonPoints = await AsyncStorage.getItem("noonPointsArray");
        const afternoonPoints = await AsyncStorage.getItem(
          "afternoonPointsArray"
        );
        const eveningPoints = await AsyncStorage.getItem("eveningPointsArray");
        this.setState({
          currentStep: data.currentStep,
          completedForms: data.completedForms,
          morningPointsArray:
            morningPoints !== null ? JSON.parse(morningPoints) : [],
          noonPointsArray: noonPoints !== null ? JSON.parse(noonPoints) : [],
          afternoonPointsArray:
            afternoonPoints !== null ? JSON.parse(afternoonPoints) : [],
          eveningPointsArray:
            eveningPoints !== null ? JSON.parse(eveningPoints) : [],
          streakCount: streakCount !== null ? JSON.parse(streakCount) : 0,
        });
      }
    } catch (error) {
      console.log("Error retrieving data: ", error);
    }
  };

  handleSubmit = async (formName) => {
    if (!this.state.completedForms.includes(formName)) {
      // add the completed form to the state
      await this.setState((prevState) => ({
        completedForms: [...prevState.completedForms, formName],
        currentStep: prevState.currentStep + 1, // move progress tracker to next step
      }));

      // update the appropriate points array
      let pointsArray = [];
      switch (formName) {
        case "Morning":
          pointsArray = [...this.state.morningPointsArray, 1];
          await AsyncStorage.setItem(
            "morningPointsArray",
            JSON.stringify(pointsArray)
          );
          await this.setState({ morningPointsArray: pointsArray });
          break;
        case "Noon":
          pointsArray = [...this.state.noonPointsArray, 1];
          await AsyncStorage.setItem(
            "noonPointsArray",
            JSON.stringify(pointsArray)
          );
          await this.setState({ noonPointsArray: pointsArray });
          break;
        case "Afternoon":
          pointsArray = [...this.state.afternoonPointsArray, 1];
          await AsyncStorage.setItem(
            "afternoonPointsArray",
            JSON.stringify(pointsArray)
          );
          await this.setState({ afternoonPointsArray: pointsArray });
          break;
        case "Evening":
          pointsArray = [...this.state.eveningPointsArray, 1];
          await AsyncStorage.setItem(
            "eveningPointsArray",
            JSON.stringify(pointsArray)
          );
          await this.setState({ eveningPointsArray: pointsArray });
          break;
      }
      this.storeData();
      // show motivational message if all forms have been completed
      if (this.state.completedForms.length === 4) {
        await this.setState((prevState) => ({
          streakCount: prevState.streakCount + 1, // update the streak count
        }));
        Alert.alert(
          "Congratulations!",
          "You have completed all four forms! 🎉🌟 Keep up the great work, you're doing amazing! 💪",
          [{ text: "OK" }],
          { cancelable: false }
        );
      }
    }
  };

  render() {
    const morningQuestionnaires = [];
    const noonQuestionnaires = [];
    const afternoonQuestionnaires = [];
    const eveningQuestionnaires = [];
    const currentStep = this.state.completedForms.length; // update currentStep based on completed forms

    divideArray(this.state.generalQuestionnaires, morningQuestionnaires, 0, 3);
    divideArray(this.state.generalQuestionnaires, noonQuestionnaires, 3, 6);
    divideArray(
      this.state.generalQuestionnaires,
      afternoonQuestionnaires,
      6,
      9
    );
    divideArray(
      this.state.generalQuestionnaires,
      eveningQuestionnaires,
      9,
      this.state.generalQuestionnaires.length
    );

    return (
      <MenuProvider>
        <SafeAreaView style={styles.wrapper}>
          <View style={styles.container}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Daily Check-in</Text>
              <View style={styles.buttonsContainer}>
                <View style={styles.refreshButtonContainer}>
                  <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={this.refreshApp}
                  >
                    <FontAwesome name="refresh" color="#1A759F" size={24} />
                  </TouchableOpacity>
                </View>
                <Menu>
                  <MenuTrigger>
                    <FontAwesome name="ellipsis-v" color="#1A759F" size={23} />
                  </MenuTrigger>
                  <MenuOptions customStyles={menuOptionsStyles}>
                    <MenuOption
                      onSelect={this.resetProgress}
                      customStyles={menuOptionStyles}
                    >
                      <FontAwesome
                        name="trash"
                        color="#1A759F"
                        size={24}
                        style={{ marginRight: 4, marginLeft: 5 }}
                      />
                      <Text style={styles.menuOptionText}>Reset Progress</Text>
                    </MenuOption>
                  </MenuOptions>
                </Menu>
              </View>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              <View style={styles.formContainer}>
                <View style={styles.progressTrackerContainer}>
                  <ProgressTracker
                    currentStep={currentStep}
                    completedForms={this.state.completedForms}
                  />
                </View>
                <FormComponent
                  questionnaire={morningQuestionnaires}
                  navigation={this.props.navigation}
                  pointsArray={this.state.morningPointsArray}
                  formName="Morning"
                  startHour={"08:00"}
                  endHour={"12:00"}
                  generalQuestionnaires={this.state.generalQuestionnaires}
                  localObjectsArray={this.state.localObjectsArray}
                  finalAnswersArray={this.state.finalAnswersArray}
                  completedForms={this.state.completedForms}
                  onSubmit={() => this.handleSubmit("Morning")}
                />
                <FormComponent
                  questionnaire={noonQuestionnaires}
                  navigation={this.props.navigation}
                  pointsArray={this.state.noonPointsArray}
                  formName="Noon"
                  startHour={"12:00"}
                  endHour={"16:00"}
                  generalQuestionnaires={this.state.generalQuestionnaires}
                  localObjectsArray={this.state.localObjectsArray}
                  finalAnswersArray={this.state.finalAnswersArray}
                  completedForms={this.state.completedForms}
                  onSubmit={() => this.handleSubmit("Noon")}
                />
                <FormComponent
                  questionnaire={afternoonQuestionnaires}
                  navigation={this.props.navigation}
                  pointsArray={this.state.afternoonPointsArray}
                  formName="Afternoon"
                  startHour={"16:00"}
                  endHour={"20:00"}
                  generalQuestionnaires={this.state.generalQuestionnaires}
                  localObjectsArray={this.state.localObjectsArray}
                  finalAnswersArray={this.state.finalAnswersArray}
                  completedForms={this.state.completedForms}
                  onSubmit={() => this.handleSubmit("Afternoon")}
                />
                <FormComponent
                  questionnaire={eveningQuestionnaires}
                  navigation={this.props.navigation}
                  pointsArray={this.state.eveningPointsArray}
                  formName="Evening"
                  startHour={"20:00"}
                  endHour={"24:00"}
                  generalQuestionnaires={this.state.generalQuestionnaires}
                  localObjectsArray={this.state.localObjectsArray}
                  finalAnswersArray={this.state.finalAnswersArray}
                  completedForms={this.state.completedForms}
                  onSubmit={() => this.handleSubmit("Evening")}
                />
                <Text style={styles.streakText}>
                  <FontAwesome name="star" color="#B8B8B8" size={15} /> Streak
                  Count: {this.state.streakCount}
                </Text>
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </MenuProvider>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 50,
    minHeight: 110,
  },
  progressTrackerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 1,
  },
  header: {
    backgroundColor: "#ffffff",
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#D1D1D1",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#BFBFBF",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 1,
    backgroundColor: "#F8F8F8",
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: "#D8D8D8",
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 3,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A759F",
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D1D1",
    marginVertical: 10,
    padding: 20,
    shadowColor: "#4C4C4C",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    flexGrow: null,
  },
  streakText: {
    marginHorizontal: 10,
    marginVertical: 20,
    fontSize: 14,
    textAlign: "center",
    color: "#B8B8B8",
  },
  resetButton: {
    backgroundColor: "#1A759F",
    borderRadius: 5,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginVertical: 10,
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
  },
  refreshButtonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 25,
  },
  refreshButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  menuOptionText: {
    fontSize: 16,
    color: "#333",
    padding: 10,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
const menuOptionsStyles = {
  optionsContainer: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D1D1",
    shadowColor: "#4C4C4C",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
};

const menuOptionStyles = {
  optionWrapper: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  optionTouchable: {
    underlayColor: "#F8F8F8",
  },
};
