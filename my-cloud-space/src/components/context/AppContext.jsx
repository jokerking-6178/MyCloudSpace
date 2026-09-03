import { useCallback, useEffect, useMemo, useState } from 'react';
import {clearStoredToken, getStoredToken, setStoredToken, setUnauthorizedHandler} from '../../service/apiClient';
import { fetchCurrentUser, logout as clearSession } from '../../service/authService';
import { AppContext } from './AppContextInstance';

export const AppContextProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(() => getStoredToken());
  const [userData, setUserData] = useState(null);

  const [authLoading, setAuthLoading] = useState(true);

  const signOut = useCallback(() => {
    clearSession();
    setAuthToken(null);
    setUserData(null);
  }, []);

  const signIn = useCallback((token, user) => {
    setStoredToken(token);
    setAuthToken(token);
    setUserData(user);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const user = await fetchCurrentUser();
      setUserData(user);
      return user;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearStoredToken();
      setAuthToken(null);
      setUserData(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const token = getStoredToken();
      if (!token) {
        if (!cancelled) setAuthLoading(false);
        return;
      }

      try {
        const user = await fetchCurrentUser();
        if (!cancelled) {
          setAuthToken(token);
          setUserData(user);
        }
      } catch {
        if (!cancelled) {
          clearStoredToken();
          setAuthToken(null);
          setUserData(null);
        }
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    };

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const contextValue = useMemo(
    () => ({
      authToken,
      userData,
      authLoading,
      isAuthenticated: Boolean(authToken && userData),
      signIn,
      signOut,
      refreshUser,
      setUserData,
    }),
    [authToken, userData, authLoading, signIn, signOut, refreshUser],
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};
