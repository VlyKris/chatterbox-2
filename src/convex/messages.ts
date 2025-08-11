import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

export const send = mutation({
  args: {
    content: v.string(),
    channelId: v.id("channels"),
    parentMessageId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }

    // Check if user has access to this channel
    if (channel.isPrivate) {
      const channelMembership = await ctx.db
        .query("channelMembers")
        .withIndex("by_channel_and_user", (q) => 
          q.eq("channelId", args.channelId).eq("userId", userId)
        )
        .unique();

      if (!channelMembership) {
        throw new Error("Not a member of this channel");
      }
    } else {
      // For public channels, check workspace membership
      const workspaceMembership = await ctx.db
        .query("workspaceMembers")
        .withIndex("by_workspace_and_user", (q) => 
          q.eq("workspaceId", channel.workspaceId).eq("userId", userId)
        )
        .unique();

      if (!workspaceMembership) {
        throw new Error("Not a member of this workspace");
      }
    }

    const messageId = await ctx.db.insert("messages", {
      content: args.content,
      authorId: userId,
      channelId: args.channelId,
      workspaceId: channel.workspaceId,
      parentMessageId: args.parentMessageId,
    });

    return messageId;
  },
});

export const getChannelMessages = query({
  args: {
    channelId: v.id("channels"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    // Check access
    if (channel.isPrivate) {
      const channelMembership = await ctx.db
        .query("channelMembers")
        .withIndex("by_channel_and_user", (q) => 
          q.eq("channelId", args.channelId).eq("userId", userId)
        )
        .unique();

      if (!channelMembership) {
        return { page: [], isDone: true, continueCursor: "" };
      }
    } else {
      const workspaceMembership = await ctx.db
        .query("workspaceMembers")
        .withIndex("by_workspace_and_user", (q) => 
          q.eq("workspaceId", channel.workspaceId).eq("userId", userId)
        )
        .unique();

      if (!workspaceMembership) {
        return { page: [], isDone: true, continueCursor: "" };
      }
    }

    const result = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => 
        q.eq("channelId", args.channelId)
      )
      .order("desc")
      .paginate(args.paginationOpts);

    const messagesWithAuthors = await Promise.all(
      result.page.map(async (message) => {
        const author = await ctx.db.get(message.authorId);
        return {
          ...message,
          author,
        };
      })
    );

    return {
      ...result,
      page: messagesWithAuthors,
    };
  },
});

export const edit = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    if (message.authorId !== userId) {
      throw new Error("Can only edit your own messages");
    }

    await ctx.db.patch(args.messageId, {
      content: args.content,
      isEdited: true,
    });
  },
});

export const remove = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    if (message.authorId !== userId) {
      throw new Error("Can only delete your own messages");
    }

    await ctx.db.delete(args.messageId);
  },
});