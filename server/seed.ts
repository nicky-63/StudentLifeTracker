import { db } from './db';
import { users, courses, assignments, notes, studyGroups, studyGroupMembers, studySessions } from '../shared/schema';

export async function seedDatabase() {
  try {
    // Create a sample user
    const [user] = await db.insert(users).values({
      username: 'student1',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'student@example.com',
      program: 'Computer Science',
      avatar: null
    }).returning();

    console.log('Created user:', user.id);

    // Create sample courses
    const sampleCourses = [
      {
        userId: user.id,
        name: 'Computer Science 101',
        code: 'CS101',
        instructor: 'Dr. Smith',
        credits: 3,
        semester: 'Fall 2024',
        year: 2024,
        color: '#3b82f6'
      },
      {
        userId: user.id,
        name: 'Mathematics 201',
        code: 'MATH201',
        instructor: 'Prof. Johnson',
        credits: 4,
        semester: 'Fall 2024',
        year: 2024,
        color: '#10b981'
      },
      {
        userId: user.id,
        name: 'Physics 101',
        code: 'PHYS101',
        instructor: 'Dr. Williams',
        credits: 3,
        semester: 'Fall 2024',
        year: 2024,
        color: '#f59e0b'
      },
      {
        userId: user.id,
        name: 'English Literature',
        code: 'ENG201',
        instructor: 'Prof. Brown',
        credits: 3,
        semester: 'Fall 2024',
        year: 2024,
        color: '#ef4444'
      }
    ];

    const createdCourses = await db.insert(courses).values(sampleCourses).returning();
    console.log('Created courses:', createdCourses.length);

    // Create sample assignments
    const now = new Date();
    const sampleAssignments = [
      {
        userId: user.id,
        courseId: createdCourses[0].id,
        title: 'Programming Assignment 1',
        description: 'Create a basic calculator using Python',
        dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        priority: 'high' as const,
        status: 'pending' as const,
        maxPoints: 100,
        grade: null
      },
      {
        userId: user.id,
        courseId: createdCourses[1].id,
        title: 'Calculus Problem Set 3',
        description: 'Solve integration problems from chapter 5',
        dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        priority: 'medium' as const,
        status: 'in_progress' as const,
        maxPoints: 50,
        grade: null
      },
      {
        userId: user.id,
        courseId: createdCourses[2].id,
        title: 'Lab Report: Motion Analysis',
        description: 'Write a detailed report on the motion analysis experiment',
        dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        priority: 'medium' as const,
        status: 'pending' as const,
        maxPoints: 75,
        grade: null
      },
      {
        userId: user.id,
        courseId: createdCourses[3].id,
        title: 'Essay: Shakespeare Analysis',
        description: 'Write a 1500-word analysis of Hamlet',
        dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        priority: 'low' as const,
        status: 'pending' as const,
        maxPoints: 100,
        grade: null
      },
      {
        userId: user.id,
        courseId: createdCourses[0].id,
        title: 'Midterm Exam',
        description: 'Comprehensive exam covering chapters 1-6',
        dueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (completed)
        priority: 'high' as const,
        status: 'completed' as const,
        maxPoints: 100,
        grade: 87
      }
    ];

    const createdAssignments = await db.insert(assignments).values(sampleAssignments).returning();
    console.log('Created assignments:', createdAssignments.length);

    // Create sample notes
    const sampleNotes = [
      {
        userId: user.id,
        courseId: createdCourses[0].id,
        title: 'Python Basics',
        content: '# Python Basics\n\n## Variables\n- Use descriptive names\n- Snake_case convention\n\n## Functions\n```python\ndef calculate_area(radius):\n    return 3.14159 * radius ** 2\n```\n\n## Key Points\n- Python is interpreted\n- Dynamic typing\n- Indentation matters',
        tags: ['python', 'programming', 'basics'],
        isShared: false
      },
      {
        userId: user.id,
        courseId: createdCourses[1].id,
        title: 'Integration Techniques',
        content: '# Integration Techniques\n\n## By Parts\n∫ u dv = uv - ∫ v du\n\n## Substitution\nLet u = g(x), then du = g\'(x)dx\n\n## Common Integrals\n- ∫ x^n dx = x^(n+1)/(n+1) + C\n- ∫ e^x dx = e^x + C\n- ∫ sin(x) dx = -cos(x) + C',
        tags: ['calculus', 'integration', 'math'],
        isShared: true
      },
      {
        userId: user.id,
        courseId: createdCourses[2].id,
        title: 'Newton\'s Laws',
        content: '# Newton\'s Laws of Motion\n\n## First Law (Inertia)\nAn object at rest stays at rest, an object in motion stays in motion, unless acted upon by an external force.\n\n## Second Law (F = ma)\nThe acceleration of an object is directly proportional to the net force acting on it.\n\n## Third Law (Action-Reaction)\nFor every action, there is an equal and opposite reaction.',
        tags: ['physics', 'mechanics', 'newton'],
        isShared: false
      },
      {
        userId: user.id,
        courseId: createdCourses[3].id,
        title: 'Hamlet Character Analysis',
        content: '# Hamlet Character Analysis\n\n## Hamlet\n- Complex protagonist\n- Struggles with decision-making\n- Philosophical nature\n\n## Key Themes\n- Revenge\n- Madness vs. sanity\n- Mortality\n- Corruption\n\n## Important Quotes\n"To be or not to be, that is the question"\n"Something is rotten in the state of Denmark"',
        tags: ['literature', 'shakespeare', 'hamlet'],
        isShared: true
      }
    ];

    const createdNotes = await db.insert(notes).values(sampleNotes).returning();
    console.log('Created notes:', createdNotes.length);

    // Create sample study group
    const [studyGroup] = await db.insert(studyGroups).values({
      name: 'CS101 Study Group',
      description: 'Weekly study sessions for Computer Science 101',
      courseId: createdCourses[0].id,
      createdBy: user.id,
      maxMembers: 8,
      meetingTime: 'Wednesdays 6:00 PM',
      location: 'Library Room 204'
    }).returning();

    console.log('Created study group:', studyGroup.id);

    // Add user to study group
    await db.insert(studyGroupMembers).values({
      studyGroupId: studyGroup.id,
      userId: user.id,
      role: 'leader' as const
    });

    // Create sample study sessions
    const sampleSessions = [
      {
        userId: user.id,
        courseId: createdCourses[0].id,
        duration: 120, // 2 hours
        date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // yesterday
        notes: 'Reviewed Python syntax and worked on assignment 1'
      },
      {
        userId: user.id,
        courseId: createdCourses[1].id,
        duration: 90, // 1.5 hours
        date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        notes: 'Practiced integration by parts problems'
      },
      {
        userId: user.id,
        courseId: createdCourses[2].id,
        duration: 75, // 1.25 hours
        date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        notes: 'Lab work on motion analysis experiment'
      }
    ];

    await db.insert(studySessions).values(sampleSessions);
    console.log('Created study sessions:', sampleSessions.length);

    console.log('Database seeded successfully!');
    return user;
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}