import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
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
import { getInputClass } from "~/routes/user/utils";

export default function UserProfilePage() {
  // ----- USER DETAILS FORM -----
  const [form, setForm] = useState({
    username: "user1",
    email: "user123@gmail.com",
    password: "********",
    first_name: "John",
    last_name: "Doe",
    birth_date: "2000-01-01",
    addr_street_1: "360 Huntington Ave",
    addr_street_2: "",
    addr_town: "Boston",
    addr_state: "MA",
    addr_zip_code: "02115",
  });

  const [initialForm, setInitialForm] = useState(form);
  const isChanged = JSON.stringify(form) !== JSON.stringify(initialForm);

  // Edit states for username and email
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  
  // Dialog state for update password
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="flex flex-row w-full max-w-7xl mx-auto">
        {/* ---------------- LEFT PANEL ---------------- */}
        <ProfileSidebar />

        {/* ---------------- RIGHT PANEL ---------------- */}
        <div className="basis-3/4 min-h-screen p-10">
          {/* ----------- USER DETAILS PANEL ----------- */}
          <div className="space-y-6 max-w-xl">

              {/* Username */}
              <div>
                <Label className="block text-sm font-medium mb-1">Username</Label>
                <div className="flex gap-2">
                  <Input
                    value={form.username}
                    className={getInputClass(form.username)}
                    disabled={!isEditingUsername}
                    onChange={(e) => handleChange("username", e.target.value)}
                  />
                  {!isEditingUsername ? (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditingUsername(true)}
                    >
                      Edit
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        // TODO: Add save functionality
                        setIsEditingUsername(false);
                      }}
                    >
                      Save
                    </Button>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <Label className="block text-sm font-medium mb-1">Email</Label>
                <div className="flex gap-2">
                  <Input
                    value={form.email}
                    className={getInputClass(form.email)}
                    disabled={!isEditingEmail}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                  {!isEditingEmail ? (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditingEmail(true)}
                    >
                      Edit
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        // TODO: Add save functionality
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
                <Label className="block text-sm font-medium mb-1">Password</Label>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="********"
                    value={form.password}
                    className={getInputClass(form.password)}
                    disabled
                    onChange={(e) => handleChange("password", e.target.value)}
                  />
                  <Button
                    variant="outline"
                    onClick={() => setIsPasswordDialogOpen(true)}
                  >
                    Edit
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Other fields */}
              <Label className="block text-sm font-medium mb-1">First Name</Label>
              <Input
                placeholder="First Name"
                value={form.first_name}
                className={getInputClass(form.first_name)}
                onChange={(e) => handleChange("first_name", e.target.value)}
              />

              <Label className="block text-sm font-medium mb-1">Last Name</Label>
              <Input
                placeholder="Last Name"
                value={form.last_name}
                className={getInputClass(form.last_name)}
                onChange={(e) => handleChange("last_name", e.target.value)}
              />
              
              <Label className="block text-sm font-medium mb-1">Birth Date</Label>
              <Popover>
                <PopoverTrigger asChild className="bg-slate-50">
                  <Button
                    variant="outline"
                    data-empty={!form.birth_date || form.birth_date === ""}
                    className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.birth_date ? (
                      format(new Date(form.birth_date), "MM/dd/yyyy")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-slate-50">
                  <Calendar
                    mode="single"
                    selected={
                      form.birth_date
                        ? new Date(form.birth_date)
                        : undefined
                    }
                    onSelect={(date) => {
                      if (date) {
                        // date format YYYY-MM-DD
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(
                          2,
                          "0"
                        );
                        const day = String(date.getDate()).padStart(2, "0");
                        handleChange("birth_date", `${year}-${month}-${day}`);
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
              
              <Label className="block text-sm font-medium mb-1">Address Line 1</Label>
              <Input
                placeholder="Address Line 1"
                value={form.addr_street_1}
                className={getInputClass(form.addr_street_1)}
                onChange={(e) => handleChange("addr_street_1", e.target.value)}
              />

              <Label className="block text-sm font-medium mb-1">Address Line 2</Label>
              <Input
                placeholder="Address Line 2"
                value={form.addr_street_2}
                className={getInputClass(form.addr_street_2)}
                onChange={(e) => handleChange("addr_street_2", e.target.value)}
              />

              {/* <div className="flex gap-45">
                <Label className="block text-sm font-medium">Town</Label>
                <Label className="block text-sm font-medium">State</Label>
                <Label className="block text-sm font-medium">Zipcode</Label>
              </div> */}
              <div className="flex gap-4">
                <div>
                  <Label className="block text-sm font-medium mb-1">Town</Label>
                  <Input
                    placeholder="Town"
                    value={form.addr_town}
                    className={getInputClass(form.addr_town)}
                    onChange={(e) => handleChange("addr_town", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium mb-1">State</Label>
                  <Input
                    placeholder="State"
                    maxLength={2}
                    value={form.addr_state}
                    className={getInputClass(form.addr_state)}
                    onChange={(e) => handleChange("addr_state", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium mb-1">Zipcode</Label>
                  <Input
                    placeholder="ZIP"
                    maxLength={5}
                    value={form.addr_zip_code}
                    className={getInputClass(form.addr_zip_code)}
                    onChange={(e) => handleChange("addr_zip_code", e.target.value)}
                  />
                </div>
                {/* <Input
                  placeholder="Town"
                  value={form.addr_town}
                  onChange={(e) => handleChange("addr_town", e.target.value)}
                />
                <Input
                  placeholder="State"
                  maxLength={2}
                  value={form.addr_state}
                  onChange={(e) => handleChange("addr_state", e.target.value)}
                />
                <Input 
                  placeholder="ZIP"
                  maxLength={5}
                  value={form.addr_zip_code}
                  onChange={(e) => handleChange("addr_zip_code", e.target.value)}
                /> */}
              </div>

            <div className="flex justify-between pt-4">
              <Button
                className="bg-black text-white hover:bg-red-600 active:bg-red-700"
              >
                Delete
              </Button>
              <Button disabled={!isChanged}>Save</Button>
            </div>
          </div>
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
