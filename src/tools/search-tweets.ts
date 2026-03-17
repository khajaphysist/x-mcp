import { z } from "zod";
import { defineTool } from "./types.js";

export default defineTool({
  name: "search_tweets",
  description: "Search recent tweets on X/Twitter (last 7 days)",
  schema: {
    query: z.string().describe("Search query (supports X search operators like from:, to:, is:retweet, etc.)"),
    max_results: z.number().optional().describe("Maximum number of results (10-100, default 10)"),
  },
  handler: async (client, _userId, args) => {
    return client.posts.searchRecent(args.query, {
      maxResults: args.max_results ?? 10,
      tweetFields: ["created_at", "author_id", "public_metrics", "lang"],
    });
  },
});
