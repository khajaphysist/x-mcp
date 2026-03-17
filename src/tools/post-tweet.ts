import { z } from "zod";
import { defineTool } from "./types.js";

export default defineTool({
  name: "post_tweet",
  description: "Post a tweet to X/Twitter",
  schema: {
    text: z.string().describe("The text content of the tweet (max 280 characters)"),
    reply_to: z.string().optional().describe("Tweet ID to reply to"),
  },
  handler: async (client, _userId, args) => {
    return client.posts.create({
      text: args.text,
      ...(args.reply_to && { reply: { in_reply_to_tweet_id: args.reply_to } }),
    });
  },
});
