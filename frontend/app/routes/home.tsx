import { useState } from "react";
import { Link } from "react-router";
import { format } from "date-fns";
import {
  Search,
  LandPlot,
  Star,
  Shield,
  Clock4,
  MapPin,
  ArrowRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group";
import { DatePicker } from "./turf/components/date-picker";
import { TimeSlotPicker } from "./turf/components/time-slot-picker";

export function meta() {
  return [
    { title: "HuddleUp" },
    {
      name: "description",
      content:
        "HuddleUp is a platform for booking your favorite sports facilities",
    },
  ];
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [fromTime, setFromTime] = useState<string | null>(null);
  const [toTime, setToTime] = useState<string | null>(null);

  const buildSearchUrl = () => {
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
    return `/turf/browse?${params.toString()}`;
  };

  // Generate standard time slots for landing page (every 30 minutes from 6 AM to 11 PM)
  const generateTimeSlots = (): string[] => {
    const slots: string[] = [];
    for (let hour = 6; hour < 24; hour++) {
      for (const minute of [0, 30]) {
        const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00`;
        slots.push(timeStr);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center bg-linear-to-br from-green-700 to-green-800 px-4 py-20">
        <div className="w-full max-w-5xl">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-5xl font-bold text-stone-50">
              Find Your Perfect Sports Facility
            </h1>
            <p className="text-xl text-stone-200">
              Book turfs, courts, and fields for your favorite sports. Search,
              compare, and book in minutes.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-col gap-4 rounded-lg border border-stone-300 bg-white p-6 shadow-lg">
              <div className="flex flex-col gap-4 sm:flex-row">
                <InputGroup className="flex-1" style={{ height: "3.5rem" }}>
                  <InputGroupInput
                    type="text"
                    className="h-14 rounded-lg px-4 py-3 text-base font-medium text-stone-600"
                    placeholder="Search by name, location, or sport"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        window.location.href = buildSearchUrl();
                      }
                    }}
                  />
                  <InputGroupAddon>
                    <Search className="size-5 text-stone-500" />
                  </InputGroupAddon>
                </InputGroup>

                <DatePicker
                  date={date}
                  onDateChange={setDate}
                  numberOfMonths={1}
                  triggerClassName="h-14 min-w-[180px] rounded-lg border-stone-300 bg-white"
                  align="start"
                />

                <TimeSlotPicker
                  fromTime={fromTime}
                  toTime={toTime}
                  onFromTimeChange={setFromTime}
                  onToTimeChange={setToTime}
                  customTimeSlots={timeSlots}
                  triggerClassName="h-14 min-w-[200px] rounded-lg border-stone-300 bg-white"
                  align="start"
                />

                <Button
                  variant="default"
                  className="h-14 rounded-lg bg-green-700 px-8 text-base font-semibold text-white hover:bg-green-600"
                  asChild
                >
                  <Link to={buildSearchUrl()}>Search</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-stone-800">
            Why Choose HuddleUp?
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-green-100 p-4">
                <MapPin className="size-8 text-green-700" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-stone-800">
                Find Nearby Facilities
              </h3>
              <p className="text-stone-600">
                Search by location to find sports facilities near you. Filter by
                sport, price, and features.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-green-100 p-4">
                <Clock4 className="size-8 text-green-700" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-stone-800">
                Easy Booking
              </h3>
              <p className="text-stone-600">
                Check availability in real-time and book your preferred time
                slot instantly. No phone calls needed.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-green-100 p-4">
                <Star className="size-8 text-green-700" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-stone-800">
                Verified Reviews
              </h3>
              <p className="text-stone-600">
                Read reviews from verified users who have actually booked and
                played at the facilities.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-green-100 p-4">
                <Shield className="size-8 text-green-700" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-stone-800">
                Secure Payments
              </h3>
              <p className="text-stone-600">
                Your payment information is secure. Book with confidence knowing
                your data is protected.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-green-100 p-4">
                <LandPlot className="size-8 text-green-700" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-stone-800">
                Multiple Sports
              </h3>
              <p className="text-stone-600">
                From soccer to basketball, tennis to cricket - find facilities
                for all your favorite sports.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-green-100 p-4">
                <CalendarIcon className="size-8 text-green-700" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-stone-800">
                Flexible Scheduling
              </h3>
              <p className="text-stone-600">
                Book up to 2 months in advance. View real-time availability and
                choose the perfect time for you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-stone-50 px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-stone-800">
            How It Works
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-green-700 text-2xl font-bold text-white">
                1
              </div>
              <h3 className="mb-2 text-xl font-semibold text-stone-800">
                Search
              </h3>
              <p className="text-stone-600">
                Enter your location, sport, or facility name. Filter by date,
                time, price, and features.
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-green-700 text-2xl font-bold text-white">
                2
              </div>
              <h3 className="mb-2 text-xl font-semibold text-stone-800">
                Compare
              </h3>
              <p className="text-stone-600">
                Browse through available facilities. Check ratings, prices, and
                features to find the perfect match.
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-green-700 text-2xl font-bold text-white">
                3
              </div>
              <h3 className="mb-2 text-xl font-semibold text-stone-800">
                Book
              </h3>
              <p className="text-stone-600">
                Select your preferred time slot and complete the booking. Get
                instant confirmation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-700 px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Ready to Get Started?
          </h2>
          <p className="mb-8 text-lg text-green-50">
            Find and book your perfect sports facility today
          </p>
          <Button
            size="lg"
            className="bg-white text-lg font-semibold text-green-700 hover:bg-green-50"
            asChild
          >
            <Link to="/turf/browse">
              Browse Facilities
              <ArrowRight className="ml-2 size-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
