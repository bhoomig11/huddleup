import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";

import {
  data,
  Form,
  redirect,
  useNavigate,
  useNavigation,
  useSearchParams,
} from "react-router";
import type { Route } from "./+types/login";
import { setAuthToken } from "~/utils/auth";
import { loginUser } from "~/api/auth";
import { Button } from "~/components/ui/button";
import { getInputClass } from "~/routes/user/utils";
import { HuddleUpLogo } from "~/components/huddleup-logo";

export default function LoginPage({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSubmitting = navigation.state === "submitting";
  const returnUrl = searchParams.get("returnUrl");

  const loginError = actionData?.status === 401 ? actionData.error : null;
  const formErrors = actionData?.status === 400 ? actionData.errors : null;

  return (
    <main className="grid h-screen w-screen place-items-center p-8">
      <section className="w-full max-w-md space-y-6">
        {/* Header */}
        <div>
          <span className="text-green-700">
            <HuddleUpLogo />
          </span>
          <p className="mt-4 text-muted-foreground">
            Welcome back! Login to get started.
          </p>
        </div>

        {/* Tabs - Login or signup */}
        <Tabs value="login" className="w-full">
          <TabsList className="grid grid-cols-2 rounded-xl bg-stone-200">
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
            <Form method="post" action="/login" className="space-y-6" replace>
              {returnUrl && (
                <input type="hidden" name="returnUrl" value={returnUrl} />
              )}
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
                  className={getInputClass("")}
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
                  className={getInputClass("")}
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
                className="h-11 w-full bg-green-700 text-base"
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
      </section>
    </main>
  );
}

export async function clientAction({ request }: Route.ClientActionArgs) {
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
  setAuthToken(token);

  const returnUrl = formData.get("returnUrl")?.toString();
  const redirectPath = returnUrl
    ? decodeURIComponent(returnUrl)
    : "/turf/browse";
  throw redirect(redirectPath);
}
