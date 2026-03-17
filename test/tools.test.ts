import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPostsClient = {
  create: vi.fn().mockResolvedValue({ data: { id: "999", text: "hello" } }),
  searchRecent: vi.fn().mockResolvedValue({
    data: [{ id: "1", text: "result" }],
    meta: { result_count: 1 },
  }),
  delete: vi.fn().mockResolvedValue({ data: { deleted: true } }),
};

const mockUsersClient = {
  getByUsernames: vi.fn().mockResolvedValue({
    data: [{ id: "1", username: "testuser" }],
  }),
  getMe: vi.fn().mockResolvedValue({ data: { id: "12345" } }),
  getTimeline: vi.fn().mockResolvedValue({
    data: [{ id: "1", text: "timeline post" }],
  }),
  likePost: vi.fn().mockResolvedValue({ data: { liked: true } }),
  repostPost: vi.fn().mockResolvedValue({ data: { retweeted: true } }),
};

const mockClient = {
  posts: mockPostsClient,
  users: mockUsersClient,
};

import { tools } from "../src/tools/index.js";

describe("tool registry", () => {
  it("contains all expected tools", () => {
    const names = tools.map((t) => t.name);
    expect(names).toEqual([
      "post_tweet",
      "search_tweets",
      "get_user_info",
      "get_timeline",
      "like_tweet",
      "retweet",
      "delete_tweet",
    ]);
  });

  it("every tool has name, description, schema, and handler", () => {
    for (const tool of tools) {
      expect(tool.name).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(tool.schema).toBeDefined();
      expect(typeof tool.handler).toBe("function");
    }
  });
});

describe("tool handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function findTool(name: string) {
    const tool = tools.find((t) => t.name === name);
    if (!tool) throw new Error(`Tool ${name} not found`);
    return tool;
  }

  it("post_tweet calls posts.create", async () => {
    const tool = findTool("post_tweet");
    const result = await tool.handler(mockClient as any, "uid", { text: "hello world" });
    expect(mockPostsClient.create).toHaveBeenCalledWith({ text: "hello world" });
    expect((result as any).data.id).toBe("999");
  });

  it("search_tweets calls posts.searchRecent with defaults", async () => {
    const tool = findTool("search_tweets");
    await tool.handler(mockClient as any, "uid", { query: "test" });
    expect(mockPostsClient.searchRecent).toHaveBeenCalledWith("test", {
      maxResults: 10,
      tweetFields: expect.any(Array),
    });
  });

  it("search_tweets respects max_results", async () => {
    const tool = findTool("search_tweets");
    await tool.handler(mockClient as any, "uid", { query: "test", max_results: 50 });
    expect(mockPostsClient.searchRecent).toHaveBeenCalledWith("test", {
      maxResults: 50,
      tweetFields: expect.any(Array),
    });
  });

  it("get_user_info calls users.getByUsernames", async () => {
    const tool = findTool("get_user_info");
    const result = await tool.handler(mockClient as any, "uid", { usernames: ["testuser"] });
    expect(mockUsersClient.getByUsernames).toHaveBeenCalledWith(["testuser"], {
      userFields: expect.any(Array),
    });
    expect((result as any).data[0].username).toBe("testuser");
  });

  it("get_timeline calls users.getTimeline with userId", async () => {
    const tool = findTool("get_timeline");
    await tool.handler(mockClient as any, "user123", {});
    expect(mockUsersClient.getTimeline).toHaveBeenCalledWith("user123", {
      maxResults: 20,
      tweetFields: expect.any(Array),
    });
  });

  it("like_tweet calls users.likePost", async () => {
    const tool = findTool("like_tweet");
    await tool.handler(mockClient as any, "user123", { tweet_id: "abc" });
    expect(mockUsersClient.likePost).toHaveBeenCalledWith("user123", {
      body: { tweetId: "abc" },
    });
  });

  it("retweet calls users.repostPost", async () => {
    const tool = findTool("retweet");
    await tool.handler(mockClient as any, "user123", { tweet_id: "abc" });
    expect(mockUsersClient.repostPost).toHaveBeenCalledWith("user123", {
      body: { tweetId: "abc" },
    });
  });

  it("delete_tweet calls posts.delete", async () => {
    const tool = findTool("delete_tweet");
    await tool.handler(mockClient as any, "uid", { tweet_id: "abc" });
    expect(mockPostsClient.delete).toHaveBeenCalledWith("abc");
  });
});
