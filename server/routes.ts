import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCourseSchema, insertAssignmentSchema, insertNoteSchema, insertStudyGroupSchema, insertStudySessionSchema } from "@shared/schema";
import { seedDatabase } from "./seed";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const userId = 1; // Mock user ID for demo
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Courses
  app.get("/api/courses", async (req, res) => {
    try {
      const userId = 1; // Mock user ID for demo
      const courses = await storage.getCourses(userId);
      res.json(courses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch courses" });
    }
  });

  app.post("/api/courses", async (req, res) => {
    try {
      const validatedData = insertCourseSchema.parse({
        ...req.body,
        userId: 1 // Mock user ID for demo
      });
      const course = await storage.createCourse(validatedData);
      res.json(course);
    } catch (error) {
      res.status(400).json({ error: "Invalid course data" });
    }
  });

  app.put("/api/courses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const course = await storage.updateCourse(id, req.body);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ error: "Failed to update course" });
    }
  });

  app.delete("/api/courses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCourse(id);
      if (!success) {
        return res.status(404).json({ error: "Course not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete course" });
    }
  });

  // Assignments
  app.get("/api/assignments", async (req, res) => {
    try {
      const userId = 1; // Mock user ID for demo
      const assignments = await storage.getAssignments(userId);
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch assignments" });
    }
  });

  app.get("/api/assignments/upcoming", async (req, res) => {
    try {
      const userId = 1; // Mock user ID for demo
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const assignments = await storage.getUpcomingAssignments(userId, limit);
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch upcoming assignments" });
    }
  });

  app.post("/api/assignments", async (req, res) => {
    try {
      const validatedData = insertAssignmentSchema.parse({
        ...req.body,
        userId: 1, // Mock user ID for demo
        dueDate: new Date(req.body.dueDate)
      });
      const assignment = await storage.createAssignment(validatedData);
      res.json(assignment);
    } catch (error) {
      res.status(400).json({ error: "Invalid assignment data" });
    }
  });

  app.put("/api/assignments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = { ...req.body };
      if (updateData.dueDate) {
        updateData.dueDate = new Date(updateData.dueDate);
      }
      const assignment = await storage.updateAssignment(id, updateData);
      if (!assignment) {
        return res.status(404).json({ error: "Assignment not found" });
      }
      res.json(assignment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update assignment" });
    }
  });

  app.delete("/api/assignments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAssignment(id);
      if (!success) {
        return res.status(404).json({ error: "Assignment not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete assignment" });
    }
  });

  // Notes
  app.get("/api/notes", async (req, res) => {
    try {
      const userId = 1; // Mock user ID for demo
      const notes = await storage.getNotes(userId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

  app.get("/api/notes/recent", async (req, res) => {
    try {
      const userId = 1; // Mock user ID for demo
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const notes = await storage.getRecentNotes(userId, limit);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent notes" });
    }
  });

  app.get("/api/notes/search", async (req, res) => {
    try {
      const userId = 1; // Mock user ID for demo
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query required" });
      }
      const notes = await storage.searchNotes(userId, query);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to search notes" });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      const validatedData = insertNoteSchema.parse({
        ...req.body,
        userId: 1 // Mock user ID for demo
      });
      const note = await storage.createNote(validatedData);
      res.json(note);
    } catch (error) {
      res.status(400).json({ error: "Invalid note data" });
    }
  });

  app.put("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const note = await storage.updateNote(id, req.body);
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }
      res.json(note);
    } catch (error) {
      res.status(500).json({ error: "Failed to update note" });
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteNote(id);
      if (!success) {
        return res.status(404).json({ error: "Note not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete note" });
    }
  });

  // Study Groups
  app.get("/api/study-groups", async (req, res) => {
    try {
      const userId = 1; // Mock user ID for demo
      const studyGroups = await storage.getStudyGroups(userId);
      res.json(studyGroups);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch study groups" });
    }
  });

  app.post("/api/study-groups", async (req, res) => {
    try {
      const validatedData = insertStudyGroupSchema.parse({
        ...req.body,
        createdBy: 1 // Mock user ID for demo
      });
      const studyGroup = await storage.createStudyGroup(validatedData);
      res.json(studyGroup);
    } catch (error) {
      res.status(400).json({ error: "Invalid study group data" });
    }
  });

  app.get("/api/study-groups/:id/members", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const members = await storage.getStudyGroupMembers(id);
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch study group members" });
    }
  });

  app.post("/api/study-groups/:id/members", async (req, res) => {
    try {
      const studyGroupId = parseInt(req.params.id);
      const member = await storage.addStudyGroupMember({
        studyGroupId,
        userId: req.body.userId,
        role: req.body.role || "member"
      });
      res.json(member);
    } catch (error) {
      res.status(400).json({ error: "Failed to add study group member" });
    }
  });

  // Study Sessions
  app.get("/api/study-sessions", async (req, res) => {
    try {
      const userId = 1; // Mock user ID for demo
      const sessions = await storage.getStudySessions(userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch study sessions" });
    }
  });

  app.post("/api/study-sessions", async (req, res) => {
    try {
      const validatedData = insertStudySessionSchema.parse({
        ...req.body,
        userId: 1, // Mock user ID for demo
        date: new Date(req.body.date)
      });
      const session = await storage.createStudySession(validatedData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: "Invalid study session data" });
    }
  });

  // Seed database endpoint
  app.post("/api/seed", async (req, res) => {
    try {
      const user = await seedDatabase();
      res.json({ message: "Database seeded successfully", userId: user.id });
    } catch (error) {
      console.error("Seeding error:", error);
      res.status(500).json({ error: "Failed to seed database" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
