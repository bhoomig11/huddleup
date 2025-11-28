import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "~/components/ui/tabs";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";

import { data, Form, redirect, useNavigate, useNavigation } from "react-router";
import type { Route } from "./+types/login";
import { setAuthToken } from "~/utils/auth";
import { loginUser } from "~/api/auth";
import { Button } from "~/components/ui/button";

export default function LoginPage({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const navigate = useNavigate();
  const isSubmitting = navigation.state === "submitting";

  const loginError = actionData?.status === 401 ? actionData.error : null;
  const formErrors = actionData?.status === 400 ? actionData.errors : null;

  return (
    <main className="grid h-screen w-screen place-items-center p-8">
      <section className="w-full max-w-md space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-semibold text-green-600">HuddleUp</h1>
          <p className="text-muted-foreground mt-4">
            Welcome back! Login to get started.
          </p>
        </div>

        {/* Tabs - Login or signup */}
        <Tabs value="login" className="w-full">
          <TabsList className="grid grid-cols-2 rounded-xl bg-muted">
            <TabsTrigger value="login" className="rounded-xl">
              Log in
            </TabsTrigger>
            <TabsTrigger 
              value="signup" 
              className="rounded-xl"
              onClick={(e) => {
                e.preventDefault();
                navigate("/signup");
              }}
            >
              Create account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="pt-6">
            <Form
              method="post"
              action="/login"
              className="space-y-6"
              replace
            >

            {loginError !== null && (
              <div className="flex items-center gap-2 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="size-4"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M15 9l-6 6M9 9l6 6" />
                </svg>
                <span>{loginError !== null ? loginError : ""}</span>
              </div>
            )}
            
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="Enter your username"
              />
              {formErrors !== null && "username" in formErrors && (
                <p className="text-sm text-red-600">{formErrors.username}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
              />
              {formErrors != null && "password" in formErrors && (
                <p className="text-sm text-red-600">{formErrors.password}</p>
              )}
            </div>

            {/* static for now, can be removed if backend api for forget 
                password is not added or can go in future scope.
              */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="stay-signed" />
                <Label htmlFor="stay-signed" className="text-sm">
                  Keep me signed in
                </Label>
              </div>
              <button
              type="button"
              className="text-sm text-muted-foreground hover:text-primary"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit button */}
            <Button 
              type="submit" 
              className="w-full h-11 text-base bg-green-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-5 animate-spin"
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                  </span>
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </Button>
            </Form>
          </TabsContent>
        </Tabs>



        {/* <Form
          method="post"
          action="/login"
          className="flex flex-col gap-6 rounded border border-gray-300 p-4 shadow-sm"
          replace
        >
          <h2 className="text-center text-3xl font-semibold tracking-tight text-gray-800">
            HuddleUp
          </h2>
          {loginError !== null && (
            <div className="flex h-8 items-center overflow-hidden rounded-sm">
              <span className="flex h-full w-8 items-center justify-center bg-red-600 text-red-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="m15 9-6 6" />
                  <path d="m9 9 6 6" />
                </svg>
              </span>
              <span className="px-2 py-1.5 text-sm tracking-tight text-red-600">
                {loginError !== null ? loginError : ""}
              </span>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="tracking-tight text-gray-800">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Enter your username"
              className="w-80 rounded border border-gray-300 px-3 py-1.5 text-sm tracking-tight text-gray-800"
            />
            {formErrors !== null && "username" in formErrors && (
              <div className="flex flex-row items-center gap-1.5 text-sm tracking-tight text-red-600">
                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-4"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" x2="12" y1="8" y2="12" />
                    <line x1="12" x2="12.01" y1="16" y2="16" />
                  </svg>
                </span>

                <span>{formErrors.username}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="tracking-tight text-gray-800">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              className="w-80 rounded border border-gray-300 px-3 py-1.5 text-sm tracking-tight text-gray-800"
            />
            {formErrors !== null && "password" in formErrors && (
              <div className="flex flex-row items-center gap-1.5 text-sm tracking-tight text-red-600">
                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-4"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" x2="12" y1="8" y2="12" />
                    <line x1="12" x2="12.01" y1="16" y2="16" />
                  </svg>
                </span>

                <span>{formErrors.password}</span>
              </div>
            )}
          </div>
          <div>
            <button
              type="submit"
              // onClick={(e) => e.preventDefault()}
              disabled={isSubmitting}
              className="flex w-full cursor-pointer flex-row items-center justify-center gap-2 rounded bg-green-500 px-4 py-2 tracking-tight text-white transition-colors not-disabled:hover:bg-green-400 not-disabled:active:bg-green-600 disabled:cursor-default disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-5 animate-spin"
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                  </span>
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
          </div>
        </Form> */}
      </section>
    </main>
  );
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const formErrors: Record<string, string> = {};
  let hasFormErrors = false;

  const usernameEntry = formData.get("username");
  if (usernameEntry === null) {
    formErrors.username = "Username is missing";
    hasFormErrors = true;
  }

  const passwordEntry = formData.get("password");
  if (passwordEntry === null) {
    formErrors.password = "Password is missing";
    hasFormErrors = true;
  }

  if (hasFormErrors) {
    return data(
      { ok: false, status: 400 as const, errors: formErrors },
      { status: 400 }
    );
  }

  const username = usernameEntry?.toString() ?? "";
  const password = passwordEntry?.toString() ?? "";

  const result = await loginUser({ username, password });

  if (!result.ok) {
    return data(
      {
        ok: false,
        status: 401 as const,
        error: "Invalid username or password",
      },
      { status: 401 }
    );
  }

  const { token } = await result.json();
  return data({ ok: true, status: 200 as const, token }, { status: 200 });
}

export async function clientAction({ serverAction }: Route.ClientActionArgs) {
  const response = await serverAction();
  if (response.status === 200) {
    setAuthToken(response.token);
    throw redirect("/");
  } else {
    return response;
  }
}