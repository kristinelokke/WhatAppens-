import * as Notifications from "expo-notifications";

// A listener for when a notification is received
let notificationListener;

notificationListener = Notifications.addNotificationReceivedListener(
  (notification) => {
    console.log("Notification received: ", notification);
    Notifications.removeNotificationSubscription(notificationListener); // Remove the listener after the first notification is received
  }
);

// Request permissions for sending notifications
Notifications.requestPermissionsAsync().then((status) => {
  console.log("Permission status:", status);
});

// Request permissions for sending notifications
async function requestNotificationPermissions() {
  const { granted } = await Notifications.requestPermissionsAsync();
  if (!granted) {
    alert("Permission to send notifications was not granted");
  }
}

// Call the function to request notification permissions
requestNotificationPermissions();

// Cancel all previously scheduled notifications
Notifications.cancelAllScheduledNotificationsAsync()
  .then(() => console.log("All notifications canceled"))
  .catch((error) => console.log("Error canceling notifications: ", error));

// Schedule the notification with the specified content and trigger
export const scheduleMorningNotification = () => {
  const morningNotificationTime = new Date();
  morningNotificationTime.setHours(8, 0, 0); // set morning notification time to 8:00

  Notifications.scheduleNotificationAsync({
    content: {
      title: "Good morning!",
      body: "You have a new form you can complete. The form is open from 08:00-12:00 today. Take care of yourself!",
      data: { screen: "Form" },
      sound: "default",
      badge: 1,
    },
    trigger: {
      hour: morningNotificationTime.getHours(),
      minute: morningNotificationTime.getMinutes(),
      repeats: true,
    },
  }).catch((error) => console.log(error));
};

export const scheduleNoonNotification = () => {
  const noonNotificationTime = new Date();
  noonNotificationTime.setHours(12, 0, 0);

  Notifications.scheduleNotificationAsync({
    content: {
      title: "Good day!",
      body: "You have a new form you can complete. The form is open from 12:00-16:00 today.",
      data: { screen: "Form" },
      sound: "default",
      badge: 1,
    },
    trigger: {
      hour: noonNotificationTime.getHours(),
      minute: noonNotificationTime.getMinutes(),
      repeats: true,
    },
  }).catch((error) => console.log(error));
};

export const scheduleAfternoonNotification = () => {
  const afternoonNotificationTime = new Date();
  afternoonNotificationTime.setHours(16, 0, 0);
  Notifications.scheduleNotificationAsync({
    content: {
      title: "Good afternoon!",
      body: "You have a new form you can complete. The form is open from 16:00-20:00. You are doing great!",
      data: { screen: "Form" },
      sound: "default",
      badge: 1,
    },
    trigger: {
      hour: afternoonNotificationTime.getHours(),
      minute: afternoonNotificationTime.getMinutes(),
      repeats: true,
    },
  }).catch((error) => console.log(error));
};

export const scheduleEveningNotification = () => {
  const eveningNotificationTime = new Date();
  eveningNotificationTime.setHours(20, 0, 0);

  Notifications.scheduleNotificationAsync({
    content: {
      title: "Good evening!",
      body: "You have a new form you can complete. The form is open from 20:00-24:00 tonight. You got this!",
      data: { screen: "Form" },
      sound: "default",
      badge: 1,
    },
    trigger: {
      hour: eveningNotificationTime.getHours(),
      minute: eveningNotificationTime.getMinutes(),
      repeats: true,
    },
  }).catch((error) => console.log(error));
};
