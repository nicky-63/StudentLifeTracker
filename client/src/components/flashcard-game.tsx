import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, Plus, Edit, Trash2, Brain, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Flashcard {
  id: number;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  courseId?: number;
  reviewCount: number;
  correctCount: number;
}

export default function FlashcardGame() {
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameMode, setGameMode] = useState<'study' | 'quiz'>('study');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = async () => {
    try {
      const response = await apiRequest('/api/flashcards');
      const flashcards = await response.json();
      setCards(flashcards);
      if (flashcards.length > 0) {
        setCurrentCard(flashcards[0]);
      }
    } catch (error) {
      console.error('Failed to load flashcards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleResponse = async (difficulty: 'easy' | 'medium' | 'hard') => {
    if (!currentCard) return;

    const isCorrect = difficulty === 'easy';
    const newScore = isCorrect ? score + 10 : score;
    const newStreak = isCorrect ? streak + 1 : 0;

    setScore(newScore);
    setStreak(newStreak);

    // Update card statistics
    try {
      await apiRequest(`/api/flashcards/${currentCard.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          reviewCount: currentCard.reviewCount + 1,
          correctCount: currentCard.correctCount + (isCorrect ? 1 : 0),
          difficulty: difficulty
        })
      });
    } catch (error) {
      console.error('Failed to update flashcard:', error);
    }

    // Move to next card
    nextCard();

    if (isCorrect && streak > 0 && streak % 5 === 0) {
      toast({
        title: "Streak Bonus!",
        description: `${streak} correct answers in a row! +${streak * 2} bonus points`,
      });
      setScore(prev => prev + streak * 2);
    }
  };

  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentCard(cards[nextIndex]);
      setIsFlipped(false);
    } else {
      // End of deck
      toast({
        title: "Deck Complete!",
        description: `Final Score: ${score} points • Streak: ${streak}`,
      });
      resetGame();
    }
  };

  const previousCard = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentCard(cards[prevIndex]);
      setIsFlipped(false);
    }
  };

  const resetGame = () => {
    setCurrentIndex(0);
    setCurrentCard(cards[0]);
    setIsFlipped(false);
    setScore(0);
    setStreak(0);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getAccuracy = (card: Flashcard) => {
    if (card.reviewCount === 0) return 0;
    return Math.round((card.correctCount / card.reviewCount) * 100);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading flashcards...</div>;
  }

  if (cards.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No Flashcards Yet</h3>
          <p className="text-gray-600 mb-4">Create your first flashcard to start studying!</p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Flashcard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Score Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold">Score: {score}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-orange-500">🔥</span>
            <span className="font-semibold">Streak: {streak}</span>
          </div>
        </div>
        <Badge variant="outline">
          {currentIndex + 1} / {cards.length}
        </Badge>
      </div>

      {/* Progress Bar */}
      <Progress value={((currentIndex + 1) / cards.length) * 100} className="h-2" />

      {/* Main Flashcard */}
      <Card className="h-80 cursor-pointer transform transition-transform hover:scale-105" onClick={handleCardFlip}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getDifficultyColor(currentCard?.difficulty || 'medium')}`} />
              <span>{isFlipped ? 'Answer' : 'Question'}</span>
            </span>
            <Badge variant="secondary">
              {getAccuracy(currentCard!)}% accuracy
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-xl font-medium mb-4">
              {isFlipped ? currentCard?.back : currentCard?.front}
            </div>
            {!isFlipped && (
              <p className="text-sm text-gray-500">Click to reveal answer</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={previousCard}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={resetGame}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={nextCard}
          disabled={currentIndex === cards.length - 1}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Response Buttons (only show when flipped) */}
      {isFlipped && (
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
            onClick={() => handleResponse('hard')}
          >
            Hard
          </Button>
          <Button
            variant="outline"
            className="border-yellow-300 text-yellow-600 hover:bg-yellow-50"
            onClick={() => handleResponse('medium')}
          >
            Medium
          </Button>
          <Button
            variant="outline"
            className="border-green-300 text-green-600 hover:bg-green-50"
            onClick={() => handleResponse('easy')}
          >
            Easy
          </Button>
        </div>
      )}

      {/* Card Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold">{currentCard?.reviewCount || 0}</div>
              <div className="text-sm text-gray-500">Reviews</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{currentCard?.correctCount || 0}</div>
              <div className="text-sm text-gray-500">Correct</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{getAccuracy(currentCard!)}%</div>
              <div className="text-sm text-gray-500">Accuracy</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}