import { useContext } from 'react';
import { AppContext } from '../components/context/AppContextInstance';

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used inside <AppContextProvider>');
  }
  return context;
};
