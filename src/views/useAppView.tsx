import { createContext, useContext, useState } from 'react';

const AppViewContext = createContext({ view: 'dashboard', setView: (_v: string) => {} } as any);

export const AppViewProvider: React.FC<{ children: any }> = ({ children }) => {
  const [view, setView] = useState<string>('dashboard');
  return <AppViewContext.Provider value={{ view, setView }}>{children}</AppViewContext.Provider>;
};

export const useAppView = () => useContext(AppViewContext);

export const useAppViewServer = () => {
  const [view, setView] = useState('dashboard');
  return { view, setView };
};
