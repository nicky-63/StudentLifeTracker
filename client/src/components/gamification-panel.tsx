import { useQuery } from "@tanstack/react-query";
import { Trophy, Target, Flame, Star, BookOpen, Clock, Award, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export default function GamificationPanel() {
  const { data: userStats, isLoading } = useQuery({
    queryKey: ["/api/user-stats"],
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ["/api/challenges/active"],
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ["/api/achievements/recent"],
  });

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  const levelProgress = userStats ? ((userStats.totalPoints % 1000) / 1000) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Level and Stats */}
      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <Star className="w-6 h-6" />
                <h2 className="text-2xl font-bold">Level {userStats?.level || 1}</h2>
              </div>
              <p className="text-purple-100 mt-1">{userStats?.totalPoints || 0} XP</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-orange-300" />
                <span className="text-lg font-semibold">{userStats?.studyStreak || 0}</span>
              </div>
              <p className="text-purple-100 text-sm">Day Streak</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-purple-100 mb-1">
              <span>Progress to Level {(userStats?.level || 1) + 1}</span>
              <span>{Math.floor(levelProgress)}%</span>
            </div>
            <Progress value={levelProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Active Challenges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Active Challenges</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {challenges.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No active challenges</p>
            ) : (
              challenges.map((challenge: any) => (
                <div key={challenge.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant={challenge.type === 'daily' ? 'default' : 'secondary'}>
                        {challenge.type}
                      </Badge>
                      <h3 className="font-medium">{challenge.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{challenge.progress}/{challenge.target}</span>
                      </div>
                      <Progress value={(challenge.progress / challenge.target) * 100} className="h-1" />
                    </div>
                  </div>
                  <div className="ml-4 text-center">
                    <div className="flex items-center space-x-1 text-yellow-600">
                      <Trophy className="w-4 h-4" />
                      <span className="text-sm font-medium">{challenge.points}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5" />
            <span>Recent Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {achievements.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No achievements yet</p>
            ) : (
              achievements.map((achievement: any) => (
                <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">{achievement.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{achievement.name}</h3>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                  </div>
                  <div className="flex items-center space-x-1 text-yellow-600">
                    <Trophy className="w-4 h-4" />
                    <span className="text-sm font-medium">{achievement.points}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{userStats?.assignmentsCompleted || 0}</div>
            <div className="text-sm text-gray-500">Assignments Done</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{Math.floor((userStats?.totalStudyTime || 0) / 60)}h</div>
            <div className="text-sm text-gray-500">Study Time</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}