import { createCookie } from "@remix-run/node";

export const userLoggedIn = createCookie("userLoggedIn", {
  maxAge: 604_800,
});
