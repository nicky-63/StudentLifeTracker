import { useQuery } from "@tanstack/react-query";
import { Menu, Search, Bell, Database } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import StatsCards from "@/components/stats-cards";
import AssignmentForm from "@/components/assignment-form";
import NoteForm from "@/components/note-form";
import StudyGroupForm from "@/components/study-group-form";
import { format, isToday, isTomorrow, isThisWeek } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();
  
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: upcomingAssignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ["/api/assignments/upcoming"],
  });

  const { data: recentNotes = [], isLoading: notesLoading } = useQuery({
    queryKey: ["/api/notes/recent"],
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["/api/courses"],
  });

  const handleSeedDatabase = async () => {
    try {
      const response = await apiRequest("/api/seed", {
        method: "POST",
      });
      
      // Invalidate all cache to refresh data
      queryClient.invalidateQueries();
      
      toast({
        title: "Success!",
        description: "Sample data added successfully. The app now has courses, assignments, and notes to explore.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add sample data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getAssignmentIcon = (type: string) => {
    switch (type) {
      case "exam":
        return "fa-file-alt";
      case "quiz":
        return "fa-question-circle";
      case "project":
        return "fa-code";
      default:
        return "fa-file-alt";
    }
  };

  const getAssignmentColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "red";
      case "medium":
        return "yellow";
      case "low":
        return "blue";
      default:
        return "blue";
    }
  };

  const formatDueDate = (date: string) => {
    const dueDate = new Date(date);
    if (isToday(dueDate)) return "Due Today";
    if (isTomorrow(dueDate)) return "Due Tomorrow";
    if (isThisWeek(dueDate)) return `Due ${format(dueDate, "EEEE")}`;
    return `Due ${format(dueDate, "MMM d")}`;
  };

  const getCourseById = (courseId: number) => {
    return courses.find((course: any) => course.id === courseId);
  };

  if (statsLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back, Alex!</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Search assignments, notes..." 
                className="w-64 pl-10 pr-4 py-2"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="p-6">
        {/* Stats Cards */}
        <StatsCards stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Upcoming Assignments */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Upcoming Assignments</h2>
                <Button variant="link" className="text-primary hover:text-primary/80 text-sm font-medium">
                  View All
                </Button>
              </div>
              
              <div className="space-y-4">
                {assignmentsLoading ? (
                  <div>Loading assignments...</div>
                ) : upcomingAssignments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-4">No upcoming assignments</p>
                    <Button 
                      onClick={handleSeedDatabase}
                      variant="outline"
                      size="sm"
                      className="text-primary border-primary hover:bg-primary hover:text-white"
                    >
                      <Database className="w-4 h-4 mr-2" />
                      Add Sample Data
                    </Button>
                  </div>
                ) : (
                  upcomingAssignments.map((assignment: any) => {
                    const course = getCourseById(assignment.courseId);
                    const color = getAssignmentColor(assignment.priority);
                    return (
                      <div key={assignment.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center`}>
                          <i className={`fas ${getAssignmentIcon(assignment.type)} text-${color}-600`}></i>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800">{assignment.title}</h3>
                          <p className="text-sm text-gray-500">
                            {course ? `${course.code} - ${course.name}` : "No course"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium text-${color}-600`}>
                            {formatDueDate(assignment.dueDate)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(assignment.dueDate), "h:mm a")}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Schedule */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">This Week</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">Oct 23 - 29</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {courses.slice(0, 3).map((course: any, index: number) => (
                  <div key={course.id} className="flex items-center space-x-4">
                    <div className="w-16 text-center">
                      <p className="text-xs text-gray-500">
                        {["MON", "TUE", "WED"][index]}
                      </p>
                      <p className="text-sm font-medium text-gray-800">
                        {23 + index}
                      </p>
                    </div>
                    <div className="flex-1">
                      <div className={`border-l-4 border-${course.color || "blue"}-500 p-3 rounded bg-${course.color || "blue"}-50`}>
                        <h4 className={`font-medium text-${course.color || "blue"}-900`}>
                          {course.code} - {course.name}
                        </h4>
                        <p className={`text-sm text-${course.color || "blue"}-600`}>
                          {["10:00 AM - 11:30 AM", "2:00 PM - 4:00 PM", "9:00 AM - 10:30 AM"][index]}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress Chart */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Academic Progress</h2>
                  <select className="text-sm border border-gray-300 rounded-lg px-3 py-1">
                    <option value="semester">This Semester</option>
                    <option value="year">This Year</option>
                    <option value="all">All Time</option>
                  </select>
                </div>
                
                <div className="chart-container rounded-lg relative mb-4">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <i className="fas fa-chart-area text-4xl mb-2 opacity-50"></i>
                      <p className="text-sm opacity-75">GPA Trend Chart</p>
                      <p className="text-xs opacity-50">Interactive chart showing semester progress</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">{stats?.completedCredits || 0}</p>
                    <p className="text-sm text-gray-500">Credits Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">{stats?.overallGPA || 0}</p>
                    <p className="text-sm text-gray-500">Overall GPA</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">{stats?.semesterGPA || 0}</p>
                    <p className="text-sm text-gray-500">Semester GPA</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Recent Notes */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <AssignmentForm />
                  <NoteForm />
                  <StudyGroupForm />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Notes</h3>
                <div className="space-y-3">
                  {notesLoading ? (
                    <div>Loading notes...</div>
                  ) : recentNotes.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No recent notes
                    </div>
                  ) : (
                    recentNotes.map((note: any) => {
                      const course = getCourseById(note.courseId);
                      const colors = ["blue", "green", "purple"];
                      const color = colors[note.id % colors.length];
                      return (
                        <div key={note.id} className={`border-l-4 border-${color}-500 pl-4 py-2`}>
                          <h4 className="font-medium text-gray-800 text-sm">{note.title}</h4>
                          <p className="text-xs text-gray-500">
                            {course ? course.code : "General"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {format(new Date(note.updatedAt), "MMM d, h:mm a")}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
