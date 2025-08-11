import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    name: v.string(),
    workspaceId: v.id("workspaces"),
    isPrivate: v.boolean(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Check if user is member of workspace
    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_and_user", (q) => 
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!membership) {
      throw new Error("Not a member of this workspace");
    }

    // Check if channel name already exists in workspace
    const existingChannel = await ctx.db
      .query("channels")
      .withIndex("by_workspace_and_name", (q) => 
        q.eq("workspaceId", args.workspaceId).eq("name", args.name)
      )
      .unique();

    if (existingChannel) {
      throw new Error("Channel name already exists");
    }

    const channelId = await ctx.db.insert("channels", {
      name: args.name,
      workspaceId: args.workspaceId,
      isPrivate: args.isPrivate,
      description: args.description,
      createdBy: userId,
    });

    // Add creator to channel
    await ctx.db.insert("channelMembers", {
      channelId,
      userId,
    });

    return channelId;
  },
});

export const getWorkspaceChannels = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Check if user is member of workspace
    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_and_user", (q) => 
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!membership) {
      return [];
    }

    // Get all channels in workspace
    const allChannels = await ctx.db
      .query("channels")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    // Filter channels user has access to
    const accessibleChannels = await Promise.all(
      allChannels.map(async (channel) => {
        if (!channel.isPrivate) {
          return channel;
        }

        // For private channels, check if user is a member
        const channelMembership = await ctx.db
          .query("channelMembers")
          .withIndex("by_channel_and_user", (q) => 
            q.eq("channelId", channel._id).eq("userId", userId)
          )
          .unique();

        return channelMembership ? channel : null;
      })
    );

    return accessibleChannels.filter(Boolean);
  },
});

export const getChannelById = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      return null;
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
        return null;
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
        return null;
      }
    }

    return channel;
  },
});

export const joinChannel = mutation({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }

    // Check workspace membership
    const workspaceMembership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_and_user", (q) => 
        q.eq("workspaceId", channel.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!workspaceMembership) {
      throw new Error("Not a member of this workspace");
    }

    // Can't join private channels without invitation
    if (channel.isPrivate) {
      throw new Error("Cannot join private channel");
    }

    // Check if already a member
    const existingMembership = await ctx.db
      .query("channelMembers")
      .withIndex("by_channel_and_user", (q) => 
        q.eq("channelId", args.channelId).eq("userId", userId)
      )
      .unique();

    if (existingMembership) {
      return;
    }

    await ctx.db.insert("channelMembers", {
      channelId: args.channelId,
      userId,
    });
  },
});
