import React from "react";
import { View, Text, StyleSheet } from "react-native";
const ProgressTracker = ({ completedForms }) => {
  // Define the different steps, each with a label, start hour, and end hour
  const steps = [
    { label: "Morning", startHour: "08:00", endHour: "12:00" },
    { label: "Noon", startHour: "12:00", endHour: "16:00" },
    { label: "Afternoon", startHour: "16:00", endHour: "20:00" },
    { label: "Evening", startHour: "20:00", endHour: "24:00" },
  ];

  // Determine the current step index based on the current time and completed forms
  const getCurrentStepIndex = () => {
    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    for (let i = 0; i < steps.length; i++) {
      if (
        currentTime >= steps[i].startHour &&
        currentTime < steps[i].endHour &&
        !completedForms.includes(steps[i].label)
      ) {
        return i;
      }
    }
    // If no step is found, return -1
    return -1;
  };

  // Call the function to determine the current step index
  const currentStepIndex = getCurrentStepIndex();

  // Render the progress tracker with each step displayed and styled based on forms status
  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        // These check whether the current step has been completed or is the current step
        const isCompleted = completedForms.includes(step.label);
        const isCurrent = index === currentStepIndex;
        // checks whether the current step is the last step
        const isLastStep = index === steps.length - 1;
        // Checks if the form is uncompleted and unlocked
        const isUnlocked =
          !isCompleted &&
          (currentStepIndex >= 0 ? index <= currentStepIndex : true) &&
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }) >= step.startHour;

        return (
          <View key={index} style={styles.stepContainer}>
            <View
              style={[
                styles.stepCircle,
                isCompleted && styles.completedStepCircle,
                isCurrent && styles.currentStepCircle,
                isUnlocked &&
                  !isCompleted &&
                  !isCurrent &&
                  styles.uncompletedStepCircle,
              ]}
            >
              {!isCompleted && !isCurrent && isUnlocked && (
                <View style={styles.unlockedStepCircle} />
              )}
            </View>
            {/* Display the line between steps unless it is the last step */}
            {!isLastStep && (
              <View
                style={[
                  styles.stepLine,
                  isCompleted && styles.completedStepLine,
                  isCurrent && styles.currentStepLine,
                  isUnlocked &&
                    !isCompleted &&
                    !isCurrent &&
                    styles.uncompletedStepLine,
                ]}
              />
            )}
            {/* Display the step label */}
            <Text style={styles.stepLabel}>{step.label}</Text>
          </View>
        );
      })}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  stepContainer: {
    alignItems: "center",
    marginHorizontal: 10,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#B1B1B1",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 2,
  },
  completedStepCircle: {
    backgroundColor: "#4DA6A6",
  },
  currentStepCircle: {
    backgroundColor: "#4DA6A6",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    shadowColor: "#B1B1B1",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
  },
  uncompletedStepCircle: {
    backgroundColor: "#E5E5E5",
    borderColor: "#E5E5E5",
  },
  stepLabel: {
    marginTop: 5,
    fontSize: 12,
    textAlign: "center",
    maxWidth: 80,
    color: "#A9A9A9",
  },
  stepLine: {
    position: "absolute",
    width: 80,
    height: 4,
    borderBottomColor: "#E5E5E5",
    borderBottomWidth: 2,
    top: 18,
    left: 18,
    zIndex: -1,
  },
  completedStepLine: {
    backgroundColor: "#4DA6A6",
    zIndex: -1,
  },
  currentStepLine: {
    backgroundColor: "#4DA6A6",
    zIndex: -1,
  },
  uncompletedStepLine: {
    backgroundColor: "#E5E5E5",
    zIndex: -1,
  },
});
export default ProgressTracker;
