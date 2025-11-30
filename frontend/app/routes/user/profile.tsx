import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useParams, redirect, data, useRevalidator, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { UpdatePasswordDialog } from "~/routes/user/components/update-password";
import { ProfileSidebar } from "~/routes/user/components/profile-sidebar";
import { getInputClass, handleAlphabeticInput, handleNumericInput } from "~/routes/user/utils";
import { getUserProfile, updateUsername } from "~/api/user";
import { setAuthToken } from "~/utils/auth";
import type { UserProfile } from "~/types/user";
import type { Route } from "./+types/profile";

// Form schema using Zod
const profileFormSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  birthDate: z.string().nullable(),
  address: z.object({
    streetLine1: z.string().min(1, "Address line 1 is required"),
    streetLine2: z.string().optional(),
    town: z.string().min(1, "Town is required"),
    state: z.string().length(2, "State must be 2 characters"),
    zipcode: z.string().length(5, "ZIP code must be 5 characters"),
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Helper to convert UserProfile from backend to form values
function userProfileToFormValues(profile: UserProfile): ProfileFormValues {
  return {
    username: profile.username,
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName || "",
    birthDate: profile.birthDate || null,
    address: {
      streetLine1: profile.address.streetLine1,
      streetLine2: profile.address.streetLine2 || "",
      town: profile.address.town,
      state: profile.address.state,
      zipcode: profile.address.zipcode,
    },
  };
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const username = params.username;
  if (!username) {
    throw redirect("/login");
  }

  const response = await getUserProfile(username);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw data(
      errorData.message || "Error fetching user profile",
      { status: response.status }
    );
  }

  const profile = (await response.json()) as UserProfile;
  return profile;
}

export default function UserProfilePage({
  loaderData: profile,
}: Route.ComponentProps) {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: userProfileToFormValues(profile),
  });

  // Update form when profile data changes
  useEffect(() => {
    form.reset(userProfileToFormValues(profile));
    setUsernameError(null);
  }, [profile]);

  const isDirty = form.formState.isDirty;
  const currentUsername = form.watch("username");
  const originalUsername = profile.username;
  const isUsernameChanged = currentUsername !== originalUsername;

  const handleSaveUsername = async () => {
    if (!username || !isUsernameChanged) {
      setIsEditingUsername(false);
      return;
    }

    setIsSavingUsername(true);
    setUsernameError(null);

    try {
      const response = await updateUsername(username, currentUsername);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setUsernameError(
          errorData.message || "Failed to update username"
        );
        return;
      }

      // Extract and store the new JWT token from the response
      const authResponse = await response.json() as { token: string };
      setAuthToken(authResponse.token);

      // Success: close edit mode and refresh profile data
      setIsEditingUsername(false);
      // If username changed, navigate to new profile URL
      if (currentUsername !== username) {
        navigate(`/user/${currentUsername}/profile`, { replace: true });
      } else {
        revalidator.revalidate();
      }
    } catch (error) {
      setUsernameError(
        error instanceof Error ? error.message : "Failed to update username"
      );
    } finally {
      setIsSavingUsername(false);
    }
  };

  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="flex flex-row w-full max-w-7xl mx-auto">
        {/* ---------------- LEFT PANEL ---------------- */}
        <ProfileSidebar />

        {/* ---------------- RIGHT PANEL ---------------- */}
        <div className="basis-3/4 min-h-screen p-10">
          {/* ----------- USER DETAILS PANEL ----------- */}
          <form 
            className="space-y-6 max-w-xl"
            onSubmit={(e) => {
              e.preventDefault();
              // TODO: Handle form submission for profile update
            }}
          >
            {/* Username */}
            <div>
              <Label className="block text-sm text-stone-600 font-medium mb-1">
                Username
              </Label>
              <div className="flex gap-2">
                <Controller
                  name="username"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div className="flex-1">
                      <Input
                        {...field}
                        className={getInputClass(field.value as string)}
                        disabled={!isEditingUsername || isSavingUsername}
                        aria-invalid={fieldState.invalid}
                      />
                      {usernameError && (
                        <p className="text-sm text-red-600 mt-1">{usernameError}</p>
                      )}
                    </div>
                  )}
                />
                {!isEditingUsername ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded font-semibold text-green-700"
                    onClick={() => {
                      setIsEditingUsername(true);
                      setUsernameError(null);
                    }}
                  >
                    Edit
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSaveUsername}
                    disabled={!isUsernameChanged || isSavingUsername}
                  >
                    {isSavingUsername ? "Saving..." : "Save"}
                  </Button>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <Label className="block text-sm text-stone-600 font-medium mb-1">
                Email
              </Label>
              <div className="flex gap-2">
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      type="email"
                      className={getInputClass(field.value as string)}
                      disabled={!isEditingEmail}
                      aria-invalid={fieldState.invalid}
                    />
                  )}
                />
                {!isEditingEmail ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded font-semibold text-stone-600 text-green-700"
                    onClick={() => setIsEditingEmail(true)}
                  >
                    Edit
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => {
                      // TODO: Add save functionality - API call to update email
                      setIsEditingEmail(false);
                    }}
                  >
                    Save
                  </Button>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <Label className="block text-sm text-stone-600 font-medium mb-1">
                Password
              </Label>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="********"
                  disabled
                  className={getInputClass("**********")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded font-semibold text-stone-600 text-green-700"
                  onClick={() => setIsPasswordDialogOpen(true)}
                >
                  Edit
                </Button>
              </div>
            </div>

            <Separator />

            {/* First Name */}
            <div>
              <Label className="block text-sm text-stone-600 font-medium mb-1">
                First Name
              </Label>
              <Controller
                name="firstName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    placeholder="First Name"
                    className={getInputClass(field.value as string)}
                    aria-invalid={fieldState.invalid}
                  />
                )}
              />
            </div>

            {/* Last Name */}
            <div>
              <Label className="block text-sm text-stone-600 font-medium mb-1">
                Last Name
              </Label>
              <Controller
                name="lastName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    placeholder="Last Name"
                    className={getInputClass(field.value || "")}
                    aria-invalid={fieldState.invalid}
                  />
                )}
              />
            </div>

            {/* Birth Date */}
            <div>
              <Label className="block text-sm text-stone-600 font-medium mb-1">
                Birth Date
              </Label>
              <Controller
                name="birthDate"
                control={form.control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild className="bg-slate-50">
                      <Button
                        type="button"
                        variant="outline"
                        data-empty={!field.value}
                        className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(new Date(field.value), "MM/dd/yyyy")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-slate-50">
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(date) => {
                          if (date) {
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(
                              2,
                              "0"
                            );
                            const day = String(date.getDate()).padStart(2, "0");
                            field.onChange(`${year}-${month}-${day}`);
                          } else {
                            field.onChange(null);
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>

            {/* Address Line 1 */}
            <div>
              <Label className="block text-sm text-stone-600 font-medium mb-1">
                Address Line 1
              </Label>
              <Controller
                name="address.streetLine1"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    placeholder="Address Line 1"
                    className={getInputClass(field.value as string)}
                    aria-invalid={fieldState.invalid}
                  />
                )}
              />
            </div>

            {/* Address Line 2 */}
            <div>
              <Label className="block text-sm text-stone-600 font-medium mb-1">
                Address Line 2
              </Label>
              <Controller
                name="address.streetLine2"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    placeholder="Address Line 2"
                    className={getInputClass(field.value || "")}
                    aria-invalid={fieldState.invalid}
                  />
                )}
              />
            </div>

            {/* Town, State, ZIP */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Label className="block text-sm text-stone-600 font-medium mb-1">
                  Town
                </Label>
                <Controller
                  name="address.town"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      placeholder="Town"
                      className={getInputClass(field.value as string)}
                      aria-invalid={fieldState.invalid}
                    />
                  )}
                />
              </div>
              <div className="flex-1">
                <Label className="block text-sm text-stone-600 font-medium mb-1">
                  State
                </Label>
                <Controller
                  name="address.state"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      placeholder="State"
                      maxLength={2}
                      className={getInputClass(field.value as string)}
                      aria-invalid={fieldState.invalid}
                      onChange={(e) =>
                        field.onChange(handleAlphabeticInput(e.target.value))
                      }
                    />
                  )}
                />
              </div>
              <div className="flex-1">
                <Label className="block text-sm text-stone-600 font-medium mb-1">
                  ZIP Code
                </Label>
                <Controller
                  name="address.zipcode"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      placeholder="ZIP"
                      maxLength={5}
                      className={getInputClass(field.value as string)}
                      aria-invalid={fieldState.invalid}
                      onChange={(e) =>
                        field.onChange(handleNumericInput(e.target.value))
                      }
                    />
                  )}
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                className="rounded bg-black text-white hover:bg-red-600 active:bg-red-700"
              >
                Delete
              </Button>
              <Button
                type="submit"
                disabled={!isDirty}
                className="rounded bg-green-700 text-white hover:bg-green-600 active:bg-green-700"
              >
                Save
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Update Password Dialog */}
      <UpdatePasswordDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      />
    </main>
  );
}
