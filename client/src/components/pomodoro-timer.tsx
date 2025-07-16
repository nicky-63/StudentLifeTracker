import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Settings, Coffee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface PomodoroTimerProps {
  onSessionComplete?: (duration: number, type: string) => void;
}

export default function PomodoroTimer({ onSessionComplete }: PomodoroTimerProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<'work' | 'short_break' | 'long_break'>('work');
  const [sessionCount, setSessionCount] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [totalSessions, setTotalSessions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const sessionDurations = {
    work: 25 * 60,
    short_break: 5 * 60,
    long_break: 15 * 60
  };

  const sessionLabels = {
    work: 'Focus Time',
    short_break: 'Short Break',
    long_break: 'Long Break'
  };

  const sessionColors = {
    work: 'bg-red-500',
    short_break: 'bg-green-500',
    long_break: 'bg-blue-500'
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            handleSessionComplete();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft]);

  const handleSessionComplete = async () => {
    setIsActive(false);
    const duration = sessionDurations[sessionType];
    
    // Play notification sound (browser notification)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${sessionLabels[sessionType]} Complete!`, {
        body: sessionType === 'work' ? 'Time for a break!' : 'Time to focus!',
        icon: '/icon-192x192.svg'
      });
    }

    // Save session to database
    try {
      await apiRequest('/api/pomodoro-sessions', {
        method: 'POST',
        body: JSON.stringify({
          courseId: selectedCourse ? parseInt(selectedCourse) : null,
          duration: duration / 60, // Convert to minutes
          type: sessionType,
          isCompleted: true,
          startTime: new Date(Date.now() - duration * 1000).toISOString(),
          endTime: new Date().toISOString()
        })
      });

      setTotalSessions(prev => prev + 1);
      
      if (sessionType === 'work') {
        setSessionCount(prev => prev + 1);
      }

      onSessionComplete?.(duration / 60, sessionType);
      
      toast({
        title: "Session Complete!",
        description: `${sessionLabels[sessionType]} finished. Great job!`,
      });
    } catch (error) {
      console.error('Failed to save pomodoro session:', error);
    }

    // Auto-switch to next session type
    if (sessionType === 'work') {
      const nextType = sessionCount > 0 && sessionCount % 4 === 0 ? 'long_break' : 'short_break';
      setSessionType(nextType);
      setTimeLeft(sessionDurations[nextType]);
    } else {
      setSessionType('work');
      setTimeLeft(sessionDurations.work);
    }
  };

  const toggleTimer = () => {
    if (!isActive && timeLeft === sessionDurations[sessionType]) {
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(sessionDurations[sessionType]);
  };

  const changeSessionType = (type: 'work' | 'short_break' | 'long_break') => {
    setSessionType(type);
    setTimeLeft(sessionDurations[type]);
    setIsActive(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progress = ((sessionDurations[sessionType] - timeLeft) / sessionDurations[sessionType]) * 100;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${sessionColors[sessionType]}`} />
            <span>{sessionLabels[sessionType]}</span>
          </span>
          <Badge variant="outline">{totalSessions} sessions today</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="text-center">
          <div className="text-6xl font-mono font-bold text-gray-800 mb-4">
            {formatTime(timeLeft)}
          </div>
          <Progress value={progress} className="h-2 mb-4" />
          <div className="text-sm text-gray-500">
            Session {sessionCount + 1} • {sessionCount} completed
          </div>
        </div>

        {/* Course Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Study Subject (Optional)</label>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger>
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Computer Science 101</SelectItem>
              <SelectItem value="2">Mathematics 201</SelectItem>
              <SelectItem value="3">Physics 101</SelectItem>
              <SelectItem value="4">English Literature</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={resetTimer}
            disabled={timeLeft === sessionDurations[sessionType]}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            onClick={toggleTimer}
            size="lg"
            className="px-8"
            variant={isActive ? "destructive" : "default"}
          >
            {isActive ? (
              <>
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Start
              </>
            )}
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Session Type Selector */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={sessionType === 'work' ? 'default' : 'outline'}
            size="sm"
            onClick={() => changeSessionType('work')}
            disabled={isActive}
          >
            Work
          </Button>
          <Button
            variant={sessionType === 'short_break' ? 'default' : 'outline'}
            size="sm"
            onClick={() => changeSessionType('short_break')}
            disabled={isActive}
          >
            <Coffee className="w-4 h-4 mr-1" />
            Short
          </Button>
          <Button
            variant={sessionType === 'long_break' ? 'default' : 'outline'}
            size="sm"
            onClick={() => changeSessionType('long_break')}
            disabled={isActive}
          >
            Long
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}