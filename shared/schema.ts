import { z } from "zod";

// User Profile Schema
export const profileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(1),
  avatar_url: z.string().nullable(),
  bio: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Profile = z.infer<typeof profileSchema>;

export const insertProfileSchema = profileSchema.pick({
  name: true,
  avatar_url: true,
  bio: true,
});

export type InsertProfile = z.infer<typeof insertProfileSchema>;

// Friendship Schema
export const friendshipSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  friend_id: z.string(),
  status: z.enum(['pending', 'accepted', 'blocked']),
  created_at: z.string(),
});

export type Friendship = z.infer<typeof friendshipSchema>;

// Chat Schema
export const chatSchema = z.object({
  id: z.string(),
  user1_id: z.string(),
  user2_id: z.string(),
  last_message: z.string().nullable(),
  last_message_at: z.string().nullable(),
  created_at: z.string(),
});

export type Chat = z.infer<typeof chatSchema>;

// Message Schema
export const messageSchema = z.object({
  id: z.string(),
  chat_id: z.string(),
  sender_id: z.string(),
  receiver_id: z.string(),
  content: z.string().nullable(),
  type: z.enum(['text', 'image', 'voice', 'video']),
  media_url: z.string().nullable(),
  read: z.boolean(),
  created_at: z.string(),
});

export type Message = z.infer<typeof messageSchema>;

export const insertMessageSchema = messageSchema.pick({
  chat_id: true,
  receiver_id: true,
  content: true,
  type: true,
  media_url: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;

// Ranking Schema
export const rankingSchema = z.object({
  user_id: z.string(),
  name: z.string(),
  avatar_url: z.string().nullable(),
  message_count: z.number(),
  rank: z.number(),
});

export type Ranking = z.infer<typeof rankingSchema>;

// Coin Prize Schema
export const coinPrizeSchema = z.object({
  id: z.string(),
  period_type: z.enum(['daily', 'weekly', 'monthly', 'annual']),
  first_place: z.number(),
  second_place: z.number(),
  third_place: z.number(),
  updated_at: z.string(),
});

export type CoinPrize = z.infer<typeof coinPrizeSchema>;

// Blocked User Schema
export const blockedUserSchema = z.object({
  id: z.string(),
  blocker_id: z.string(),
  blocked_id: z.string(),
  blocked_name: z.string(),
  blocked_avatar: z.string().nullable(),
  created_at: z.string(),
});

export type BlockedUser = z.infer<typeof blockedUserSchema>;

// Chat with Profile Info (for display)
export type ChatWithProfile = Chat & {
  friend_profile: Profile;
  unread_count: number;
};

// Auth Schemas
export const signupSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
