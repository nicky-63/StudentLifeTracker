import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Plus, Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react";
import AssignmentForm from "@/components/assignment-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Assignments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["/api/assignments"],
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["/api/courses"],
  });

  const updateAssignment = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const response = await apiRequest("PUT", `/api/assignments/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Assignment updated",
        description: "Assignment status has been updated successfully.",
      });
    },
  });

  const deleteAssignment = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/assignments/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Assignment deleted",
        description: "Assignment has been deleted successfully.",
      });
    },
  });

  const getCourseById = (courseId: number) => {
    return courses.find((course: any) => course.id === courseId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "overdue":
        return <AlertCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredAssignments = assignments.filter((assignment: any) => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || assignment.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const toggleAssignmentStatus = (assignment: any) => {
    const newStatus = assignment.status === "completed" ? "pending" : "completed";
    updateAssignment.mutate({ id: assignment.id, updates: { status: newStatus } });
  };

  if (isLoading) {
    return <div className="p-6">Loading assignments...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Assignments</h1>
          <p className="text-sm text-gray-500">Manage your assignments and track progress</p>
        </div>
        <AssignmentForm trigger={
          <Button className="bg-primary text-white hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Assignment
          </Button>
        } />
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid gap-4">
            {filteredAssignments.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No assignments found</p>
                    <p className="text-sm mt-2">Create your first assignment to get started</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredAssignments.map((assignment: any) => {
                const course = getCourseById(assignment.courseId);
                const isOverdue = new Date(assignment.dueDate) < new Date() && assignment.status !== "completed";
                const actualStatus = isOverdue ? "overdue" : assignment.status;
                
                return (
                  <Card key={assignment.id} className="card-hover">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">{assignment.title}</h3>
                            <Badge variant={getPriorityColor(assignment.priority)}>
                              {assignment.priority}
                            </Badge>
                            <Badge className={getStatusColor(actualStatus)}>
                              {getStatusIcon(actualStatus)}
                              <span className="ml-1 capitalize">{actualStatus}</span>
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>Due: {format(new Date(assignment.dueDate), "MMM d, yyyy 'at' h:mm a")}</span>
                            </div>
                            {course && (
                              <div>
                                <span className="font-medium">{course.code}</span> - {course.name}
                              </div>
                            )}
                          </div>
                          
                          {assignment.description && (
                            <p className="text-gray-600 mb-3">{assignment.description}</p>
                          )}
                          
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {assignment.type}
                            </Badge>
                            {assignment.grade && assignment.maxPoints && (
                              <Badge variant="outline" className="text-xs">
                                {assignment.grade}/{assignment.maxPoints}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleAssignmentStatus(assignment)}
                            disabled={updateAssignment.isPending}
                          >
                            {assignment.status === "completed" ? "Mark Pending" : "Mark Complete"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteAssignment.mutate(assignment.id)}
                            disabled={deleteAssignment.isPending}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
