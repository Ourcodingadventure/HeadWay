/** @format */

import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
// import AuthNavigation from "../app/navigation/auth-navigation/AuthNavigation";
import AuthContext from "./app/Context/AuthContext";
import axios from "axios";
import env from "./app/config/environment/environment";
import * as Notifications from "expo-notifications";
import socket from "./app/config/socket";
import ActivityIndicator from "./app/components/ActivityIndicator";
import OfflineNotice from "./app/components/OfflineNotice";
// import AppNavigation from "./app/navigation/app-navigation/TabNavigation";
import TabNavigation from "./app/navigation/app-navigation/TabNavigation";
import AuthNav from "./app/navigation/auth-navigation/AuthNavigation";
export default function App() {
  const [user, setUser] = useState(false);
  const [change, setChange] = useState(false);
  const [forgetEmail, setForgetEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState(null);

  const getProfile = async () => {
    setLoading(true);
    try {
      let res = await axios.get(`${env.baseUrl}/profile`, {
        withCredentials: true,
      });
      setUser(res.data.profile);
    } catch (err) {
      setUser(false);
    } finally {
      setLoading(false);
    }
  };
  const showNotification = (title, body) => {
    Notifications.presentNotificationAsync({
      title,
      body,
      data: {
        _displayInForeground: true,
        __displayInBackground: true,
      },
    });
  };

  useEffect(() => {
    getProfile();
    return () => getProfile();
  }, [change]);

  useEffect(() => {
    socket.on("notification", ({ updated, complain }) => {
      if (user) {
        if (updated) {
          if (updated._doc.email === user.email) {
            showNotification(
              "Complain Status Update",
              `Your complaint against ${updated._doc.organizationName} has been updated`
            );
          }
        }
      }
    });
    return () => {
      socket.off("notification");
    };
  }, [user]);

  if (loading) return <ActivityIndicator visible={true} />;

  return (
    <>
      <AuthContext.Provider
        value={{
          user,
          setUser,
          setChange,
          change,
          forgetEmail,
          setForgetEmail,
          coords,
          setCoords,
        }}
      >
        <OfflineNotice />
        <NavigationContainer>
          {!user ? <AuthNav /> : <TabNavigation />}
        </NavigationContainer>
      </AuthContext.Provider>
    </>
  );
}
