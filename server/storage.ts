import { 
  users, courses, assignments, notes, studyGroups, studyGroupMembers, studySessions,
  achievements, userAchievements, challenges, userChallenges, userStats, flashcards, pomodoroSessions,
  type User, type InsertUser, type Course, type InsertCourse, 
  type Assignment, type InsertAssignment, type Note, type InsertNote,
  type StudyGroup, type InsertStudyGroup, type StudyGroupMember, type InsertStudyGroupMember,
  type StudySession, type InsertStudySession, type Achievement, type InsertAchievement,
  type UserAchievement, type InsertUserAchievement, type Challenge, type InsertChallenge,
  type UserChallenge, type InsertUserChallenge, type UserStats, type InsertUserStats,
  type Flashcard, type InsertFlashcard, type PomodoroSession, type InsertPomodoroSession
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Courses
  getCourses(userId: number): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, updates: Partial<Course>): Promise<Course | undefined>;
  deleteCourse(id: number): Promise<boolean>;
  
  // Assignments
  getAssignments(userId: number): Promise<Assignment[]>;
  getAssignmentsByCourse(courseId: number): Promise<Assignment[]>;
  getUpcomingAssignments(userId: number, limit?: number): Promise<Assignment[]>;
  getAssignment(id: number): Promise<Assignment | undefined>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  updateAssignment(id: number, updates: Partial<Assignment>): Promise<Assignment | undefined>;
  deleteAssignment(id: number): Promise<boolean>;
  
  // Notes
  getNotes(userId: number): Promise<Note[]>;
  getNotesByCourse(courseId: number): Promise<Note[]>;
  getRecentNotes(userId: number, limit?: number): Promise<Note[]>;
  getNote(id: number): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, updates: Partial<Note>): Promise<Note | undefined>;
  deleteNote(id: number): Promise<boolean>;
  searchNotes(userId: number, query: string): Promise<Note[]>;
  
  // Study Groups
  getStudyGroups(userId: number): Promise<StudyGroup[]>;
  getStudyGroup(id: number): Promise<StudyGroup | undefined>;
  createStudyGroup(studyGroup: InsertStudyGroup): Promise<StudyGroup>;
  updateStudyGroup(id: number, updates: Partial<StudyGroup>): Promise<StudyGroup | undefined>;
  deleteStudyGroup(id: number): Promise<boolean>;
  
  // Study Group Members
  getStudyGroupMembers(studyGroupId: number): Promise<StudyGroupMember[]>;
  addStudyGroupMember(member: InsertStudyGroupMember): Promise<StudyGroupMember>;
  removeStudyGroupMember(studyGroupId: number, userId: number): Promise<boolean>;
  
  // Study Sessions
  getStudySessions(userId: number): Promise<StudySession[]>;
  createStudySession(session: InsertStudySession): Promise<StudySession>;
  
  // Gamification - Achievements
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: number): Promise<UserAchievement[]>;
  createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement>;
  
  // Gamification - Challenges
  getChallenges(): Promise<Challenge[]>;
  getActiveChallenges(): Promise<Challenge[]>;
  getUserChallenges(userId: number): Promise<UserChallenge[]>;
  createUserChallenge(userChallenge: InsertUserChallenge): Promise<UserChallenge>;
  updateUserChallenge(id: number, updates: Partial<UserChallenge>): Promise<UserChallenge | undefined>;
  
  // Gamification - User Stats
  getUserStats(userId: number): Promise<UserStats | undefined>;
  createUserStats(userStats: InsertUserStats): Promise<UserStats>;
  updateUserStats(userId: number, updates: Partial<UserStats>): Promise<UserStats | undefined>;
  
  // Gamification - Flashcards
  getFlashcards(userId: number): Promise<Flashcard[]>;
  createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard>;
  updateFlashcard(id: number, updates: Partial<Flashcard>): Promise<Flashcard | undefined>;
  deleteFlashcard(id: number): Promise<boolean>;
  
  // Gamification - Pomodoro Sessions
  getPomodoroSessions(userId: number): Promise<PomodoroSession[]>;
  createPomodoroSession(session: InsertPomodoroSession): Promise<PomodoroSession>;
  
  // Dashboard stats
  getDashboardStats(userId: number): Promise<{
    assignmentsDue: number;
    currentGPA: number;
    studyHours: number;
    activeCourses: number;
    completedCredits: number;
    overallGPA: number;
    semesterGPA: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<number, Course>;
  private assignments: Map<number, Assignment>;
  private notes: Map<number, Note>;
  private studyGroups: Map<number, StudyGroup>;
  private studyGroupMembers: Map<number, StudyGroupMember>;
  private studySessions: Map<number, StudySession>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.assignments = new Map();
    this.notes = new Map();
    this.studyGroups = new Map();
    this.studyGroupMembers = new Map();
    this.studySessions = new Map();
    this.currentId = 1;
    
    // Initialize with default user
    this.createUser({
      username: "alex",
      password: "password",
      firstName: "Alex",
      lastName: "Johnson",
      email: "alex@example.com",
      program: "Computer Science",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=40&h=40"
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id, avatar: insertUser.avatar || null };
    this.users.set(id, user);
    return user;
  }

  async getCourses(userId: number): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(course => course.userId === userId);
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const id = this.currentId++;
    const newCourse: Course = { 
      ...course, 
      id, 
      color: course.color || "#6366f1",
      credits: course.credits || 3,
      instructor: course.instructor || null
    };
    this.courses.set(id, newCourse);
    return newCourse;
  }

  async updateCourse(id: number, updates: Partial<Course>): Promise<Course | undefined> {
    const course = this.courses.get(id);
    if (!course) return undefined;
    
    const updatedCourse = { ...course, ...updates };
    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }

  async deleteCourse(id: number): Promise<boolean> {
    return this.courses.delete(id);
  }

  async getAssignments(userId: number): Promise<Assignment[]> {
    return Array.from(this.assignments.values()).filter(assignment => assignment.userId === userId);
  }

  async getAssignmentsByCourse(courseId: number): Promise<Assignment[]> {
    return Array.from(this.assignments.values()).filter(assignment => assignment.courseId === courseId);
  }

  async getUpcomingAssignments(userId: number, limit: number = 5): Promise<Assignment[]> {
    const now = new Date();
    return Array.from(this.assignments.values())
      .filter(assignment => assignment.userId === userId && assignment.dueDate > now && assignment.status !== 'completed')
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, limit);
  }

  async getAssignment(id: number): Promise<Assignment | undefined> {
    return this.assignments.get(id);
  }

  async createAssignment(assignment: InsertAssignment): Promise<Assignment> {
    const id = this.currentId++;
    const newAssignment: Assignment = { 
      ...assignment, 
      id,
      createdAt: new Date(),
      type: assignment.type || "assignment",
      description: assignment.description || null,
      status: assignment.status || "pending",
      priority: assignment.priority || "medium",
      grade: assignment.grade || null,
      maxPoints: assignment.maxPoints || null
    };
    this.assignments.set(id, newAssignment);
    return newAssignment;
  }

  async updateAssignment(id: number, updates: Partial<Assignment>): Promise<Assignment | undefined> {
    const assignment = this.assignments.get(id);
    if (!assignment) return undefined;
    
    const updatedAssignment = { ...assignment, ...updates };
    this.assignments.set(id, updatedAssignment);
    return updatedAssignment;
  }

  async deleteAssignment(id: number): Promise<boolean> {
    return this.assignments.delete(id);
  }

  async getNotes(userId: number): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(note => note.userId === userId);
  }

  async getNotesByCourse(courseId: number): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(note => note.courseId === courseId);
  }

  async getRecentNotes(userId: number, limit: number = 5): Promise<Note[]> {
    return Array.from(this.notes.values())
      .filter(note => note.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, limit);
  }

  async getNote(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async createNote(note: InsertNote): Promise<Note> {
    const id = this.currentId++;
    const now = new Date();
    const newNote: Note = { 
      ...note, 
      id,
      createdAt: now,
      updatedAt: now,
      courseId: note.courseId || null,
      tags: note.tags || null,
      isShared: note.isShared || false
    };
    this.notes.set(id, newNote);
    return newNote;
  }

  async updateNote(id: number, updates: Partial<Note>): Promise<Note | undefined> {
    const note = this.notes.get(id);
    if (!note) return undefined;
    
    const updatedNote = { ...note, ...updates, updatedAt: new Date() };
    this.notes.set(id, updatedNote);
    return updatedNote;
  }

  async deleteNote(id: number): Promise<boolean> {
    return this.notes.delete(id);
  }

  async searchNotes(userId: number, query: string): Promise<Note[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.notes.values())
      .filter(note => 
        note.userId === userId &&
        (note.title.toLowerCase().includes(lowerQuery) || 
         note.content.toLowerCase().includes(lowerQuery))
      );
  }

  async getStudyGroups(userId: number): Promise<StudyGroup[]> {
    const memberGroups = Array.from(this.studyGroupMembers.values())
      .filter(member => member.userId === userId)
      .map(member => member.studyGroupId);
    
    return Array.from(this.studyGroups.values())
      .filter(group => memberGroups.includes(group.id) || group.createdBy === userId);
  }

  async getStudyGroup(id: number): Promise<StudyGroup | undefined> {
    return this.studyGroups.get(id);
  }

  async createStudyGroup(studyGroup: InsertStudyGroup): Promise<StudyGroup> {
    const id = this.currentId++;
    const newStudyGroup: StudyGroup = { 
      ...studyGroup, 
      id,
      createdAt: new Date(),
      description: studyGroup.description || null,
      location: studyGroup.location || null,
      courseId: studyGroup.courseId || null,
      maxMembers: studyGroup.maxMembers || 10,
      meetingSchedule: studyGroup.meetingSchedule || null,
      isActive: studyGroup.isActive !== undefined ? studyGroup.isActive : true
    };
    this.studyGroups.set(id, newStudyGroup);
    return newStudyGroup;
  }

  async updateStudyGroup(id: number, updates: Partial<StudyGroup>): Promise<StudyGroup | undefined> {
    const studyGroup = this.studyGroups.get(id);
    if (!studyGroup) return undefined;
    
    const updatedStudyGroup = { ...studyGroup, ...updates };
    this.studyGroups.set(id, updatedStudyGroup);
    return updatedStudyGroup;
  }

  async deleteStudyGroup(id: number): Promise<boolean> {
    return this.studyGroups.delete(id);
  }

  async getStudyGroupMembers(studyGroupId: number): Promise<StudyGroupMember[]> {
    return Array.from(this.studyGroupMembers.values())
      .filter(member => member.studyGroupId === studyGroupId);
  }

  async addStudyGroupMember(member: InsertStudyGroupMember): Promise<StudyGroupMember> {
    const id = this.currentId++;
    const newMember: StudyGroupMember = { 
      ...member, 
      id,
      joinedAt: new Date(),
      role: member.role || "member"
    };
    this.studyGroupMembers.set(id, newMember);
    return newMember;
  }

  async removeStudyGroupMember(studyGroupId: number, userId: number): Promise<boolean> {
    const member = Array.from(this.studyGroupMembers.values())
      .find(m => m.studyGroupId === studyGroupId && m.userId === userId);
    
    if (!member) return false;
    return this.studyGroupMembers.delete(member.id);
  }

  async getStudySessions(userId: number): Promise<StudySession[]> {
    return Array.from(this.studySessions.values()).filter(session => session.userId === userId);
  }

  async createStudySession(session: InsertStudySession): Promise<StudySession> {
    const id = this.currentId++;
    const newSession: StudySession = { 
      ...session, 
      id,
      courseId: session.courseId || null,
      notes: session.notes || null
    };
    this.studySessions.set(id, newSession);
    return newSession;
  }

  async getDashboardStats(userId: number): Promise<{
    assignmentsDue: number;
    currentGPA: number;
    studyHours: number;
    activeCourses: number;
    completedCredits: number;
    overallGPA: number;
    semesterGPA: number;
  }> {
    const assignments = await this.getAssignments(userId);
    const courses = await this.getCourses(userId);
    const studySessions = await this.getStudySessions(userId);
    
    const assignmentsDue = assignments.filter(a => 
      a.status !== 'completed' && a.dueDate > new Date()
    ).length;
    
    const completedAssignments = assignments.filter(a => a.status === 'completed' && a.grade !== null);
    const totalPoints = completedAssignments.reduce((sum, a) => sum + (a.grade || 0), 0);
    const maxPoints = completedAssignments.reduce((sum, a) => sum + (a.maxPoints || 100), 0);
    const currentGPA = maxPoints > 0 ? (totalPoints / maxPoints) * 4.0 : 0;
    
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    const studyHours = studySessions
      .filter(s => s.date > thisWeek)
      .reduce((sum, s) => sum + s.duration, 0) / 60;
    
    const activeCourses = courses.length;
    const completedCredits = courses.reduce((sum, c) => sum + c.credits, 0);
    
    return {
      assignmentsDue,
      currentGPA: Math.round(currentGPA * 100) / 100,
      studyHours: Math.round(studyHours * 10) / 10,
      activeCourses,
      completedCredits,
      overallGPA: Math.round(currentGPA * 100) / 100,
      semesterGPA: Math.round(currentGPA * 100) / 100,
    };
  }

  // Gamification - Stub implementations (not used in production)
  async getAchievements(): Promise<Achievement[]> { return []; }
  async getUserAchievements(userId: number): Promise<UserAchievement[]> { return []; }
  async createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement> { 
    return { id: 1, ...userAchievement, createdAt: new Date() } as UserAchievement; 
  }
  async getChallenges(): Promise<Challenge[]> { return []; }
  async getActiveChallenges(): Promise<Challenge[]> { return []; }
  async getUserChallenges(userId: number): Promise<UserChallenge[]> { return []; }
  async createUserChallenge(userChallenge: InsertUserChallenge): Promise<UserChallenge> { 
    return { id: 1, ...userChallenge, createdAt: new Date() } as UserChallenge; 
  }
  async updateUserChallenge(id: number, updates: Partial<UserChallenge>): Promise<UserChallenge | undefined> { 
    return undefined; 
  }
  async getUserStats(userId: number): Promise<UserStats | undefined> { return undefined; }
  async createUserStats(userStats: InsertUserStats): Promise<UserStats> { 
    return { id: 1, ...userStats, createdAt: new Date(), updatedAt: new Date() } as UserStats; 
  }
  async updateUserStats(userId: number, updates: Partial<UserStats>): Promise<UserStats | undefined> { 
    return undefined; 
  }
  async getFlashcards(userId: number): Promise<Flashcard[]> { return []; }
  async createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard> { 
    return { id: 1, ...flashcard, createdAt: new Date(), updatedAt: new Date() } as Flashcard; 
  }
  async updateFlashcard(id: number, updates: Partial<Flashcard>): Promise<Flashcard | undefined> { 
    return undefined; 
  }
  async deleteFlashcard(id: number): Promise<boolean> { return false; }
  async getPomodoroSessions(userId: number): Promise<PomodoroSession[]> { return []; }
  async createPomodoroSession(session: InsertPomodoroSession): Promise<PomodoroSession> { 
    return { id: 1, ...session, createdAt: new Date() } as PomodoroSession; 
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getCourses(userId: number): Promise<Course[]> {
    return await db.select().from(courses).where(eq(courses.userId, userId));
  }

  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course || undefined;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db
      .insert(courses)
      .values(course)
      .returning();
    return newCourse;
  }

  async updateCourse(id: number, updates: Partial<Course>): Promise<Course | undefined> {
    const [course] = await db
      .update(courses)
      .set(updates)
      .where(eq(courses.id, id))
      .returning();
    return course || undefined;
  }

  async deleteCourse(id: number): Promise<boolean> {
    const result = await db.delete(courses).where(eq(courses.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getAssignments(userId: number): Promise<Assignment[]> {
    return await db.select().from(assignments).where(eq(assignments.userId, userId));
  }

  async getAssignmentsByCourse(courseId: number): Promise<Assignment[]> {
    return await db.select().from(assignments).where(eq(assignments.courseId, courseId));
  }

  async getUpcomingAssignments(userId: number, limit: number = 5): Promise<Assignment[]> {
    const now = new Date();
    return await db
      .select()
      .from(assignments)
      .where(
        and(
          eq(assignments.userId, userId),
          sql`${assignments.dueDate} > ${now}`,
          sql`${assignments.status} != 'completed'`
        )
      )
      .orderBy(asc(assignments.dueDate))
      .limit(limit);
  }

  async getAssignment(id: number): Promise<Assignment | undefined> {
    const [assignment] = await db.select().from(assignments).where(eq(assignments.id, id));
    return assignment || undefined;
  }

  async createAssignment(assignment: InsertAssignment): Promise<Assignment> {
    const [newAssignment] = await db
      .insert(assignments)
      .values(assignment)
      .returning();
    return newAssignment;
  }

  async updateAssignment(id: number, updates: Partial<Assignment>): Promise<Assignment | undefined> {
    const [assignment] = await db
      .update(assignments)
      .set(updates)
      .where(eq(assignments.id, id))
      .returning();
    return assignment || undefined;
  }

  async deleteAssignment(id: number): Promise<boolean> {
    const result = await db.delete(assignments).where(eq(assignments.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getNotes(userId: number): Promise<Note[]> {
    return await db.select().from(notes).where(eq(notes.userId, userId));
  }

  async getNotesByCourse(courseId: number): Promise<Note[]> {
    return await db.select().from(notes).where(eq(notes.courseId, courseId));
  }

  async getRecentNotes(userId: number, limit: number = 5): Promise<Note[]> {
    return await db
      .select()
      .from(notes)
      .where(eq(notes.userId, userId))
      .orderBy(desc(notes.updatedAt))
      .limit(limit);
  }

  async getNote(id: number): Promise<Note | undefined> {
    const [note] = await db.select().from(notes).where(eq(notes.id, id));
    return note || undefined;
  }

  async createNote(note: InsertNote): Promise<Note> {
    const [newNote] = await db
      .insert(notes)
      .values(note)
      .returning();
    return newNote;
  }

  async updateNote(id: number, updates: Partial<Note>): Promise<Note | undefined> {
    const [note] = await db
      .update(notes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(notes.id, id))
      .returning();
    return note || undefined;
  }

  async deleteNote(id: number): Promise<boolean> {
    const result = await db.delete(notes).where(eq(notes.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async searchNotes(userId: number, query: string): Promise<Note[]> {
    return await db
      .select()
      .from(notes)
      .where(
        and(
          eq(notes.userId, userId),
          sql`(${notes.title} ILIKE ${`%${query}%`} OR ${notes.content} ILIKE ${`%${query}%`})`
        )
      );
  }

  async getStudyGroups(userId: number): Promise<StudyGroup[]> {
    // Get groups where user is a member or creator
    const memberGroups = await db
      .select({ studyGroupId: studyGroupMembers.studyGroupId })
      .from(studyGroupMembers)
      .where(eq(studyGroupMembers.userId, userId));
    
    const memberGroupIds = memberGroups.map(g => g.studyGroupId);
    
    if (memberGroupIds.length === 0) {
      return await db.select().from(studyGroups).where(eq(studyGroups.createdBy, userId));
    }
    
    return await db
      .select()
      .from(studyGroups)
      .where(
        sql`${studyGroups.id} IN (${memberGroupIds.join(',')}) OR ${studyGroups.createdBy} = ${userId}`
      );
  }

  async getStudyGroup(id: number): Promise<StudyGroup | undefined> {
    const [group] = await db.select().from(studyGroups).where(eq(studyGroups.id, id));
    return group || undefined;
  }

  async createStudyGroup(studyGroup: InsertStudyGroup): Promise<StudyGroup> {
    const [newGroup] = await db
      .insert(studyGroups)
      .values(studyGroup)
      .returning();
    return newGroup;
  }

  async updateStudyGroup(id: number, updates: Partial<StudyGroup>): Promise<StudyGroup | undefined> {
    const [group] = await db
      .update(studyGroups)
      .set(updates)
      .where(eq(studyGroups.id, id))
      .returning();
    return group || undefined;
  }

  async deleteStudyGroup(id: number): Promise<boolean> {
    const result = await db.delete(studyGroups).where(eq(studyGroups.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getStudyGroupMembers(studyGroupId: number): Promise<StudyGroupMember[]> {
    return await db.select().from(studyGroupMembers).where(eq(studyGroupMembers.studyGroupId, studyGroupId));
  }

  async addStudyGroupMember(member: InsertStudyGroupMember): Promise<StudyGroupMember> {
    const [newMember] = await db
      .insert(studyGroupMembers)
      .values(member)
      .returning();
    return newMember;
  }

  async removeStudyGroupMember(studyGroupId: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(studyGroupMembers)
      .where(
        and(
          eq(studyGroupMembers.studyGroupId, studyGroupId),
          eq(studyGroupMembers.userId, userId)
        )
      );
    return (result.rowCount ?? 0) > 0;
  }

  async getStudySessions(userId: number): Promise<StudySession[]> {
    return await db.select().from(studySessions).where(eq(studySessions.userId, userId));
  }

  async createStudySession(session: InsertStudySession): Promise<StudySession> {
    const [newSession] = await db
      .insert(studySessions)
      .values(session)
      .returning();
    return newSession;
  }

  async getDashboardStats(userId: number): Promise<{
    assignmentsDue: number;
    currentGPA: number;
    studyHours: number;
    activeCourses: number;
    completedCredits: number;
    overallGPA: number;
    semesterGPA: number;
  }> {
    const userAssignments = await this.getAssignments(userId);
    const userCourses = await this.getCourses(userId);
    const userSessions = await this.getStudySessions(userId);
    
    const assignmentsDue = userAssignments.filter(a => 
      a.status !== 'completed' && a.dueDate > new Date()
    ).length;
    
    const completedAssignments = userAssignments.filter(a => a.status === 'completed' && a.grade !== null);
    const totalPoints = completedAssignments.reduce((sum, a) => sum + (a.grade || 0), 0);
    const maxPoints = completedAssignments.reduce((sum, a) => sum + (a.maxPoints || 100), 0);
    const currentGPA = maxPoints > 0 ? (totalPoints / maxPoints) * 4.0 : 0;
    
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    const studyHours = userSessions
      .filter(s => s.date > thisWeek)
      .reduce((sum, s) => sum + s.duration, 0) / 60;
    
    const activeCourses = userCourses.length;
    const completedCredits = userCourses.reduce((sum, c) => sum + c.credits, 0);
    
    return {
      assignmentsDue,
      currentGPA: Math.round(currentGPA * 100) / 100,
      studyHours: Math.round(studyHours * 10) / 10,
      activeCourses,
      completedCredits,
      overallGPA: Math.round(currentGPA * 100) / 100,
      semesterGPA: Math.round(currentGPA * 100) / 100,
    };
  }

  // Gamification - Achievements
  async getAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements).where(eq(achievements.isActive, true));
  }

  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return await db.select().from(userAchievements).where(eq(userAchievements.userId, userId));
  }

  async createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const [newUserAchievement] = await db
      .insert(userAchievements)
      .values(userAchievement)
      .returning();
    return newUserAchievement;
  }

  // Gamification - Challenges
  async getChallenges(): Promise<Challenge[]> {
    return await db.select().from(challenges);
  }

  async getActiveChallenges(): Promise<Challenge[]> {
    return await db.select().from(challenges).where(eq(challenges.isActive, true));
  }

  async getUserChallenges(userId: number): Promise<UserChallenge[]> {
    return await db.select().from(userChallenges).where(eq(userChallenges.userId, userId));
  }

  async createUserChallenge(userChallenge: InsertUserChallenge): Promise<UserChallenge> {
    const [newUserChallenge] = await db
      .insert(userChallenges)
      .values(userChallenge)
      .returning();
    return newUserChallenge;
  }

  async updateUserChallenge(id: number, updates: Partial<UserChallenge>): Promise<UserChallenge | undefined> {
    const [userChallenge] = await db
      .update(userChallenges)
      .set(updates)
      .where(eq(userChallenges.id, id))
      .returning();
    return userChallenge || undefined;
  }

  // Gamification - User Stats
  async getUserStats(userId: number): Promise<UserStats | undefined> {
    const [userStat] = await db.select().from(userStats).where(eq(userStats.userId, userId));
    return userStat || undefined;
  }

  async createUserStats(userStatData: InsertUserStats): Promise<UserStats> {
    const [newUserStats] = await db
      .insert(userStats)
      .values(userStatData)
      .returning();
    return newUserStats;
  }

  async updateUserStats(userId: number, updates: Partial<UserStats>): Promise<UserStats | undefined> {
    const [userStat] = await db
      .update(userStats)
      .set(updates)
      .where(eq(userStats.userId, userId))
      .returning();
    return userStat || undefined;
  }

  // Gamification - Flashcards
  async getFlashcards(userId: number): Promise<Flashcard[]> {
    return await db.select().from(flashcards).where(eq(flashcards.userId, userId));
  }

  async createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard> {
    const [newFlashcard] = await db
      .insert(flashcards)
      .values(flashcard)
      .returning();
    return newFlashcard;
  }

  async updateFlashcard(id: number, updates: Partial<Flashcard>): Promise<Flashcard | undefined> {
    const [flashcard] = await db
      .update(flashcards)
      .set(updates)
      .where(eq(flashcards.id, id))
      .returning();
    return flashcard || undefined;
  }

  async deleteFlashcard(id: number): Promise<boolean> {
    const result = await db.delete(flashcards).where(eq(flashcards.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Gamification - Pomodoro Sessions
  async getPomodoroSessions(userId: number): Promise<PomodoroSession[]> {
    return await db.select().from(pomodoroSessions).where(eq(pomodoroSessions.userId, userId));
  }

  async createPomodoroSession(session: InsertPomodoroSession): Promise<PomodoroSession> {
    const [newSession] = await db
      .insert(pomodoroSessions)
      .values(session)
      .returning();
    return newSession;
  }
}

export const storage = new DatabaseStorage();
