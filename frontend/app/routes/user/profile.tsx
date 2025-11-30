import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useParams,
  redirect,
  data,
  useRevalidator,
  useNavigate,
} from "react-router";
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
import {
  getInputClass,
  handleAlphabeticInput,
  handleNumericInput,
} from "~/routes/user/utils";
import {
  getUserProfile,
  updateUsername,
  updateEmail,
  updateUserProfile,
} from "~/api/user";
import { setAuthToken } from "~/utils/auth";
import type { UserProfile } from "~/types/user";
import type { Route } from "./+types/profile";

// Form schema using Zod
// Note: address is always an object in the form (never null) for easier form handling
// When saving, if all address fields are empty, we send null to the backend
// Address fields allow empty strings since address can be null
const profileFormSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  birthDate: z.string().nullable(),
  address: z.object({
    streetLine1: z.string(),
    streetLine2: z.string().optional(),
    town: z.string(),
    state: z.string(),
    zipcode: z.string(),
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Helper to convert UserProfile from backend to form values
function userProfileToFormValues(profile: any): ProfileFormValues {
  return {
    username: profile.username ?? "",
    email: profile.email ?? "",
    firstName: profile.firstName ?? "",
    lastName: profile.lastName ?? "",
    birthDate: profile.birthDate ?? null,
    address: {
      streetLine1: profile.address?.streetLine1 ?? "",
      streetLine2: profile.address?.streetLine2 ?? "",
      town: profile.address?.town ?? "",
      state: profile.address?.state ?? "",
      zipcode: profile.address?.zipcode ?? "",
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
    throw data(errorData.message || "Error fetching user profile", {
      status: response.status,
    });
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
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: userProfileToFormValues(profile) as ProfileFormValues,
  });

  // Update form when profile data changes
  useEffect(() => {
    form.reset(userProfileToFormValues(profile));
    setUsernameError(null);
    setEmailError(null);
    setProfileError(null);
  }, [profile]);

  const isDirty = form.formState.isDirty;
  const currentUsername = form.watch("username");
  const originalUsername = profile.username;
  const isUsernameChanged = currentUsername !== originalUsername;
  const currentEmail = form.watch("email");
  const originalEmail = profile.email;
  const isEmailChanged = currentEmail !== originalEmail;

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
        setUsernameError(errorData.message || "Failed to update username");
        return;
      }

      // Extract and store the new JWT token from the response
      const authResponse = (await response.json()) as { token: string };
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

  const handleSaveEmail = async () => {
    if (!username || !isEmailChanged) {
      setIsEditingEmail(false);
      return;
    }

    setIsSavingEmail(true);
    setEmailError(null);

    try {
      const response = await updateEmail(username, currentEmail);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setEmailError(errorData.message || "Failed to update email");
        return;
      }

      // Success: close edit mode and refresh profile data
      setIsEditingEmail(false);
      revalidator.revalidate();
    } catch (error) {
      setEmailError(
        error instanceof Error ? error.message : "Failed to update email"
      );
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleSaveProfile = async (data: ProfileFormValues) => {
    if (!username) {
      return;
    }

    setIsSavingProfile(true);
    setProfileError(null);

    try {
      // Check if address fields are all empty - if so, send null
      const hasAddress =
        data.address &&
        (data.address.streetLine1.trim() !== "" ||
          data.address.town.trim() !== "" ||
          data.address.state.trim() !== "" ||
          data.address.zipcode.trim() !== "");

      const response = await updateUserProfile(username, {
        firstName: data.firstName,
        lastName: data.lastName || null,
        birthDate: data.birthDate || null,
        address:
          hasAddress && data.address
            ? {
                streetLine1: data.address.streetLine1,
                streetLine2: data.address.streetLine2 || null,
                town: data.address.town,
                state: data.address.state,
                zipcode: data.address.zipcode,
              }
            : null,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setProfileError(errorData.message || "Failed to update profile");
        return;
      }

      // Success: refresh profile data
      revalidator.revalidate();
      // Reset form dirty state
      form.reset(data);
    } catch (error) {
      setProfileError(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-row">
        {/* ---------------- LEFT PANEL ---------------- */}
        <ProfileSidebar />

        {/* ---------------- RIGHT PANEL ---------------- */}
        <div className="min-h-screen basis-3/4 p-10">
          {/* ----------- USER DETAILS PANEL ----------- */}
          <form
            className="max-w-xl space-y-6"
            onSubmit={form.handleSubmit(handleSaveProfile as (data: ProfileFormValues) => Promise<void>)}
          >
            {/* Username */}
            <div>
              <Label className="mb-1 block text-sm font-medium text-stone-600">
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
                        <p className="mt-1 text-sm text-red-600">
                          {usernameError}
                        </p>
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
              <Label className="mb-1 block text-sm font-medium text-stone-600">
                Email
              </Label>
              <div className="flex gap-2">
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div className="flex-1">
                      <Input
                        {...field}
                        type="email"
                        className={getInputClass(field.value as string)}
                        disabled={!isEditingEmail || isSavingEmail}
                        aria-invalid={fieldState.invalid}
                      />
                      {emailError && (
                        <p className="mt-1 text-sm text-red-600">
                          {emailError}
                        </p>
                      )}
                    </div>
                  )}
                />
                {!isEditingEmail ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded font-semibold text-green-700"
                    onClick={() => {
                      setIsEditingEmail(true);
                      setEmailError(null);
                    }}
                  >
                    Edit
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSaveEmail}
                    disabled={!isEmailChanged || isSavingEmail}
                  >
                    {isSavingEmail ? "Saving..." : "Save"}
                  </Button>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <Label className="mb-1 block text-sm font-medium text-stone-600">
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
                  className="rounded font-semibold text-green-700"
                  onClick={() => setIsPasswordDialogOpen(true)}
                >
                  Edit
                </Button>
              </div>
            </div>

            <Separator />

            {/* First Name */}
            <div>
              <Label className="mb-1 block text-sm font-medium text-stone-600">
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
              <Label className="mb-1 block text-sm font-medium text-stone-600">
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
              <Label className="mb-1 block text-sm font-medium text-stone-600">
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
                        className="w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(new Date(field.value), "MM/dd/yyyy")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto bg-slate-50 p-0">
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
              <Label className="mb-1 block text-sm font-medium text-stone-600">
                Address Line 1
              </Label>
              <Controller
                name="address.streetLine1"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Address Line 1"
                    className={getInputClass(field.value ?? "")}
                    aria-invalid={fieldState.error ? true : false}
                  />
                )}
              />
            </div>

            {/* Address Line 2 */}
            <div>
              <Label className="mb-1 block text-sm font-medium text-stone-600">
                Address Line 2
              </Label>
              <Controller
                name="address.streetLine2"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Address Line 2"
                    className={getInputClass(field.value ?? "")}
                    aria-invalid={fieldState.error ? true : false}
                  />
                )}
              />
            </div>

            {/* Town, State, ZIP */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Label className="mb-1 block text-sm font-medium text-stone-600">
                  Town
                </Label>
                <Controller
                  name="address.town"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Town"
                      className={getInputClass(field.value ?? "")}
                      aria-invalid={fieldState.error ? true : false}
                    />
                  )}
                />
              </div>
              <div className="flex-1">
                <Label className="mb-1 block text-sm font-medium text-stone-600">
                  State
                </Label>
                <Controller
                  name="address.state"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="State"
                      maxLength={2}
                      className={getInputClass(field.value ?? "")}
                      aria-invalid={fieldState.error ? true : false}
                      onChange={(e) =>
                        field.onChange(handleAlphabeticInput(e.target.value))
                      }
                    />
                  )}
                />
              </div>
              <div className="flex-1">
                <Label className="mb-1 block text-sm font-medium text-stone-600">
                  ZIP Code
                </Label>
                <Controller
                  name="address.zipcode"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="ZIP"
                      maxLength={5}
                      className={getInputClass(field.value ?? "")}
                      aria-invalid={fieldState.error ? true : false}
                      onChange={(e) =>
                        field.onChange(handleNumericInput(e.target.value))
                      }
                    />
                  )}
                />
              </div>
            </div>

            {profileError && (
              <div className="pt-2">
                <p className="text-sm text-red-600">{profileError}</p>
              </div>
            )}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                className="rounded bg-black text-white hover:bg-red-600 active:bg-red-700"
              >
                Delete
              </Button>
              <Button
                type="submit"
                disabled={!isDirty || isSavingProfile}
                className="rounded bg-green-700 text-white hover:bg-green-600 active:bg-green-700"
              >
                {isSavingProfile ? "Saving..." : "Save"}
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
