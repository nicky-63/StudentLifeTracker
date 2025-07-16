import { Link, useLocation } from "wouter";
import { Home, FileText, Calendar, StickyNote, TrendingUp, Users, Share2, Settings, Trophy } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [location] = useLocation();

  const menuItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/assignments", icon: FileText, label: "Assignments" },
    { path: "/calendar", icon: Calendar, label: "Calendar" },
    { path: "/notes", icon: StickyNote, label: "Notes" },
    { path: "/progress", icon: TrendingUp, label: "Progress" },
    { path: "/gamification", icon: Trophy, label: "Games & Challenges" },
  ];

  const collaborateItems = [
    { path: "/study-groups", icon: Users, label: "Study Groups" },
    { path: "/shared-notes", icon: Share2, label: "Shared Notes" },
  ];

  return (
    <aside className={`bg-white shadow-lg w-64 min-h-screen sidebar-transition transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} fixed lg:translate-x-0 lg:static z-30`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
            <i className="fas fa-graduation-cap text-white text-sm"></i>
          </div>
          <span className="text-xl font-bold text-gray-800">StudySync</span>
        </div>
      </div>
      
      <nav className="mt-8">
        <div className="px-6 mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Main</h3>
        </div>
        <ul className="space-y-2 px-4">
          {menuItems.map((item) => {
            const isActive = location === item.path;
            return (
              <li key={item.path}>
                <Link href={item.path}>
                  <span className={`flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${
                    isActive 
                      ? 'bg-primary text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}>
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        
        <div className="px-6 mt-8 mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Collaborate</h3>
        </div>
        <ul className="space-y-2 px-4">
          {collaborateItems.map((item) => {
            const isActive = location === item.path;
            return (
              <li key={item.path}>
                <Link href={item.path}>
                  <span className={`flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${
                    isActive 
                      ? 'bg-primary text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}>
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <img 
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=40&h=40" 
            alt="Student profile" 
            className="w-10 h-10 rounded-full" 
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">Alex Johnson</p>
            <p className="text-xs text-gray-500">Computer Science</p>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
