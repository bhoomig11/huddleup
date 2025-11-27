import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "~/components/ui/tabs";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";

import { data, Form, redirect, useNavigate, useNavigation } from "react-router";
import type { Route } from "./+types/signup";
import { setAuthToken } from "~/utils/auth";
import { signupUser } from "~/api/auth";
import { Button } from "~/components/ui/button";

export default function SignupPage({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const navigate = useNavigate();
  const isSubmitting = navigation.state === "submitting";

  const signupError = actionData?.status === 400 && "error" in actionData ? actionData.error : null;
  const formErrors = actionData?.status === 400 && "errors" in actionData ? actionData.errors : null;

  return (
    <main className="grid h-screen w-screen place-items-center p-8">
      <section className="w-full max-w-md space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-semibold text-green-500">HuddleUp</h1>
          <p className="text-muted-foreground mt-4">
            Create an account to get started.
          </p>
        </div>

        {/* Tabs - Login or signup */}
        <Tabs value="signup" className="w-full">
          <TabsList className="grid grid-cols-2 rounded-xl bg-muted">
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
            <Form
              method="post"
              action="/signup"
              className="space-y-6"
              replace
            >
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
                />
                {formErrors !== null && "password" in formErrors && (
                  <p className="text-sm text-red-600">{formErrors.password}</p>
                )}
              </div>

              {/* Birth Date */}
              <div className="space-y-2">
                <Label htmlFor="birthDate">Birth Date *</Label>
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                />
                {formErrors !== null && "birthDate" in formErrors && (
                  <p className="text-sm text-red-600">{formErrors.birthDate}</p>
                )}
              </div>

              {/* Address Section */}
              <div className="space-y-4 rounded-md border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-800">Address</h3>

                {/* Street Line 1 */}
                <div className="space-y-2">
                  <Label htmlFor="streetLine1">Street Address *</Label>
                  <Input
                    id="streetLine1"
                    name="streetLine1"
                    placeholder="Enter street address"
                  />
                  {formErrors !== null && "streetLine1" in formErrors && (
                    <p className="text-sm text-red-600">{formErrors.streetLine1}</p>
                  )}
                </div>

                {/* Street Line 2 */}
                <div className="space-y-2">
                  <Label htmlFor="streetLine2">Apartment, suite, etc.</Label>
                  <Input
                    id="streetLine2"
                    name="streetLine2"
                    placeholder="Enter apartment or suite (optional)"
                  />
                  {formErrors !== null && "streetLine2" in formErrors && (
                    <p className="text-sm text-red-600">{formErrors.streetLine2}</p>
                  )}
                </div>

                {/* Town */}
                <div className="space-y-2">
                  <Label htmlFor="town">City/Town *</Label>
                  <Input
                    id="town"
                    name="town"
                    placeholder="Enter city or town"
                  />
                  {formErrors !== null && "town" in formErrors && (
                    <p className="text-sm text-red-600">{formErrors.town}</p>
                  )}
                </div>

                {/* State */}
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="Enter 2-letter state code (e.g., MA)"
                    maxLength={2}
                  />
                  {formErrors !== null && "state" in formErrors && (
                    <p className="text-sm text-red-600">{formErrors.state}</p>
                  )}
                </div>

                {/* Zipcode */}
                <div className="space-y-2">
                  <Label htmlFor="zipcode">ZIP Code *</Label>
                  <Input
                    id="zipcode"
                    name="zipcode"
                    placeholder="Enter 5-digit ZIP code"
                    maxLength={5}
                  />
                  {formErrors !== null && "zipcode" in formErrors && (
                    <p className="text-sm text-red-600">{formErrors.zipcode}</p>
                  )}
                </div>
              </div>

              {/* Submit button */}
              <Button 
                type="submit" 
                className="w-full h-11 text-base bg-green-500"
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

  const birthDate = formData.get("birthDate");
  if (birthDate === null || birthDate.toString().trim() === "") {
    formErrors.birthDate = "Birth date is required";
    hasFormErrors = true;
  }

  const streetLine1 = formData.get("streetLine1");
  if (streetLine1 === null || streetLine1.toString().trim() === "") {
    formErrors.streetLine1 = "Street address is required";
    hasFormErrors = true;
  }

  const town = formData.get("town");
  if (town === null || town.toString().trim() === "") {
    formErrors.town = "City/Town is required";
    hasFormErrors = true;
  }

  const state = formData.get("state");
  if (state === null || state.toString().trim() === "") {
    formErrors.state = "State is required";
    hasFormErrors = true;
  } else if (state.toString().trim().length !== 2) {
    formErrors.state = "State must be a 2-letter code";
    hasFormErrors = true;
  }

  const zipcode = formData.get("zipcode");
  if (zipcode === null || zipcode.toString().trim() === "") {
    formErrors.zipcode = "ZIP code is required";
    hasFormErrors = true;
  } else if (zipcode.toString().trim().length !== 5) {
    formErrors.zipcode = "ZIP code must be 5 digits";
    hasFormErrors = true;
  }

  if (hasFormErrors) {
    return data(
      { ok: false, status: 400 as const, errors: formErrors },
      { status: 400 }
    );
  }

  // Build the signup payload
  const lastName = formData.get("lastName")?.toString() ?? "";
  const streetLine2 = formData.get("streetLine2")?.toString() ?? "";

  const signupPayload = {
    firstName: firstName!.toString().trim(),
    lastName: lastName.trim(),
    username: username!.toString().trim(),
    email: email!.toString().trim(),
    password: password!.toString(),
    birthDate: birthDate!.toString(),
    address: {
      streetLine1: streetLine1!.toString().trim(),
      streetLine2: streetLine2.trim(),
      town: town!.toString().trim(),
      state: state!.toString().trim().toUpperCase(),
      zipcode: zipcode!.toString().trim(),
    },
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

