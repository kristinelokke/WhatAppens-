import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Entypo, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import HomeScreen from "../Screens/HomeScreen";
const Tab = createBottomTabNavigator();

export const Tabs = () => {
    return (
        <Tab.Navigator
            initialRouteName="Skjema"
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#2f89ae",
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: "#fff",
                    paddingTop: 10,
                    paddingBottom: 5,
                    paddingHorizontal: 20,
                    borderTopWidth: 0,
                    shadowColor: "#000",
                    shadowOffset: {
                        width: 0,
                        height: -2,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 3,
                    borderRadius: 15,
                },
            }}
        >
            <Tab.Screen
                name="Skjema"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            name="clipboard-text-outline"
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};