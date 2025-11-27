import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  layout("routes/layout.tsx", [
    // add protected routes here
  ]),
  route("browse", "routes/turf/browse-turfs.tsx"),
] satisfies RouteConfig;
