import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("browse", "routes/turf/browse-turfs.tsx"),
  route("signup", "routes/signup.tsx"),
  layout("routes/layout.tsx", [
    // add protected routes here
  ]),
] satisfies RouteConfig;
