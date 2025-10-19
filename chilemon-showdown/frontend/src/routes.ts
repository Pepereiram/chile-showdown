// src/routes.ts
export interface AppRoute {
  name: string;
  path: string;
}

export const appRoutes: AppRoute[] = [
  { name: "Home", path: "/home" },
  { name: "Team Builder", path: "/team-builder" },
  { name: "Profile", path: "/profile" },
];
