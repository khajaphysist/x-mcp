export type { AnyTool, ToolSchema } from "./types.js";
export { defineTool } from "./types.js";

import type { AnyTool } from "./types.js";
import postTweet from "./post-tweet.js";
import searchTweets from "./search-tweets.js";
import getUserInfo from "./get-user-info.js";
import getTimeline from "./get-timeline.js";
import likeTweet from "./like-tweet.js";
import retweet from "./retweet.js";
import deleteTweet from "./delete-tweet.js";

export const tools: AnyTool[] = [
  postTweet,
  searchTweets,
  getUserInfo,
  getTimeline,
  likeTweet,
  retweet,
  deleteTweet,
];
