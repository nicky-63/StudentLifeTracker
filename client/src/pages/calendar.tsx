import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth, addMonths, subMonths } from "date-fns";
import AssignmentForm from "@/components/assignment-form";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["/api/assignments"],
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["/api/courses"],
  });

  const getCourseById = (courseId: number) => {
    return courses.find((course: any) => course.id === courseId);
  };

  const getAssignmentsForDate = (date: Date) => {
    return assignments.filter((assignment: any) => 
      isSameDay(new Date(assignment.dueDate), date)
    );
  };

  const getSelectedDateAssignments = () => {
    return getAssignmentsForDate(selectedDate);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading calendar...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Calendar</h1>
          <p className="text-sm text-gray-500">View your assignments and schedule</p>
        </div>
        <AssignmentForm trigger={
          <Button className="bg-primary text-white hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Assignment
          </Button>
        } />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {format(currentDate, "MMMM yyyy")}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map(day => {
                  const dayAssignments = getAssignmentsForDate(day);
                  const isSelected = isSameDay(day, selectedDate);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  
                  return (
                    <div
                      key={day.toString()}
                      className={`
                        min-h-[80px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors
                        ${isSelected ? 'bg-blue-50 border-blue-300' : ''}
                        ${!isCurrentMonth ? 'text-gray-400 bg-gray-50' : ''}
                        ${isToday(day) ? 'bg-blue-100 border-blue-400' : ''}
                      `}
                      onClick={() => setSelectedDate(day)}
                    >
                      <div className={`text-sm font-medium ${isToday(day) ? 'text-blue-600' : ''}`}>
                        {format(day, 'd')}
                      </div>
                      <div className="mt-1 space-y-1">
                        {dayAssignments.slice(0, 2).map((assignment: any) => {
                          const course = getCourseById(assignment.courseId);
                          return (
                            <div
                              key={assignment.id}
                              className={`text-xs px-2 py-1 rounded truncate ${getPriorityColor(assignment.priority)}`}
                              title={assignment.title}
                            >
                              {assignment.title}
                            </div>
                          );
                        })}
                        {dayAssignments.length > 2 && (
                          <div className="text-xs text-gray-500 px-2">
                            +{dayAssignments.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2" />
                {format(selectedDate, "MMMM d, yyyy")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getSelectedDateAssignments().length === 0 ? (
                  <p className="text-sm text-gray-500">No assignments for this date</p>
                ) : (
                  getSelectedDateAssignments().map((assignment: any) => {
                    const course = getCourseById(assignment.courseId);
                    return (
                      <div key={assignment.id} className="border-l-4 border-blue-500 pl-3 py-2">
                        <h4 className="font-medium text-sm">{assignment.title}</h4>
                        <p className="text-xs text-gray-500">
                          {course ? `${course.code} - ${course.name}` : "No course"}
                        </p>
                        <p className="text-xs text-gray-400">
                          Due: {format(new Date(assignment.dueDate), "h:mm a")}
                        </p>
                        <div className="flex items-center mt-1 space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {assignment.type}
                          </Badge>
                          <Badge className={`text-xs ${getPriorityColor(assignment.priority)}`}>
                            {assignment.priority}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assignments
                  .filter((assignment: any) => {
                    const dueDate = new Date(assignment.dueDate);
                    const weekFromNow = new Date();
                    weekFromNow.setDate(weekFromNow.getDate() + 7);
                    return dueDate <= weekFromNow && dueDate >= new Date();
                  })
                  .slice(0, 5)
                  .map((assignment: any) => {
                    const course = getCourseById(assignment.courseId);
                    return (
                      <div key={assignment.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{assignment.title}</h4>
                          <p className="text-xs text-gray-500">
                            {course ? course.code : "No course"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-600">
                            {format(new Date(assignment.dueDate), "MMM d")}
                          </p>
                          <Badge className={`text-xs ${getPriorityColor(assignment.priority)}`}>
                            {assignment.priority}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
