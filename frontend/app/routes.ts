import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),

  route("signup", "routes/signup.tsx"),
  layout("routes/layout.tsx", [
    // user routes
    route("user/:username/profile", "routes/user/profile.tsx"),
    route("user/:username/booking", "routes/user/previous-bookings.tsx"),
    route("user/:username/cards", "routes/user/payment-methods.tsx"),

    // turf routes
    ...prefix("turf", [
      route("browse", "routes/turf/browse-turfs.tsx"),
      route(":turfId", "routes/turf/turf-detail.tsx"),
      layout("routes/turf/book/layout.tsx", [
        route(
          ":turfId/available-start-times",
          "routes/turf/available-start-times.tsx"
        ),
        route(
          ":turfId/available-end-times",
          "routes/turf/available-end-times.tsx"
        ),
        route(":turfId/book", "routes/turf/book/index.tsx"),
        route(
          ":turfId/book/step-select-slot",
          "routes/turf/book/step-select-slot.tsx"
        ),
        route(
          ":turfId/book/step-select-card",
          "routes/turf/book/step-select-card.tsx"
        ),
        route(":turfId/book/step-3", "routes/turf/book/step-3.tsx"),
        route(":turfId/book/confirmation", "routes/turf/book/confirmation.tsx"),
        route(":turfId/book/conflict", "routes/turf/book/conflict.tsx"),
      ]),
    ]),
  ]),
] satisfies RouteConfig;
