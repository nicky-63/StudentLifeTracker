import { useState } from "react";
import { Trophy, Target, Gamepad2, Timer, Brain, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import GamificationPanel from "@/components/gamification-panel";
import PomodoroTimer from "@/components/pomodoro-timer";
import FlashcardGame from "@/components/flashcard-game";

export default function Gamification() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Study Games & Challenges</h1>
        <p className="text-gray-600">Make learning fun with gamified study tools and challenges</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Trophy className="w-4 h-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="pomodoro" className="flex items-center space-x-2">
            <Timer className="w-4 h-4" />
            <span>Focus Timer</span>
          </TabsTrigger>
          <TabsTrigger value="flashcards" className="flex items-center space-x-2">
            <Brain className="w-4 h-4" />
            <span>Flashcards</span>
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>Challenges</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gamification Panel */}
            <div className="lg:col-span-2">
              <GamificationPanel />
            </div>

            {/* Quick Games */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Gamepad2 className="w-5 h-5" />
                    <span>Quick Games</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => setActiveTab("pomodoro")}
                  >
                    <Timer className="w-4 h-4 mr-2" />
                    Start Focus Session
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => setActiveTab("flashcards")}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Practice Flashcards
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => setActiveTab("challenges")}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    View Challenges
                  </Button>
                </CardContent>
              </Card>

              {/* Daily Streak */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-orange-500" />
                    <span>Daily Streak</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-500 mb-2">7</div>
                    <p className="text-sm text-gray-600">Days in a row</p>
                    <div className="flex justify-center space-x-1 mt-3">
                      {[...Array(7)].map((_, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs"
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pomodoro" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PomodoroTimer />
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Today's Focus</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">2h 30m</div>
                      <p className="text-sm text-gray-600">Total focus time</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">6</div>
                      <p className="text-sm text-gray-600">Completed sessions</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">3</div>
                      <p className="text-sm text-gray-600">Breaks taken</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="flashcards" className="space-y-6">
          <FlashcardGame />
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Daily Challenges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  <span>Daily Challenges</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800">Study 30 minutes</h4>
                  <p className="text-sm text-blue-600">Progress: 20/30 minutes</p>
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '67%' }}></div>
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800">Complete 3 assignments</h4>
                  <p className="text-sm text-green-600">Progress: 2/3 assignments</p>
                  <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '67%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Challenges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-purple-500" />
                  <span>Weekly Challenges</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-800">Study 10 hours</h4>
                  <p className="text-sm text-purple-600">Progress: 6.5/10 hours</p>
                  <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-800">Take 50 notes</h4>
                  <p className="text-sm text-orange-600">Progress: 32/50 notes</p>
                  <div className="w-full bg-orange-200 rounded-full h-2 mt-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '64%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Challenges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-red-500" />
                  <span>Monthly Challenges</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-red-50 rounded-lg">
                  <h4 className="font-medium text-red-800">Maintain 20-day streak</h4>
                  <p className="text-sm text-red-600">Progress: 7/20 days</p>
                  <div className="w-full bg-red-200 rounded-full h-2 mt-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <h4 className="font-medium text-indigo-800">Complete 100 flashcards</h4>
                  <p className="text-sm text-indigo-600">Progress: 23/100 cards</p>
                  <div className="w-full bg-indigo-200 rounded-full h-2 mt-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '23%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}