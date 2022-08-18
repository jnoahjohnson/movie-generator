import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useActionData, useTransition } from "@remix-run/react";
import { Configuration, OpenAIApi } from "openai";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getSession } from "~/sessions";

const card = {
  hidden: { opacity: 0, y: "100%" },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      duration: 0.8,
      bounce: 0.25,
    },
  },
};

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));

  if (!session.has("userId")) {
    return redirect("/login");
  }

  return {};
};

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));

  console.log("Session", session.data);

  if (!session.has("userId")) {
    return redirect("/");
  }

  const formData = await request.formData();

  const title = formData.get("title");

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(configuration);

  console.log(title);

  const response = await openai.createCompletion({
    model: "davinci:ft-noah-johnson-dev-2022-08-12-01-58-28",
    prompt: `Title: ${title}\nPlot:`,
    temperature: 0.8,
    stop: "\n",
    max_tokens: 200,
  });

  console.log("OpenAI", response.data.choices?.[0]?.text);

  return {
    moviePlot: response.data.choices?.[0]?.text ?? "Sorry. Nothing today...",
    title,
  };
};

export default function Index() {
  const data = useActionData();
  const transition = useTransition();
  const [titleValue, setTitleValue] = useState("");

  useEffect(() => {
    if (transition.state === "submitting") {
      setTitleValue("Please wait...");
    }

    if (transition.state === "idle") {
      setTitleValue("");
    }
  }, [transition]);

  return (
    <div className="pt-6 text-center px-4">
      <div className="mx-auto max-w-xl text-left">
        <h1 className="text-6xl mb-4 font-bold italic">Movie Generator</h1>
        <h2 className="text-3xl mb-4 font-light">Romantic Card Edition</h2>
      </div>
      <Form
        method="post"
        className="flex flex-col space-y-2 max-w-xl mx-auto mb-6"
      >
        <input
          type="text"
          name="title"
          placeholder="Title"
          className="p-4 shadow bg-slate-100"
          value={titleValue}
          onChange={(e) => setTitleValue(e.target.value)}
        />
        <button
          className="border-2 border-solid border-black text-black font-bold text-lg px-4 py-1 disabled:bg-gray-200 mx-auto w-64"
          disabled={transition.state === "submitting"}
        >
          {transition.state === "submitting" ? "Writing..." : "Get Plot"}
        </button>
      </Form>
      <motion.div
        variants={card}
        initial={false}
        className="text-left max-w-xl mx-auto shadow-lg p-4"
        animate={data && transition.state === "idle" ? "show" : "hidden"}
      >
        <p className="text-gray-800 text-3xl font-semibold mb-6 capitalize">
          {data && data.title}
        </p>
        <p className="text-gray-700 text-lg leading-loose">
          {data && data.moviePlot}
        </p>
      </motion.div>
      <footer className="fixed bottom-6 left-0 right-0">
        <p className="text-gray-700 text-center text-sm">
          Made with <span className="text-red-500">❤</span> by{" "}
          <a href="https://twitter.com/jnoahjohnson" className="text-blue-500">
            Noah Johnson
          </a>
        </p>
      </footer>
    </div>
  );
}
