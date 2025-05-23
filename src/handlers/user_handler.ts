import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { Context } from "hono";

export const handleLogin = async (c: Context) => {
  const userInfo: Object = await c.req.parseBody();
  const users = c.get("users");
  const userID: string = users.add(userInfo);

  setCookie(c, "user-ID", userID);
  return c.redirect("/", 303);
};

export const handleLogout = (c: Context) => {
  const userID = getCookie(c, "user-ID");
  c.get("users").delete(userID);
  deleteCookie(c, "user-ID");
  return c.redirect("/login.html", 303);
};
