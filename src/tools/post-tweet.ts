import { z } from "zod";
import { defineTool } from "./types.js";

export default defineTool({
  name: "post_tweet",
  description: "Post a tweet to X/Twitter",
  schema: {
    text: z.string().describe("The text content of the tweet (max 280 characters)"),
  },
  handler: async (client, _userId, args) => {
    return client.posts.create({ text: args.text });
  },
});
