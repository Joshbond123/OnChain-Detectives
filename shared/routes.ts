import { z } from "zod";
import { generationRequestSchema } from "./schema";

export const api = {
  generation: {
    create: {
      method: "POST" as const,
      path: "/api/generate",
      input: generationRequestSchema,
      responses: {
        200: z.object({ id: z.string() }).passthrough(),
        202: z.object({ queued: z.boolean() }),
      },
    },
  },
};
