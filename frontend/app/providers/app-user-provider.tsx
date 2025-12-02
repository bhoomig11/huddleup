import { createContext, useContext } from "react";

type AppUserContext = { username: string | null } | null;

const appUserContext = createContext<AppUserContext>(null);

function useAppUser() {
  const appUser = useContext(appUserContext);
  if (appUser === null) {
    throw new Error("useAppUser hook must be used within an App User Provider");
  }
  return appUser;
}

interface Props extends Exclude<AppUserContext, null> {
  children: React.ReactNode;
}

function AppUserProvider(props: Props) {
  return (
    <appUserContext.Provider value={{ username: props.username }}>
      {props.children}
    </appUserContext.Provider>
  );
}

export { AppUserProvider, useAppUser };
