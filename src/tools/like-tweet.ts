import { z } from "zod";
import { defineTool } from "./types.js";

export default defineTool({
  name: "like_tweet",
  description: "Like a tweet by its ID",
  schema: {
    tweet_id: z.string().describe("The ID of the tweet to like"),
  },
  handler: async (client, userId, args) => {
    return client.users.likePost(userId, {
      body: { tweetId: args.tweet_id },
    });
  },
});
