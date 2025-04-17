import { getCookie } from "hono/cookie";
import { Context } from "hono";

export const addToWaitingQueue = (context: Context) => {
  const userId = getCookie(context, "user-ID");
  const name: string = context.get("users").getInfo(userId).name;

  context.get("gameHandler").addToQueue(name);

  return context.redirect("/waiting-page.html");
};

export const getQueue = (context: Context) => {
  return context.json(context.get("gameHandler").getWaitingList());
};
