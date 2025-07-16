import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Plus, Users, MapPin, Calendar, Clock, UserPlus, Settings } from "lucide-react";
import StudyGroupForm from "@/components/study-group-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function StudyGroups() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: studyGroups = [], isLoading } = useQuery({
    queryKey: ["/api/study-groups"],
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["/api/courses"],
  });

  const joinGroup = useMutation({
    mutationFn: async (groupId: number) => {
      const response = await apiRequest("POST", `/api/study-groups/${groupId}/members`, {
        userId: 1, // Mock user ID
        role: "member"
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/study-groups"] });
      toast({
        title: "Joined study group",
        description: "You have successfully joined the study group.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to join study group. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getCourseById = (courseId: number) => {
    return courses.find((course: any) => course.id === courseId);
  };

  const getGroupStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
  };

  const filteredGroups = studyGroups.filter((group: any) => {
    const course = getCourseById(group.courseId);
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          group.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || 
                      (activeTab === "active" && group.isActive) ||
                      (activeTab === "my-groups" && group.createdBy === 1); // Mock user ID
    return matchesSearch && matchesTab;
  });

  if (isLoading) {
    return <div className="p-6">Loading study groups...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Study Groups</h1>
          <p className="text-sm text-gray-500">Join or create study groups to collaborate with peers</p>
        </div>
        <StudyGroupForm trigger={
          <Button className="bg-primary text-white hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        } />
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search study groups..."
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Groups</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="my-groups">My Groups</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredGroups.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No study groups found</p>
                  <p className="text-sm mt-2">Create your first study group to get started</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group: any) => {
                const course = getCourseById(group.courseId);
                const isOwner = group.createdBy === 1; // Mock user ID
                
                return (
                  <Card key={group.id} className="card-hover">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1">{group.name}</CardTitle>
                          {course && (
                            <Badge variant="secondary" className="text-xs">
                              {course.code} - {course.name}
                            </Badge>
                          )}
                        </div>
                        <Badge className={getGroupStatusColor(group.isActive)}>
                          {group.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {group.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {group.description}
                        </p>
                      )}
                      
                      <div className="space-y-2 text-sm text-gray-500">
                        {group.meetingSchedule && (
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{group.meetingSchedule}</span>
                          </div>
                        )}
                        
                        {group.location && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{group.location}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          <span>0/{group.maxMembers} members</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>Created {format(new Date(group.createdAt), "MMM d, yyyy")}</span>
                        </div>
                      </div>
                      
                      {/* Member avatars */}
                      <div className="flex items-center space-x-2">
                        <div className="flex -space-x-2">
                          {/* Placeholder for member avatars */}
                          <Avatar className="w-6 h-6 border-2 border-white">
                            <AvatarFallback className="text-xs">AJ</AvatarFallback>
                          </Avatar>
                        </div>
                        {group.maxMembers > 1 && (
                          <span className="text-xs text-gray-500">
                            +{group.maxMembers - 1} slots available
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 pt-2">
                        {isOwner ? (
                          <Button variant="outline" size="sm" className="flex-1">
                            <Settings className="w-4 h-4 mr-2" />
                            Manage
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            className="flex-1 bg-primary text-white hover:bg-primary/90"
                            onClick={() => joinGroup.mutate(group.id)}
                            disabled={joinGroup.isPending}
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            {joinGroup.isPending ? "Joining..." : "Join Group"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
