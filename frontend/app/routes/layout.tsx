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
import { getUserProfile } from "~/api/user";
import type { UserProfile } from "~/types/user";

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
  const username = auth?.username ?? null;

  if (username === null) {
    return {
      username: null,
      firstName: null,
      lastName: null,
    };
  }

  try {
    const response = await getUserProfile(username);
    if (response.ok) {
      const profile = (await response.json()) as UserProfile;
      return {
        username: username,
        firstName: profile.firstName,
        lastName: profile.lastName,
      };
    }
  } catch {
    // Silently fail - user profile fetch is not critical for header
  }

  return {
    username: username,
    firstName: null,
    lastName: null,
  };
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  return (
    <AppUserProvider
      username={loaderData.username}
      firstName={loaderData.firstName}
      lastName={loaderData.lastName}
    >
      <div className="min-h-screen w-full bg-stone-100">
        <Header />
        <Outlet />
      </div>
    </AppUserProvider>
  );
}
