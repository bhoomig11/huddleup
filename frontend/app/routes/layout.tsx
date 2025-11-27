import { Outlet, redirect } from "react-router";
import { getAuthToken, getAuthUsername } from "~/utils/auth";
import type { Route } from "./+types/layout";
import { authContext } from "~/middleware/auth-middleware";

export const clientMiddleware: Route.ClientMiddlewareFunction[] = [
  async function clientMiddleware({ context }) {
    const token = getAuthToken();
    if (token === null) {
      throw redirect("/login");
    }

    const username = getAuthUsername();
    if (username === null) {
      throw redirect("/login");
    }

    context.set(authContext, { token, username });
  },
];

export async function clientLoader({ context }: Route.ClientLoaderArgs) {
  const auth = context.get(authContext);
  if (auth === null) {
    throw redirect("/login");
  }
}

export default function Layout() {
  return (
    <>
      <Outlet />
    </>
  );
}