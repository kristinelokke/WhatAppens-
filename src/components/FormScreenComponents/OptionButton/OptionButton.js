import { Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";

const OptionButton = (props) => {
  return (
    <TouchableOpacity style={styles.optionButton} onPress={props.onPress}>
      <Text style={styles.optionText}>{props.option}</Text>
    </TouchableOpacity>
  );
};

export default OptionButton;

const styles = StyleSheet.create({
  optionButton: {
    backgroundColor: "#E6F9FF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D8D8D8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginBottom: 10,
    width: 250,
    height: 60,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A4A4A",
    textAlign: "center",
    marginHorizontal: 16,
    marginVertical: 8,
  },
});
