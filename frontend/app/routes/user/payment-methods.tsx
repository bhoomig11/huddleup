import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { AddCardDialog } from "~/routes/user/components/add-card";
import { ProfileSidebar } from "~/routes/user/components/profile-sidebar";
import { useState } from "react";

export default function PaymentMethodsPage() {
  const [isAddCardDialogOpen, setIsAddCardDialogOpen] = useState(false);

  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="flex flex-row w-full max-w-7xl mx-auto">
        {/* ---------------- LEFT PANEL ---------------- */}
        <ProfileSidebar />

        {/* ---------------- RIGHT PANEL ---------------- */}
        <div className="basis-3/4 min-h-screen p-10">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Saved Cards</h2>

            {[1, 2].map((card) => (
              <Card key={card} className="p-4">
                <CardContent className="space-y-1">
                  <p className="font-medium text-gray-500">Name on Card: John Doe</p>
                  <p className="text-gray-500">Card Number: **** **** **** 4242</p>
                  <p className="text-gray-500">Expiry: 12/26</p>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      className="bg-black text-white hover:bg-red-600 active:bg-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-end">
              <Button onClick={() => setIsAddCardDialogOpen(true)}>
                Add Payment Method
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Card Dialog */}
      <AddCardDialog
        open={isAddCardDialogOpen}
        onOpenChange={setIsAddCardDialogOpen}
      />
    </main>
  );
}

