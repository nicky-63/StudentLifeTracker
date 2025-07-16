import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, BookOpen, Award, Target, BarChart3, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

export default function ProgressPage() {
  const [timeFilter, setTimeFilter] = useState("semester");
  
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ["/api/assignments"],
  });

  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/courses"],
  });

  const { data: studySessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["/api/study-sessions"],
  });

  const calculateCourseProgress = (courseId: number) => {
    const courseAssignments = assignments.filter((a: any) => a.courseId === courseId);
    const completedAssignments = courseAssignments.filter((a: any) => a.status === "completed");
    const totalAssignments = courseAssignments.length;
    
    if (totalAssignments === 0) return { progress: 0, completed: 0, total: 0, grade: 0 };
    
    const progress = (completedAssignments.length / totalAssignments) * 100;
    const totalPoints = completedAssignments.reduce((sum: number, a: any) => sum + (a.grade || 0), 0);
    const maxPoints = completedAssignments.reduce((sum: number, a: any) => sum + (a.maxPoints || 100), 0);
    const grade = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;
    
    return {
      progress: Math.round(progress),
      completed: completedAssignments.length,
      total: totalAssignments,
      grade: Math.round(grade * 100) / 100
    };
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return "text-green-600";
    if (grade >= 80) return "text-blue-600";
    if (grade >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-blue-500";
    if (progress >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const weeklyStudyHours = studySessions.reduce((acc: any, session: any) => {
    const date = new Date(session.date);
    const weekKey = format(date, "yyyy-'W'ww");
    if (!acc[weekKey]) {
      acc[weekKey] = 0;
    }
    acc[weekKey] += session.duration / 60; // Convert minutes to hours
    return acc;
  }, {});

  const recentWeeks = Object.entries(weeklyStudyHours)
    .slice(-8)
    .map(([week, hours]) => ({ week, hours }));

  if (statsLoading || assignmentsLoading || coursesLoading) {
    return <div className="p-6">Loading progress data...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Academic Progress</h1>
          <p className="text-sm text-gray-500">Track your academic performance and goals</p>
        </div>
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semester">This Semester</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Overall GPA</p>
                <p className="text-2xl font-bold text-gray-800">{stats?.overallGPA || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600">Target: 3.8</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Credits Completed</p>
                <p className="text-2xl font-bold text-gray-800">{stats?.completedCredits || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-blue-600">Target: 120</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Assignments Completed</p>
                <p className="text-2xl font-bold text-gray-800">
                  {assignments.filter((a: any) => a.status === "completed").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-purple-600">Total: {assignments.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Study Hours</p>
                <p className="text-2xl font-bold text-gray-800">{stats?.studyHours || 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-orange-600">This week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* GPA Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              GPA Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="chart-container rounded-lg relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm opacity-75">GPA Trend Chart</p>
                  <p className="text-xs opacity-50">Shows semester-by-semester progress</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Study Hours Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Weekly Study Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentWeeks.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No study sessions recorded</p>
              ) : (
                recentWeeks.map(({ week, hours }: any) => (
                  <div key={week} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Week {week.split('W')[1]}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${Math.min((hours / 40) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-800">{hours}h</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Course Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {courses.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No courses found</p>
            ) : (
              courses.map((course: any) => {
                const progress = calculateCourseProgress(course.id);
                return (
                  <div key={course.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {course.code} - {course.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {course.instructor} • {course.credits} credits
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={getGradeColor(progress.grade)}>
                          {progress.grade}%
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Assignment Progress</span>
                        <span>{progress.completed}/{progress.total} completed</span>
                      </div>
                      <Progress 
                        value={progress.progress} 
                        className="h-2"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
