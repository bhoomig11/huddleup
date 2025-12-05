import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router";
import { parseISO, format } from "date-fns";
import { useDebounce } from "~/hooks/use-debounce";

type SortOption = "name" | "rating" | "price-low" | "price-high";

export function useTurfSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [date, setDate] = useState<Date | undefined>(
    searchParams.get("date") ? parseISO(searchParams.get("date")!) : undefined
  );
  const [fromTime, setFromTime] = useState<string | null>(
    searchParams.get("fromTime") || null
  );
  const [toTime, setToTime] = useState<string | null>(
    searchParams.get("toTime") || null
  );

  const [selectedSport, setSelectedSport] = useState<string | null>(
    searchParams.get("sport") || null
  );
  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");
  const [priceRange, setPriceRange] = useState<[number, number]>([
    minPriceParam ? Number(minPriceParam) : 0,
    maxPriceParam ? Number(maxPriceParam) : 1000,
  ]);
  const [minRating, setMinRating] = useState<number | null>(
    searchParams.get("minRating") ? Number(searchParams.get("minRating")) : null
  );
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get("sort") as SortOption) || "name"
  );

  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(() => {
    const features = searchParams.getAll("features");
    // Decode feature names from URL
    return new Set(features.map((f) => decodeURIComponent(f)));
  });

  const handleDateChange = useCallback((newDate: Date | undefined) => {
    setDate(newDate);
  }, []);

  const handleFromTimeChange = useCallback((newTime: string | null) => {
    setFromTime(newTime);
    setToTime(null);
  }, []);

  const handleToTimeChange = useCallback((newTime: string | null) => {
    setToTime(newTime);
  }, []);

  const handleSportChange = useCallback(
    (sport: string | null) => {
      setSelectedSport(sport);
      setSearchParams(
        (prevParams) => {
          const params = new URLSearchParams(prevParams);
          if (sport) {
            params.set("sport", sport);
          } else {
            params.delete("sport");
          }
          return params;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  // Debounced price range for filtering and URL updates
  const debouncedPriceRange = useDebounce(priceRange, 200);

  // Update URL when debounced value changes
  useEffect(() => {
    setSearchParams(
      (prevParams) => {
        const params = new URLSearchParams(prevParams);
        const currentMinPrice = prevParams.get("minPrice");
        const currentMaxPrice = prevParams.get("maxPrice");
        const urlMinPrice = currentMinPrice ? Number(currentMinPrice) : 0;
        const urlMaxPrice = currentMaxPrice ? Number(currentMaxPrice) : 1000;

        // Only update if the debounced value differs from URL
        if (
          debouncedPriceRange[0] !== urlMinPrice ||
          debouncedPriceRange[1] !== urlMaxPrice
        ) {
          if (debouncedPriceRange[0] > 0) {
            params.set("minPrice", debouncedPriceRange[0].toString());
          } else {
            params.delete("minPrice");
          }
          if (debouncedPriceRange[1] < 1000) {
            params.set("maxPrice", debouncedPriceRange[1].toString());
          } else {
            params.delete("maxPrice");
          }
          return params;
        }
        return prevParams;
      },
      { replace: true }
    );
  }, [debouncedPriceRange, setSearchParams]);

  const handlePriceRangeChange = useCallback((range: [number, number]) => {
    // Update state immediately for responsive UI
    setPriceRange(range);
  }, []);

  const handleMinRatingChange = useCallback(
    (rating: number | null) => {
      setMinRating(rating);
      setSearchParams(
        (prevParams) => {
          const params = new URLSearchParams(prevParams);
          if (rating !== null) {
            params.set("minRating", rating.toString());
          } else {
            params.delete("minRating");
          }
          return params;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const handleSortChange = useCallback(
    (sort: SortOption) => {
      setSortBy(sort);
      setSearchParams(
        (prevParams) => {
          const params = new URLSearchParams(prevParams);
          if (sort !== "name") {
            params.set("sort", sort);
          } else {
            params.delete("sort");
          }
          return params;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set("q", query.trim());
    }
    if (date) {
      params.set("date", format(date, "yyyy-MM-dd"));
    }
    if (fromTime) {
      params.set("fromTime", fromTime);
    }
    if (toTime) {
      params.set("toTime", toTime);
    }

    if (selectedSport) {
      params.set("sport", selectedSport);
    }
    if (priceRange[0] > 0) {
      params.set("minPrice", priceRange[0].toString());
    }
    if (priceRange[1] < 1000) {
      params.set("maxPrice", priceRange[1].toString());
    }
    if (minRating !== null) {
      params.set("minRating", minRating.toString());
    }
    if (sortBy !== "name") {
      params.set("sort", sortBy);
    }
    setSearchParams(params);
  }, [
    query,
    date,
    fromTime,
    toTime,
    selectedSport,
    priceRange,
    minRating,
    sortBy,
    setSearchParams,
  ]);

  const handleFeatureToggle = useCallback(
    (featureName: string) => {
      setSelectedFeatures((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(featureName)) {
          newSet.delete(featureName);
        } else {
          newSet.add(featureName);
        }

        // Update URL params using multiple values with same key
        setSearchParams(
          (prevParams) => {
            const params = new URLSearchParams(prevParams);
            // Remove all existing feature params
            params.delete("features");
            // Add all selected features as separate params (URL encoded)
            if (newSet.size > 0) {
              Array.from(newSet).forEach((feature) => {
                params.append("features", encodeURIComponent(feature));
              });
            }
            return params;
          },
          { replace: true }
        );

        return newSet;
      });
    },
    [setSearchParams]
  );

  // Sync selectedFeatures with URL params when they change externally
  useEffect(() => {
    const features = searchParams.getAll("features");
    // Decode feature names from URL
    setSelectedFeatures(new Set(features.map((f) => decodeURIComponent(f))));
  }, [searchParams]);

  const clearFilters = useCallback(() => {
    handleSportChange(null);
    handleMinRatingChange(null);
    setSelectedFeatures(new Set());
    setSearchParams(
      (prevParams) => {
        const params = new URLSearchParams(prevParams);
        params.delete("features");
        return params;
      },
      { replace: true }
    );
  }, [handleSportChange, handleMinRatingChange, setSearchParams]);

  return {
    query,
    setQuery,
    date,
    handleDateChange,
    fromTime,
    handleFromTimeChange,
    toTime,
    handleToTimeChange,
    handleSearch,
    selectedSport,
    handleSportChange,
    priceRange,
    handlePriceRangeChange,
    debouncedPriceRange,
    minRating,
    handleMinRatingChange,
    sortBy,
    handleSortChange,
    selectedFeatures,
    handleFeatureToggle,
    clearFilters,
  };
}
