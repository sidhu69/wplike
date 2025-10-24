import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // This app uses Supabase for all backend operations
  // All API calls are made directly from the frontend to Supabase
  // No server-side routes needed

  const httpServer = createServer(app);

  return httpServer;
}
