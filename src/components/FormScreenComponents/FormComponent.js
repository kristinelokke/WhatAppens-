import React, { Component } from "react";
import { Text, TouchableOpacity, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";

export default class FormComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      answerStatusState: (
        <View style={styles.answerContainerStyle}>
          <Text style={styles.answerStyle}>Answer</Text>
          <MaterialIcons name="arrow-forward-ios" size={24} color="#197CA5" />
        </View>
      ),
    };
  }

  handleSubmit = () => {
    if (this.props.pointsArray.length > 0) {
      this.props.onSubmit();
    }
    this.updateAnswerStatusState();
  };

  currentHour = `${new Date().getHours()}:${new Date().getMinutes()}`;

  navigationToForm = () => {
    if (
      this.currentHour >= this.props.startHour &&
      this.currentHour <= this.props.endHour
    ) {
      if (this.props.pointsArray.length === 0) {
        this.props.navigation.navigate("Form", {
          generalQuestionnaires: this.props.generalQuestionnaires,
          formName: this.props.formName,
          questionnaire: this.props.questionnaire,
          pointsArray: this.props.pointsArray,
          localObjectsArray: this.props.localObjectsArray,
          finalAnswersArray: this.props.finalAnswersArray,
          handleSubmit: this.props.onSubmit,
        });
      } else {
        this.handleSubmit();
      }
    }
    this.updateAnswerStatusState();
  };

  componentDidMount() {
    this.updateAnswerStatusState();
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.pointsArray !== prevProps.pointsArray ||
      this.props.completedForms !== prevProps.completedForms
    ) {
      this.updateAnswerStatusState();
    }
  }

  timeToMinutes(time) {
    const [hours, minutes] = time.split(":");
    return parseInt(hours) * 60 + parseInt(minutes);
  }

  updateAnswerStatusState() {
    const answerIcon = (
        <View style={styles.answerContainerStyle}>
          <Text style={styles.answerStyle}>Answer</Text>
          <MaterialIcons name="arrow-forward-ios" size={24} color="#197CA5" />
        </View>
    );

    const checkmarkIcon = (
        <View style={styles.answerContainerStyle}>
          <AntDesign name="check" size={24} color="green" />
        </View>
    );

    const lockIcon = (
        <View style={styles.answerContainerStyle}>
          <AntDesign name="lock" size={24} color="gray" />
        </View>
    );
    const closeIcon = (
        <View style={styles.answerContainerStyle}>
          <AntDesign name="close" size={24} color="gray" />
        </View>
    );

    if (
        this.currentHour >= this.props.startHour &&
        this.currentHour <= this.props.endHour
    ) {
      if (this.props.completedForms.includes(this.props.formName)) {
        this.setState({
          answerStatusState: checkmarkIcon,
        });
      } else {
        this.setState({
          answerStatusState: answerIcon,
        });
      }
    }
    // if the form has been unlocked and not completed, show an X mark icon
    else if (
        this.currentHour > this.props.endHour &&
        !this.props.completedForms.includes(this.props.formName)
    ) {
      this.setState({
        answerStatusState: closeIcon,
      });
    } else {
      this.setState({
        answerStatusState: lockIcon,
      });
    }
  }

  render() {
    return (
      <TouchableOpacity
        onPress={this.navigationToForm}
        style={styles.container}
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="clipboard-text"
            size={40}
            color="#197CA5"
            style={styles.icon}
          />
          <View style={styles.textContainer}>
            <Text style={styles.formNameStyle}>{this.props.formName}</Text>
            <Text style={styles.time}>
              {this.props.startHour} - {this.props.endHour}
            </Text>
          </View>
        </View>
        {this.state.answerStatusState}
      </TouchableOpacity>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    backgroundColor: "#F8F8F8",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
    shadowColor: "#E5E5E5",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    marginRight: 5,
  },

  textContainer: {
    flexDirection: "column",
    marginLeft: 10,
  },

  formNameStyle: {
    fontWeight: "600",
    fontSize: 14,
    color: "#197CA5",
  },

  time: {
    fontSize: 10,
    color: "#999",
    marginTop: 5,
  },

  answerContainerStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    paddingHorizontal: 10,
  },

  answerStyle: {
    fontWeight: "600",
    fontSize: 12,
    color: "#197CA5",
  },
});
