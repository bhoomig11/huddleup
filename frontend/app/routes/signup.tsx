import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";

import { data, Form, redirect, useNavigate, useNavigation } from "react-router";
import type { Route } from "./+types/signup";
import { setAuthToken } from "~/utils/auth";
import { signupUser } from "~/api/auth";
import { Button } from "~/components/ui/button";
// import { getInputClass } from "~/routes/user/utils";
import { HuddleUpLogo } from "~/components/huddleup-logo";

export default function SignupPage({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const navigate = useNavigate();
  const isSubmitting = navigation.state === "submitting";

  const signupError =
    actionData?.status === 400 && "error" in actionData
      ? actionData.error
      : null;
  const formErrors =
    actionData?.status === 400 && "errors" in actionData
      ? actionData.errors
      : null;

  return (
    <main className="grid h-screen w-screen place-items-center p-8">
      <section className="w-full max-w-md space-y-6">
        {/* Header */}
        <div>
          <span className="text-green-700">
            <HuddleUpLogo />
          </span>
          <p className="mt-4 text-muted-foreground">
            Create an account to get started.
          </p>
        </div>

        {/* Tabs - Login or signup */}
        <Tabs value="signup" className="w-full">
          <TabsList className="grid grid-cols-2 rounded-xl bg-stone-200">
            <TabsTrigger
              value="login"
              className="rounded-xl"
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
            >
              Log in
            </TabsTrigger>
            <TabsTrigger value="signup" className="rounded-xl">
              Create account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signup" className="pt-6">
            <Form method="post" action="/signup" className="space-y-6" replace>
              {signupError !== null && (
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
                  <span>{signupError !== null ? signupError : ""}</span>
                </div>
              )}

              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="Enter your first name"
                  className={getInputClass("")}
                />
                {formErrors !== null && "firstName" in formErrors && (
                  <p className="text-sm text-red-600">{formErrors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Enter your last name"
                  className={getInputClass("")}
                />
                {formErrors !== null && "lastName" in formErrors && (
                  <p className="text-sm text-red-600">{formErrors.lastName}</p>
                )}
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
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

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className={getInputClass("")}
                />
                {formErrors !== null && "email" in formErrors && (
                  <p className="text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  className={getInputClass("")}
                />
                {formErrors !== null && "password" in formErrors && (
                  <p className="text-sm text-red-600">{formErrors.password}</p>
                )}
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
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Sign Up</span>
                )}
              </Button>
            </Form>
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const formErrors: Record<string, string> = {};
  let hasFormErrors = false;

  // Validate required fields
  const firstName = formData.get("firstName");
  if (firstName === null || firstName.toString().trim() === "") {
    formErrors.firstName = "First name is required";
    hasFormErrors = true;
  }

  const username = formData.get("username");
  if (username === null || username.toString().trim() === "") {
    formErrors.username = "Username is required";
    hasFormErrors = true;
  }

  const email = formData.get("email");
  if (email === null || email.toString().trim() === "") {
    formErrors.email = "Email is required";
    hasFormErrors = true;
  } else {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.toString())) {
      formErrors.email = "Please enter a valid email address";
      hasFormErrors = true;
    }
  }

  const password = formData.get("password");
  if (password === null || password.toString().trim() === "") {
    formErrors.password = "Password is required";
    hasFormErrors = true;
  }

  if (hasFormErrors) {
    return data(
      { ok: false, status: 400 as const, errors: formErrors },
      { status: 400 }
    );
  }

  // Build the signup payload
  // Note: Backend requires birthDate and address, so we send default values
  const lastName = formData.get("lastName")?.toString() ?? "";

  // Default birthDate (2000-01-01) - backend requires this field
  const defaultBirthDate = "2000-01-01";

  // Default address - backend requires this field
  const defaultAddress = {
    streetLine1: "",
    streetLine2: "",
    town: "",
    state: "",
    zipcode: "",
  };

  const signupPayload = {
    firstName: firstName!.toString().trim(),
    lastName: lastName.trim(),
    username: username!.toString().trim(),
    email: email!.toString().trim(),
    password: password!.toString(),
    birthDate: defaultBirthDate,
    address: defaultAddress,
  };

  const result = await signupUser(signupPayload);

  if (!result.ok) {
    // Parse error response
    let errorMessage = "An error occurred during signup";
    try {
      const errorData = await result.json();
      // Backend returns AppError with code and message
      if (errorData.code === "USERNAME_OR_EMAIL_TAKEN") {
        errorMessage = "Username or email is already taken";
      } else if (errorData.code === "INVALID_USER_FIELD") {
        errorMessage = errorData.message || "Invalid user information provided";
      } else {
        errorMessage = errorData.message || errorMessage;
      }
    } catch {
      // If JSON parsing fails, use default message
    }

    return data(
      {
        ok: false,
        status: 400 as const,
        error: errorMessage,
      },
      { status: 400 }
    );
  }

  const { token } = await result.json();
  return data({ ok: true, status: 201 as const, token }, { status: 201 });
}

export async function clientAction({ serverAction }: Route.ClientActionArgs) {
  const response = await serverAction();
  if (response.status === 201) {
    setAuthToken(response.token);
    throw redirect("/");
  } else {
    return response;
  }
}
