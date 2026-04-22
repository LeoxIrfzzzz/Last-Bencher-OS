/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Clock, 
  Settings as SettingsIcon,
  User,
  PlusCircle,
  GraduationCap,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DayOfWeek, TimeSlot, AttendanceRecord, UserSettings, SaturdayOverride } from './types';
import Dashboard from './components/Dashboard';
import TimetableManager from './components/TimetableManager';
import AttendanceTracker from './components/AttendanceTracker';
import Settings from './components/Settings';
import { cn } from './lib/utils';

export default function App() {
  const [view, setView] = useState<'dashboard' | 'attendance' | 'timetable' | 'settings'>('dashboard');
  const [timetable, setTimetable] = useState<TimeSlot[]>(() => {
    const saved = localStorage.getItem('lastbencher_timetable');
    return saved ? JSON.parse(saved) : [];
  });
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('lastbencher_attendance');
    return saved ? JSON.parse(saved) : [];
  });
  const [saturdayOverrides, setSaturdayOverrides] = useState<SaturdayOverride[]>(() => {
    const saved = localStorage.getItem('lastbencher_saturday_overrides');
    return saved ? JSON.parse(saved) : [];
  });
  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('lastbencher_settings');
    return saved ? JSON.parse(saved) : { targetPercentage: 78, name: 'Student' };
  });

  useEffect(() => {
    localStorage.setItem('lastbencher_timetable', JSON.stringify(timetable));
  }, [timetable]);

  useEffect(() => {
    localStorage.setItem('lastbencher_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('lastbencher_saturday_overrides', JSON.stringify(saturdayOverrides));
  }, [saturdayOverrides]);

  useEffect(() => {
    localStorage.setItem('lastbencher_settings', JSON.stringify(userSettings));
  }, [userSettings]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'timetable', label: 'Timetable', icon: Clock },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ] as const;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row p-4 md:p-6 gap-4 md:gap-6 font-sans">
      {/* Navigation / Sidebar */}
      <aside className="fixed bottom-4 left-4 right-4 md:relative md:inset-auto md:w-64 bg-zinc-900 border border-zinc-800 rounded-3xl flex md:flex-col p-4 md:p-8 gap-4 md:gap-10 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-[20px_0_40px_rgba(0,0,0,0.5)] glow-blue z-50">
        <div className="hidden md:flex items-center gap-3 group">
          <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center font-black text-brand-blue border border-zinc-700 shadow-[inset_0_2px_10px_rgba(255,255,255,0.05)] transition-all group-hover:border-brand-blue glow-blue">
            <Zap className="w-6 h-6 glow-blue" />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-white uppercase italic text-glow-blue">
            Lastbencher <br/><span className="text-brand-blue not-italic">OS</span>
          </h1>
        </div>

        <nav className="flex flex-row md:flex-col gap-2 md:gap-4 w-full">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={cn(
                "flex flex-1 md:flex-none items-center justify-center md:justify-start gap-3 md:gap-4 p-3 md:p-5 rounded-2xl transition-all duration-500 group border relative overflow-hidden",
                view === item.id 
                  ? "bg-zinc-850 border-zinc-700 text-white shadow-xl glow-blue" 
                  : "hover:bg-zinc-850/50 border-transparent text-zinc-500 hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform duration-500", view === item.id ? "text-brand-blue scale-110 glow-blue" : "text-zinc-600 group-hover:text-zinc-300 group-hover:scale-110")} />
              <span className="font-black text-[9px] md:text-[11px] uppercase tracking-widest md:tracking-[0.2em]">{item.label}</span>
              {view === item.id && (
                <div className="absolute bottom-1 md:bottom-auto md:right-4 md:top-1/2 md:-translate-y-1/2 w-4 md:w-1 h-1 md:h-5 bg-brand-blue rounded-full glow-blue" />
              )}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex mt-auto pt-6 border-t border-zinc-800 items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-700 border border-zinc-600 flex items-center justify-center text-xs font-bold uppercase ring-2 ring-zinc-800">
            {userSettings.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-zinc-200 truncate">{userSettings.name}</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Connected</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-4 md:gap-6 min-w-0 pb-24 md:pb-0">
        <header className="flex items-center justify-between gap-4 bg-zinc-900 shadow-xl border border-zinc-800 px-6 py-4 rounded-3xl">
          <div className="flex items-center gap-3 md:hidden">
             <div className="w-8 h-8 bg-zinc-950 rounded-lg flex items-center justify-center text-brand-blue border border-zinc-800">
                <Zap className="w-4 h-4" />
             </div>
             <h2 className="text-sm font-black uppercase italic text-white tracking-widest">LB OS</h2>
          </div>
          <div className="hidden md:block">
            <h2 className="text-xl font-bold tracking-tight text-white uppercase italic">{view}</h2>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-0.5">Tactical Deployment</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-zinc-950 px-4 py-2 rounded-xl border border-zinc-800 glow-blue">
              <GraduationCap className="w-4 h-4 text-brand-blue" />
              <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Goal: {userSettings.targetPercentage}%</span>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="h-full"
            >
            {view === 'dashboard' && (
              <Dashboard 
                attendance={attendance} 
                timetable={timetable} 
                settings={userSettings} 
              />
            )}
            {view === 'timetable' && (
              <TimetableManager 
                timetable={timetable} 
                setTimetable={setTimetable} 
              />
            )}
            {view === 'attendance' && (
              <AttendanceTracker 
                attendance={attendance} 
                setAttendance={setAttendance} 
                timetable={timetable}
                saturdayOverrides={saturdayOverrides}
                setSaturdayOverrides={setSaturdayOverrides}
              />
            )}
            {view === 'settings' && (
              <Settings 
                settings={userSettings} 
                setSettings={setUserSettings} 
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="mt-auto py-8 text-center border-t border-zinc-900">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em] opacity-40">
          LastbencherOS <span className="mx-2 text-zinc-800">/</span> Built by Mohammed Irfaan
        </p>
      </footer>
    </div>
  </div>
);
}

