import { z } from "zod";
import { defineTool } from "./types.js";

export default defineTool({
  name: "retweet",
  description: "Retweet (repost) a tweet by its ID",
  schema: {
    tweet_id: z.string().describe("The ID of the tweet to retweet"),
  },
  handler: async (client, userId, args) => {
    return client.users.repostPost(userId, {
      body: { tweetId: args.tweet_id },
    });
  },
});
