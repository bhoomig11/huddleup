import { Outlet } from "react-router";
import {
  getAuthToken,
  getAuthUsername,
  isTokenValid,
  removeAuthToken,
} from "~/utils/auth";
import type { Route } from "./+types/layout";
import { authContext } from "~/middleware/auth-middleware";
import { AppUserProvider } from "~/providers/app-user-provider";
import { Header } from "~/components/header";

export const clientMiddleware: Route.ClientMiddlewareFunction[] = [
  async function clientMiddleware({ context }) {
    const token = getAuthToken();
    if (token === null || !isTokenValid(token)) {
      // Clean up expired token
      if (token !== null) {
        removeAuthToken();
      }
      context.set(authContext, null);
      return;
    }

    const username = getAuthUsername();
    if (username === null) {
      context.set(authContext, null);
      return;
    }

    context.set(authContext, { token, username });
  },
];

export async function clientLoader({ context }: Route.ClientLoaderArgs) {
  const auth = context.get(authContext);
  const usernameOrNull = auth?.username ?? null;
  return usernameOrNull;
}

export default function Layout({ loaderData: username }: Route.ComponentProps) {
  return (
    <AppUserProvider username={username}>
      <div className="min-h-screen w-full bg-stone-100">
        <Header />
        <Outlet />
      </div>
    </AppUserProvider>
  );
}
