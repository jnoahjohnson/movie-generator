import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import { getSession, commitSession } from "~/sessions";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));

  if (session.has("userId")) {
    // Redirect to the home page if they are already signed in.
    return redirect("/");
  }

  const data = { error: session.get("error") };

  return json(data, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const form = await request.formData();
  const password = form.get("password");

  const userId = password === "jnoahjohnson" ? "1" : null;

  console.log(userId);

  if (userId == null) {
    session.flash("error", "Invalid username/password");

    // Redirect back to the login page with errors.
    return redirect("/login", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  session.set("userId", "myUser");

  // Login succeeded, send them to the home page.
  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export default function Login() {
  const { error } = useLoaderData();

  return (
    <div className="px-4">
      <div className="max-w-xl mt-8 shadow-lg mx-auto">
        {error ? <div className="error">{error}</div> : null}
        <Form method="post" className="p-6">
          <div>
            <h1 className="text-4xl font-bold mb-4">Please Sign In</h1>
          </div>

          <div className="mb-2">
            <input
              type="password"
              name="password"
              placeholder="password"
              className="p-2 text-lg bg-slate-100"
            />
          </div>

          <button
            type="submit"
            className="border-solid border-2 border-black py-1 px-2 text-lg"
          >
            Sign in
          </button>
        </Form>
      </div>
    </div>
  );
}
