import { withBase } from "./base";

export interface UserLoginCredentials {
  username: string;
  password: string;
}

export interface Address {
  streetLine1: string;
  streetLine2: string;
  town: string;
  state: string;
  zipcode: string;
}

export interface UserSignupCredentials {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  birthDate: string; // ISO date string (YYYY-MM-DD)
  address: Address;
}

export async function loginUser(loginCredentials: UserLoginCredentials) {
  const result = await fetch(withBase(`/api/user/login`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginCredentials),
  });
  return result;
}

export async function signupUser(signupCredentials: UserSignupCredentials) {
  const result = await fetch(withBase(`/api/user/signup`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(signupCredentials),
  });
  return result;
}
