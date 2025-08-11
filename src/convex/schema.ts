import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
      status: v.optional(v.string()), // user status message
      isOnline: v.optional(v.boolean()), // online status
    }).index("email", ["email"]), // index for the email. do not remove or modify

    workspaces: defineTable({
      name: v.string(),
      description: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      ownerId: v.id("users"),
      inviteCode: v.string(),
    })
      .index("by_owner", ["ownerId"])
      .index("by_invite_code", ["inviteCode"]),

    workspaceMembers: defineTable({
      workspaceId: v.id("workspaces"),
      userId: v.id("users"),
      role: v.union(v.literal("admin"), v.literal("member")),
    })
      .index("by_workspace", ["workspaceId"])
      .index("by_user", ["userId"])
      .index("by_workspace_and_user", ["workspaceId", "userId"]),

    channels: defineTable({
      name: v.string(),
      workspaceId: v.id("workspaces"),
      isPrivate: v.boolean(),
      description: v.optional(v.string()),
      createdBy: v.id("users"),
    })
      .index("by_workspace", ["workspaceId"])
      .index("by_workspace_and_name", ["workspaceId", "name"]),

    channelMembers: defineTable({
      channelId: v.id("channels"),
      userId: v.id("users"),
    })
      .index("by_channel", ["channelId"])
      .index("by_user", ["userId"])
      .index("by_channel_and_user", ["channelId", "userId"]),

    messages: defineTable({
      content: v.string(),
      authorId: v.id("users"),
      channelId: v.id("channels"),
      workspaceId: v.id("workspaces"),
      parentMessageId: v.optional(v.id("messages")), // for threads
      isEdited: v.optional(v.boolean()),
      reactions: v.optional(v.array(v.object({
        emoji: v.string(),
        userIds: v.array(v.id("users")),
      }))),
    })
      .index("by_channel", ["channelId"])
      .index("by_workspace", ["workspaceId"])
      .index("by_author", ["authorId"])
      .index("by_parent", ["parentMessageId"]),

    directMessages: defineTable({
      content: v.string(),
      senderId: v.id("users"),
      receiverId: v.id("users"),
      workspaceId: v.id("workspaces"),
      isEdited: v.optional(v.boolean()),
    })
      .index("by_sender", ["senderId"])
      .index("by_receiver", ["receiverId"])
      .index("by_workspace", ["workspaceId"])
      .index("by_conversation", ["senderId", "receiverId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;