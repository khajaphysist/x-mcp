import { z } from "zod";
import { defineTool } from "./types.js";

export default defineTool({
  name: "delete_tweet",
  description: "Delete a tweet by its ID (must be owned by the authenticated user)",
  schema: {
    tweet_id: z.string().describe("The ID of the tweet to delete"),
  },
  handler: async (client, _userId, args) => {
    return client.posts.delete(args.tweet_id);
  },
});
