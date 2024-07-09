// This file demonstrates how to stream from the server the chunks as
// a new-line separated JSON-encoded stream.

import OpenAI from "openai";
import express, { Request, Response } from "express";
import { ChatCompletionChunk } from "openai/resources";
import { OpenAIError } from "openai/error";
import dotenv = require("dotenv");

dotenv.config();

const openai = new OpenAI();
const app = express();

app.use(express.text());

// This endpoint can be called with:
//
//   curl 127.0.0.1:8080 -N -X POST -H 'Content-Type: text/plain' \
//     --data 'Can you explain why dogs are better than cats?'
//
// Or consumed with fetch:
//
//   fetch('http://localhost:8080', {
//     method: 'POST',
//     body: 'Tell me why dogs are better than cats',
//   }).then(async res => {
//     const runner = ChatCompletionStreamingRunner.fromReadableStream(res)
//   })
//
// See examples/stream-to-client-browser.ts for a more complete example.
app.post("/", async (req: Request, res: Response) => {
  try {
    console.log("Received request:", req.body);

    const stream = openai.beta.chat.completions.stream({
      model: "gpt-3.5-turbo",
      stream: true,
      messages: [{ role: "user", content: req.body }],
    });

    // Send the headers back immediately
    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      "x-custom-header": "hello",
    });

    // Stream the chunks to the response
    stream.on("content", (delta: string, snapshot: string) => {
      res.write(delta);
    });

    stream.on("error", (err: OpenAIError) => {
      console.error("OpenAI Stream error:", err);
    });

    stream.on("end", () => {
      res.end();
    });
  } catch (e) {
    console.error(e);
  }
});

app.listen("8080", () => {
  console.log("Started express server");
});
