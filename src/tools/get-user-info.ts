import { z } from "zod";
import { defineTool } from "./types.js";

export default defineTool({
  name: "get_user_info",
  description: "Get profile information for one or more X/Twitter users by username",
  schema: {
    usernames: z.array(z.string()).describe("One or more usernames (without @ prefix)"),
  },
  handler: async (client, _userId, args) => {
    return client.users.getByUsernames(args.usernames, {
      userFields: ["description", "public_metrics", "created_at", "profile_image_url"],
    });
  },
});
