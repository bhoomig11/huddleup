import { createContext, useContext } from "react";

type AppUserContext = {
  username: string | null;
  firstName: string | null;
  lastName: string | null;
} | null;

const appUserContext = createContext<AppUserContext>(null);

function useAppUser() {
  const appUser = useContext(appUserContext);
  if (appUser === null) {
    throw new Error("useAppUser hook must be used within an App User Provider");
  }
  return appUser;
}

interface Props {
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  children: React.ReactNode;
}

function AppUserProvider(props: Props) {
  return (
    <appUserContext.Provider
      value={{
        username: props.username,
        firstName: props.firstName,
        lastName: props.lastName,
      }}
    >
      {props.children}
    </appUserContext.Provider>
  );
}

export { AppUserProvider, useAppUser };
