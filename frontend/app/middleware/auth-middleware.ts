import { createContext } from "react-router";
import type { Auth } from "~/types";

export const authContext = createContext<Auth | null>(null);