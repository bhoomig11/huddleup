import { createContext } from "react-router";
import type { Auth } from "~/types/auth";

export const authContext = createContext<Auth | null>(null);
