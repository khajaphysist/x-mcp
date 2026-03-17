import { z } from "zod";
import { defineTool } from "./types.js";

export default defineTool({
  name: "get_timeline",
  description: "Get the authenticated user's home timeline (reverse chronological)",
  schema: {
    max_results: z.number().optional().describe("Maximum number of results (1-100, default 20)"),
  },
  handler: async (client, userId, args) => {
    return client.users.getTimeline(userId, {
      maxResults: args.max_results ?? 20,
      tweetFields: ["created_at", "author_id", "public_metrics", "lang"],
    });
  },
});
