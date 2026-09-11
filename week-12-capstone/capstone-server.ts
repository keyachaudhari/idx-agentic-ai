import http from "node:http";
import { capstoneAgent } from "./capstone-agent.ts";

const PORT = 3210;

const server = http.createServer((req, res) => {
  if (
    req.method !== "POST" ||
    req.url !== "/message"
  ) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  let body = "";

  req.on("data", chunk => {
    body += chunk;
  });

  req.on("end", async () => {
    try {
      const parsed =
        JSON.parse(body);

      const userId =
        String(
          parsed.userId ||
          "whatsapp-user"
        );

      const message =
        String(
          parsed.message ||
          ""
        );

      console.log(
        `[WhatsApp Bridge] ${userId}: ${message}`
      );

      const reply =
        await capstoneAgent(
          userId,
          message
        );

      res.writeHead(
        200,
        {
          "Content-Type":
            "application/json"
        }
      );

      res.end(
        JSON.stringify({
          ok: true,
          reply
        })
      );
    } catch (error) {
      console.error(
        "[WhatsApp Bridge] Error:",
        error
      );

      res.writeHead(
        500,
        {
          "Content-Type":
            "application/json"
        }
      );

      res.end(
        JSON.stringify({
          ok: false,
          error:
            error instanceof Error
              ? error.message
              : String(error)
        })
      );
    }
  });
});

server.listen(
  PORT,
  "127.0.0.1",
  () => {
    console.log(
      `IDX Capstone WhatsApp bridge running at http://127.0.0.1:${PORT}`
    );
  }
);