import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

// Generate a random invite code
function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const inviteCode = generateInviteCode();

    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      description: args.description,
      ownerId: userId,
      inviteCode,
    });

    // Add creator as admin member
    await ctx.db.insert("workspaceMembers", {
      workspaceId,
      userId,
      role: "admin",
    });

    // Create general channel
    const channelId = await ctx.db.insert("channels", {
      name: "general",
      workspaceId,
      isPrivate: false,
      description: "General discussion",
      createdBy: userId,
    });

    // Add creator to general channel
    await ctx.db.insert("channelMembers", {
      channelId,
      userId,
    });

    return workspaceId;
  },
});

export const getUserWorkspaces = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const workspaces = await Promise.all(
      memberships.map(async (membership) => {
        const workspace = await ctx.db.get(membership.workspaceId);
        return {
          ...workspace,
          role: membership.role,
        };
      })
    );

    return workspaces.filter(Boolean);
  },
});

export const getWorkspaceById = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // Check if user is member of workspace
    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_and_user", (q) => 
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!membership) {
      return null;
    }

    const workspace = await ctx.db.get(args.workspaceId);
    return workspace;
  },
});

export const joinByInviteCode = mutation({
  args: { inviteCode: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", args.inviteCode))
      .unique();

    if (!workspace) {
      throw new Error("Invalid invite code");
    }

    // Check if already a member
    const existingMembership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_and_user", (q) => 
        q.eq("workspaceId", workspace._id).eq("userId", userId)
      )
      .unique();

    if (existingMembership) {
      return workspace._id;
    }

    // Add as member
    await ctx.db.insert("workspaceMembers", {
      workspaceId: workspace._id,
      userId,
      role: "member",
    });

    // Add to general channel
    const generalChannel = await ctx.db
      .query("channels")
      .withIndex("by_workspace_and_name", (q) => 
        q.eq("workspaceId", workspace._id).eq("name", "general")
      )
      .unique();

    if (generalChannel) {
      await ctx.db.insert("channelMembers", {
        channelId: generalChannel._id,
        userId,
      });
    }

    return workspace._id;
  },
});

export const getWorkspaceMembers = query({
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

    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const members = await Promise.all(
      memberships.map(async (membership) => {
        const user = await ctx.db.get(membership.userId);
        return {
          ...user,
          role: membership.role,
        };
      })
    );

    return members.filter(Boolean);
  },
});
