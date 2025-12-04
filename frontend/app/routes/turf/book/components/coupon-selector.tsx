import { useState, useEffect, useMemo } from "react";
import { useFetcher } from "react-router";
import { useSearchParams } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Tag, Loader2 } from "lucide-react";
import type { CouponSummary } from "~/api/coupon";
import type { clientLoader } from "~/routes/coupons";

interface CouponSelectorProps {
  onCouponChange?: (coupon: CouponSummary | null) => void;
}

export function CouponSelector({ onCouponChange }: CouponSelectorProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const fetcher = useFetcher<typeof clientLoader>();
  const [couponCode, setCouponCode] = useState("");
  const [openCouponDialog, setOpenCouponDialog] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Fetch coupons on mount
  useEffect(() => {
    fetcher.load("/coupons");
  }, []);

  const coupons = fetcher.data || [];
  const isLoading = fetcher.state !== "idle";

  // Get selected coupon from query params
  const selectedCouponId = useMemo(() => {
    const couponIdParam = searchParams.get("couponId");
    if (!couponIdParam) return null;
    const couponId = Number.parseInt(couponIdParam, 10);
    return Number.isNaN(couponId) ? null : couponId;
  }, [searchParams]);

  const selectedCoupon = useMemo(() => {
    if (!selectedCouponId || coupons.length === 0) return null;
    return coupons.find((c) => c.couponId === selectedCouponId) ?? null;
  }, [coupons, selectedCouponId]);

  // Notify parent of coupon changes
  useEffect(() => {
    if (onCouponChange) {
      onCouponChange(selectedCoupon);
    }
  }, [selectedCoupon, onCouponChange]);

  const updateSearchParams = (couponId: number | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (couponId) {
      newParams.set("couponId", couponId.toString());
    } else {
      newParams.delete("couponId");
    }
    setSearchParams(newParams, { preventScrollReset: true, replace: true });
  };

  const handleApplyCoupon = (codeOrCoupon: string | CouponSummary) => {
    setValidationError(null);

    let coupon: CouponSummary | undefined;

    if (typeof codeOrCoupon === "string") {
      // Validate against fetched coupons
      const normalizedCode = codeOrCoupon.trim().toUpperCase();
      coupon = coupons.find(
        (c) => c.couponCode.toUpperCase() === normalizedCode
      );

      if (!coupon) {
        setValidationError("Invalid coupon code");
        return;
      }
    } else {
      coupon = codeOrCoupon;
    }

    if (coupon) {
      updateSearchParams(coupon.couponId);
      setCouponCode("");
      setOpenCouponDialog(false);
    }
  };

  const handleRemoveCoupon = () => {
    updateSearchParams(null);
    setCouponCode("");
    setValidationError(null);
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-stone-700">Apply Coupon</h3>
      {!selectedCoupon ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  setValidationError(null);
                }}
                className={validationError ? "border-red-500" : ""}
              />
              {validationError && (
                <p className="mt-1 text-sm text-red-600">{validationError}</p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => handleApplyCoupon(couponCode)}
              disabled={!couponCode.trim() || isLoading}
            >
              Apply
            </Button>
          </div>

          {/* Coupon List Dialog */}
          <Dialog open={openCouponDialog} onOpenChange={setOpenCouponDialog}>
            {isLoading ? (
              <span className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm text-stone-500">
                <Loader2 className="size-4 animate-spin" />
                Loading available coupons
              </span>
            ) : (
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm text-green-700 hover:bg-stone-50 hover:text-green-700"
                >
                  <Tag className="mr-1.5 size-4" />
                  <span>View available coupons</span>
                </Button>
              </DialogTrigger>
            )}
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Available Coupons</DialogTitle>
                <DialogDescription>
                  Select a coupon to apply to your booking
                </DialogDescription>
              </DialogHeader>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-stone-500">Loading coupons...</p>
                </div>
              ) : coupons.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-stone-500">No coupons available</p>
                </div>
              ) : (
                <div className="max-h-[400px] space-y-2 overflow-y-auto">
                  {coupons.map((coupon) => (
                    <button
                      key={coupon.couponId}
                      onClick={() => handleApplyCoupon(coupon)}
                      className="flex w-full items-start justify-between rounded-lg border border-stone-200 bg-white p-3 text-left transition-all hover:border-green-700 hover:bg-green-50"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-stone-700">
                          {coupon.couponCode}
                        </p>
                        <p className="text-sm text-stone-600">
                          {coupon.couponDescription}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 text-right">
                        <span className="font-bold text-green-700">
                          {coupon.discountPercent}%
                        </span>
                        <span className="text-xs text-stone-500">off</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg border-2 border-green-700 bg-green-50 p-3">
          <div className="flex items-center gap-2.5">
            <Tag className="size-5 shrink-0 text-green-700" />
            <div>
              <p className="font-medium text-green-900">
                {selectedCoupon.couponCode}
              </p>
              <p className="text-sm text-green-700">
                {selectedCoupon.discountPercent}% discount applied
              </p>
            </div>
          </div>
          <button
            onClick={handleRemoveCoupon}
            className="text-sm font-semibold text-green-700 hover:text-green-900"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
