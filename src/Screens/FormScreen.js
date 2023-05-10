import React, { useState } from "react";
import { Text, TouchableOpacity, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Question from "../components/FormScreenComponents/Question/Question";
import { optionsArray } from "../utils/optionsArray";
import OptionButton from "../components/FormScreenComponents/OptionButton/OptionButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { addPointsIntoCategories } from "../utils/addPointsIntoCategories";
import { getWeekNumber } from "../utils/getWeekNumber";

const FormScreen = ({ navigation, route }) => {
  let {
    generalQuestionnaires,
    questionnaire,
    pointsArray,
    localObjectsArray,
    finalAnswersArray,
    formName,
    handleSubmit,
  } = route.params;

  const questions = questionnaire.map((question) => question.text);

  const questionsId = questionnaire.map((question) => question.questionId);

  const varNames = questionnaire.map((question) => question.externalQuestionId);

  let [counter, setCounter] = useState(0);

  let [question, setQuestion] = useState(questions[counter]);

  let [options, setOptions] = useState(optionsArray(questionnaire, counter));

  let [score, setScore] = useState(0);

  //Category points
  let depPoints = 0;
  let angPoints = 0;

  const lastQuestion = questions.length - 1;

  const saveLocalData = async (pointSum) => {
    try {
      const storageData = [0, 0, 0, 0, 0, 0, 0];

      storageData[new Date().getDay()] = pointSum;

      const weekKey = getWeekNumber();

      await AsyncStorage.setItem(weekKey, JSON.stringify(storageData));
    } catch (error) {
      alert(error);
    }
  };
  const onSubmit = () => {
    //sendData();
    if (handleSubmit) {
      handleSubmit(formName);
    }
    navigation.goBack();
  };
  const sendData = () => {
    const postData = { metadata: {}, answers: finalAnswersArray };
    //fetch("https://nettskjema.no/api/v3/private/deliver/form/285961", {
    fetch("https://nettskjema.no/api/v3/private/deliver/form/322108", {
      method: "POST",
      body: JSON.stringify(postData),
      headers: {
        "Content-type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const Next = (answer, questionID, answerID, varName) => {
    if (answer === "Not Affected") {
      setScore((score += 0));
      pointsArray.push(0);

      localObject = {
        varName: varName,
        points: 0,
      };

      object = {
        type: "SINGLE_OPTION",
        questionId: questionID,
        id: answerID,
      };

      localObjectsArray.push(localObject);
      finalAnswersArray.push(object);
    }

    if (answer === "Little Affected") {
      setScore((score += 1));
      pointsArray.push(1);

      localObject = {
        varName: varName,
        points: 1,
      };

      object = {
        type: "SINGLE_OPTION",
        questionId: questionID,
        id: answerID,
      };

      localObjectsArray.push(localObject);
      finalAnswersArray.push(object);
    }

    if (answer === "Quite Affected") {
      setScore((score += 2));
      pointsArray.push(2);

      localObject = {
        varName: varName,
        points: 2,
      };

      object = {
        type: "SINGLE_OPTION",
        questionId: questionID,
        id: answerID,
      };

      localObjectsArray.push(localObject);
      finalAnswersArray.push(object);
    }

    if (answer === "Very Affected") {
      setScore((score += 3));
      pointsArray.push(3);

      localObject = {
        varName: varName,
        points: 3,
      };

      object = {
        type: "SINGLE_OPTION",
        questionId: questionID,
        id: answerID,
      };

      localObjectsArray.push(localObject);
      finalAnswersArray.push(object);
    }

    if (counter !== lastQuestion) {
      setCounter((counter += 1));
      setQuestion(questions[counter]);
      setOptions(optionsArray(questionnaire, counter));
    } else {
      if (finalAnswersArray.length === generalQuestionnaires.length) {
        depPoints = addPointsIntoCategories(localObjectsArray, "Depr");
        angPoints = addPointsIntoCategories(localObjectsArray, "Angst");
        saveLocalData(depPoints);
        console.log("send data");
        //sendData();
      }
      onSubmit(); // Call the onSubmit function instead of navigation.goBack()
    }
  };

  const Prev = () => {
    setCounter((counter -= 1));
    setQuestion(questions[counter]);
    setOptions(optionsArray(questionnaire, counter));
    finalAnswersArray.splice(finalAnswersArray.length - 1, 1);
  };

  const renderOptions = options.map((option) => {
    return (
      <OptionButton
        key={option.answerOptionId}
        onPress={() =>
          Next(
            option.text,
            questionsId[counter],
            option.answerOptionId,
            varNames[counter]
          )
        }
        option={option.text}
      />
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      {/*
      <View style={styles.header}>
        <Text style={styles.headerTitle}>WhatAppens</Text>
      </View> */}
      <View style={styles.questionContainer}>
        <Text style={styles.info}>Please answer the following questions </Text>
        <Text style={styles.info2}>
          based on how you are feeling right now.{" "}
        </Text>
        <View style={styles.question}>
          <Question question={question} />
        </View>
        <View style={styles.optionsContainer}>{renderOptions}</View>
      </View>
      <View style={styles.footer}>
        {counter === 0 ? null : (
          <TouchableOpacity
            style={[styles.btn, { marginRight: 20 }]}
            onPress={Prev}
          >
            <Text style={styles.textBtn}>Previous</Text>
          </TouchableOpacity>
        )}
        <View
          style={{
            flex: 1,
            alignItems: "flex-end",
            justifyContent: "flex-end",
          }}
        >
          <Text style={styles.questionCounter}>
            <Text style={styles.label}>Question </Text>
            <Text style={styles.currentQuestion}>{counter + 1}</Text>
            <Text style={styles.label}> of </Text>
            <Text style={styles.totalQuestions}>{questions.length}</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default FormScreen;

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  info: {
    fontSize: 16,
    opacity: 0.6,
    marginTop: 180,
  },
  info2: {
    fontSize: 16,
    opacity: 0.6,
    marginTop: 3,
  },
  question: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  questionContainer: {
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 30,
    marginTop: 50,
  },
  optionsContainer: {
    height: 200,
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  footer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    justifyContent: "space-between",
    paddingLeft: 30,
    paddingRight: 30,
    paddingTop: 10,
    paddingBottom: 5,
    width: "100%",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#D1D1D1",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  questionCounter: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1A759F",
    textAlign: "center",
    marginBottom: 11,
    marginTop: 5,
  },
  currentQuestion: {
    fontSize: 24,
    fontWeight: "500",
  },
  totalQuestions: {
    fontSize: 24,
    fontWeight: "500",
    opacity: 0.6,
  },
  lastQuestion: {
    fontSize: 16,
    opacity: 0.6,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    opacity: 0.6,
  },
  btn: {
    backgroundColor: "#1A759F",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 3,
    opacity: 0.7,
    height: 40,
  },
  textBtn: {
    color: "white",
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
  },
});
