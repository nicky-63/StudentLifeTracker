import { Card, CardContent } from "@/components/ui/card";
import { ExclamationTriangleIcon, ChartBarIcon, ClockIcon, BookOpenIcon } from "@heroicons/react/24/outline";

interface StatsCardsProps {
  stats: {
    assignmentsDue: number;
    currentGPA: number;
    studyHours: number;
    activeCourses: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Assignments Due",
      value: stats.assignmentsDue,
      icon: ExclamationTriangleIcon,
      color: "red",
      subtitle: "2 due today",
      bgColor: "bg-red-100",
      textColor: "text-red-600",
    },
    {
      title: "Current GPA",
      value: stats.currentGPA,
      icon: ChartBarIcon,
      color: "green",
      subtitle: "↑ 0.1 from last semester",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
    },
    {
      title: "Study Hours",
      value: stats.studyHours,
      icon: ClockIcon,
      color: "blue",
      subtitle: "This week",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      title: "Active Courses",
      value: stats.activeCourses,
      icon: BookOpenIcon,
      color: "purple",
      subtitle: "Fall 2024",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <Card key={index} className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              </div>
              <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                <card.icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
            </div>
            <div className="mt-4">
              <span className={`text-sm ${card.textColor}`}>{card.subtitle}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
