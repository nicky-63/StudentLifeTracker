import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Plus, StickyNote, Edit3, Trash2, Share2 } from "lucide-react";
import NoteForm from "@/components/note-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Notes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["/api/notes"],
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["/api/courses"],
  });

  const deleteNote = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/notes/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Note deleted",
        description: "Note has been deleted successfully.",
      });
    },
  });

  const getCourseById = (courseId: number) => {
    return courses.find((course: any) => course.id === courseId);
  };

  const filteredNotes = notes.filter((note: any) => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || 
                      (activeTab === "shared" && note.isShared) ||
                      (activeTab === "private" && !note.isShared);
    return matchesSearch && matchesTab;
  });

  const groupedNotes = filteredNotes.reduce((acc: any, note: any) => {
    const course = getCourseById(note.courseId);
    const key = course ? `${course.code} - ${course.name}` : "General Notes";
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(note);
    return acc;
  }, {});

  if (isLoading) {
    return <div className="p-6">Loading notes...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notes</h1>
          <p className="text-sm text-gray-500">Create and manage your study notes</p>
        </div>
        <NoteForm trigger={
          <Button className="bg-primary text-white hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        } />
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search notes..."
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
          <TabsTrigger value="all">All Notes</TabsTrigger>
          <TabsTrigger value="private">Private</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {Object.keys(groupedNotes).length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-gray-500">
                  <StickyNote className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No notes found</p>
                  <p className="text-sm mt-2">Create your first note to get started</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedNotes).map(([courseGroup, courseNotes]: [string, any]) => (
                <div key={courseGroup}>
                  <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                    <StickyNote className="w-5 h-5 mr-2" />
                    {courseGroup}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courseNotes.map((note: any) => (
                      <Card key={note.id} className="card-hover">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-base line-clamp-2">
                              {note.title}
                            </CardTitle>
                            <div className="flex items-center space-x-1">
                              {note.isShared && (
                                <Badge variant="secondary" className="text-xs">
                                  <Share2 className="w-3 h-3 mr-1" />
                                  Shared
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <p className="text-sm text-gray-600 line-clamp-3">
                              {note.content}
                            </p>
                            
                            {note.tags && note.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {note.tags.map((tag: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>
                                Updated {format(new Date(note.updatedAt), "MMM d, yyyy")}
                              </span>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  title="Edit note"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                  title="Delete note"
                                  onClick={() => deleteNote.mutate(note.id)}
                                  disabled={deleteNote.isPending}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
