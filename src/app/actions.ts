"use server";

import { cookies } from "next/headers";

export async function createCookies(token: string) {
  const url = new URL(
    process.env.NEXTAUTH_URL || "http://localhost:3000"
  );

  console.log("Creating cookie with domain:", url.hostname);

  const cookieStore = await cookies();

  cookieStore.set({
    name: "token",
    value: token,
    httpOnly: false,
    secure: url.protocol === "https:",
    sameSite: "lax",
    path: "/",
    domain: url.hostname === "localhost" ? "localhost" : undefined,
    maxAge: 30 * 24 * 60 * 60,
  });
}

export async function removeCookies() {
  const cookieStore = await cookies();

  cookieStore.delete({
    name: "token",
    path: "/",
  });
}

export async function getCookies(name: string) {
  const cookieStore = await cookies();
  return cookieStore.get(name);
}

export async function authenticated() {
  const token = await getCookies("token");
  return !!token;
}
