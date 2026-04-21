/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { AttendanceRecord, TimeSlot, UserSettings } from '../types';
import { calculateStats } from '../lib/attendance';
import { AlertCircle, CheckCircle2, TrendingUp, CalendarDays, PieChart as PieChartIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { eachDayOfInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, isWithinInterval, format, startOfDay, endOfDay } from 'date-fns';

interface Props {
  attendance: AttendanceRecord[];
  timetable: TimeSlot[];
  settings: UserSettings;
}

export function calculateDashboardStats(
  records: AttendanceRecord[],
  targetPercentage: number,
  range: 'all' | 'week' | 'month' | 'day' = 'all'
) {
  const now = new Date();
  
  const filteredRecords = records.filter(r => {
    if (range === 'all') return true;
    const date = parseISO(r.date);
    if (range === 'day') {
      return isWithinInterval(date, { 
        start: startOfDay(now), 
        end: endOfDay(now) 
      });
    }
    if (range === 'week') {
      return isWithinInterval(date, { 
        start: startOfWeek(now), 
        end: endOfWeek(now) 
      });
    }
    if (range === 'month') {
      return isWithinInterval(date, { 
        start: startOfMonth(now), 
        end: endOfMonth(now) 
      });
    }
    return true;
  });

  const stats = calculateStats(filteredRecords, targetPercentage);
  return stats;
}

export default function Dashboard({ attendance, timetable, settings }: Props) {
  const [range, setRange] = useState<'all' | 'week' | 'month' | 'day'>('all');
  const stats = useMemo(() => calculateDashboardStats(attendance, settings.targetPercentage, range), [attendance, settings, range]);

  const pieData = [
    { name: 'Present', value: stats.presentCount, color: '#22c55e' },
    { name: 'Absent', value: stats.absentCount, color: '#ef4444' },
  ];

  const totalForPie = stats.presentCount + stats.absentCount;
  const presentDeg = totalForPie === 0 ? 0 : (stats.presentCount / totalForPie) * 360;

  const chartData = useMemo(() => {
    // Group attendance by date for a simple line chart trend
    const daily = attendance.reduce((acc, curr) => {
      acc[curr.date] = (acc[curr.date] || 0) + (curr.status === 'present' ? 1 : 0);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(daily)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7) // Last 7 days
      .map(([date, count]) => ({
        date: date.split('-').slice(1).join('/'),
        count
      }));
  }, [attendance]);

  return (
    <div className="flex flex-col h-full gap-8">
      <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 p-2 rounded-2xl self-start overflow-x-auto max-w-full shadow-lg">
        {(['all', 'month', 'week', 'day'] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={cn(
              "px-6 md:px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border border-transparent",
              range === r 
                ? "bg-zinc-950 text-white border-zinc-700 glow-blue ring-1 ring-brand-blue/30" 
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
            )}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 lg:grid-rows-6 gap-6 md:gap-8 flex-1">
        {/* Percentage Card (Main Metric) */}
        <div className="col-span-12 lg:col-span-4 row-span-4 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-6 md:p-12 flex flex-col justify-between shadow-2xl relative overflow-hidden group glow-blue">
          <div className="relative z-10">
            <h2 className="text-zinc-500 text-[11px] font-black uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-brand-blue rounded-full glow-blue" />
              System Efficiency
            </h2>
            <p className="text-sm text-zinc-400 font-bold uppercase tracking-widest opacity-60">Target: {settings.targetPercentage}%</p>
          </div>
          
          <div className="relative flex items-center justify-center py-8 md:py-12">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <div className={cn(
                 "w-64 h-64 rounded-full blur-[80px]",
                 stats.percentage < settings.targetPercentage ? "bg-brand-red/20" : "bg-brand-green/20"
               )} />
            </div>
            <svg className="w-64 h-64 transform -rotate-90 relative z-10">
              <circle cx="128" cy="128" r="110" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-zinc-800" />
              <circle 
                cx="128" 
                cy="128" 
                r="110" 
                stroke="currentColor" 
                strokeWidth="14" 
                fill="transparent" 
                strokeDasharray="691" 
                strokeDashoffset={691 - (691 * stats.percentage) / 100}
                className={cn(
                  "transition-all duration-[1.5s] ease-in-out", 
                  stats.percentage < settings.targetPercentage ? "text-brand-red drop-shadow-[0_0_8px_rgba(255,0,68,0.4)]" : "text-brand-green drop-shadow-[0_0_8px_rgba(0,255,102,0.4)]"
                )}
                strokeLinecap="round" 
              />
            </svg>
            <div className="absolute flex flex-col items-center z-20">
              <span className={cn(
                "text-7xl font-black tracking-tighter tabular-nums drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]",
                stats.percentage < settings.targetPercentage ? "text-brand-red text-glow-red" : "text-brand-green text-glow-green"
              )}>{Math.round(stats.percentage)}%</span>
              <div className={cn(
                "h-px w-12 my-3",
                stats.percentage < settings.targetPercentage ? "bg-brand-red glow-red" : "bg-brand-green glow-green"
              )} />
              <span className={cn(
                "text-[11px] font-black uppercase tracking-[0.3em]",
                stats.percentage < settings.targetPercentage ? "text-brand-red font-black" : "text-brand-green font-black"
              )}>
                {stats.percentage < settings.targetPercentage ? "CRITICAL FAILURE" : "SYSTEM STABLE"}
              </span>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-inner relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className={cn("w-5 h-5", stats.percentage < settings.targetPercentage ? "text-brand-red glow-red" : "text-brand-green glow-green")} />
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Tactical Guidance</p>
            </div>
            <p className="text-zinc-200 text-sm leading-relaxed font-bold italic border-l-2 border-zinc-800 pl-4 py-1">
              {stats.percentage < settings.targetPercentage 
                ? `Immediate mitigation required. Register attendance for the next ${stats.requiredToReachTarget} sessions.` 
                : `Operational redundancy active. ${stats.canBunk} sessions may be deferred while maintaining compliance.`}
            </p>
          </div>
        </div>

        {/* Bunk Status Card (Highlight) */}
        <div className={cn(
          "col-span-12 lg:col-span-3 row-span-2 rounded-[2.5rem] p-6 md:p-12 flex flex-col justify-between shadow-2xl transition-all duration-700 group relative border border-transparent",
          stats.percentage >= settings.targetPercentage ? "bg-zinc-900 border-zinc-700/50 glow-blue" : "bg-zinc-950 border-zinc-800 glow-red"
        )}>
          <div className="flex justify-between items-start">
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">Bunk Capacity</h2>
            <div className={cn("px-2 py-1 rounded-md text-[9px] font-black", stats.percentage >= settings.targetPercentage ? "bg-brand-blue/20 text-brand-blue glow-blue" : "bg-brand-red/20 text-brand-red glow-red")}>
              {stats.percentage >= settings.targetPercentage ? "ACTIVE" : "LOCKED"}
            </div>
          </div>
          <div>
            <p className={cn(
              "text-8xl font-black tracking-tighter tabular-nums",
              stats.percentage >= settings.targetPercentage ? "text-white text-glow-blue" : "text-brand-red text-glow-red"
            )}>{stats.canBunk}</p>
            <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mt-4 leading-tight">
              {stats.percentage >= settings.targetPercentage 
                ? "Sessions remaining in safe-zone." 
                : "Zero session redundancy."}
            </p>
          </div>
          <div className={cn("absolute bottom-0 left-0 h-1 transition-all duration-1000", stats.percentage >= settings.targetPercentage ? "bg-brand-blue glow-blue" : "bg-brand-red glow-red")} style={{ width: stats.percentage >= settings.targetPercentage ? '100%' : '100%' }} />
        </div>

        {/* Pie Chart Card (New) */}
        <div className="col-span-12 lg:col-span-5 row-span-2 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-6 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-8 shadow-2xl glow-blue group relative overflow-hidden">
          <div className="relative w-32 h-32 shrink-0">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={pieData}
                   cx="50%"
                   cy="50%"
                   innerRadius={40}
                   outerRadius={60}
                   paddingAngle={8}
                   dataKey="value"
                   stroke="none"
                 >
                   {pieData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} className="drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]" />
                   ))}
                 </Pie>
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex items-center justify-center">
               <PieChartIcon className="w-8 h-8 text-zinc-800 glow-blue transition-transform group-hover:scale-110 duration-500" />
             </div>
          </div>
          <div className="flex-1 space-y-5">
             <h2 className="text-zinc-500 text-[11px] font-black uppercase tracking-[0.4em] text-glow-blue italic">Session Integrity</h2>
             <div className="space-y-4">
               <div className="flex items-center justify-between bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50">
                 <div className="flex items-center gap-3">
                   <div className="w-2.5 h-2.5 rounded-full bg-brand-green glow-green" />
                   <span className="text-[11px] font-black tracking-widest text-zinc-400 uppercase">Present</span>
                 </div>
                 <span className="text-sm font-black text-white text-glow-green">{stats.presentCount}</span>
               </div>
               <div className="flex items-center justify-between bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50">
                 <div className="flex items-center gap-3">
                   <div className="w-2.5 h-2.5 rounded-full bg-brand-red glow-red" />
                   <span className="text-[11px] font-black tracking-widest text-zinc-400 uppercase">Absent</span>
                 </div>
                 <span className="text-sm font-black text-white text-glow-red">{stats.absentCount}</span>
               </div>
             </div>
          </div>
        </div>

      {/* Trend Card (Big) */}
      <div className="col-span-12 lg:col-span-5 row-span-4 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-6 md:p-10 shadow-2xl glow-blue overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="flex justify-between items-center mb-10 relative z-10">
          <h2 className="text-white text-xl font-black uppercase tracking-tighter italic">Weekly Activity Trend</h2>
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl glow-blue">
            <TrendingUp className="w-4 h-4 text-brand-blue glow-blue" />
            <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">7-Day Log</span>
          </div>
        </div>
        <div className="h-[240px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1c1c1c" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#525252', fontSize: 10, fontWeight: 900 }} 
                dy={12}
              />
              <YAxis 
                hide
              />
              <Tooltip 
                cursor={{ fill: '#0d0d0d' }}
                contentStyle={{ 
                  backgroundColor: '#050505', 
                  borderRadius: '16px', 
                  border: '1px solid #1c1c1c',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  fontSize: '11px',
                  fontWeight: '900',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}
              />
              <Bar 
                dataKey="count" 
                name="Present" 
                fill="#00aaff" 
                radius={[6, 6, 0, 0]} 
                barSize={32}
              >
                {chartData.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === chartData.length - 1 ? '#00aaff' : '#1c1c1c'} 
                    className={index === chartData.length - 1 ? "drop-shadow-[0_0_10px_rgba(0,170,255,0.3)]" : ""} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap Card (Small) */}
      <div className="col-span-12 lg:col-span-3 row-span-4 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-6 md:p-10 flex flex-col shadow-2xl glow-blue">
        <h2 className="text-zinc-500 text-[11px] font-black uppercase tracking-[0.4em] mb-8 italic">Engagement Heatmap</h2>
        <div className="flex-1 flex flex-col justify-between">
          <div className="grid grid-cols-7 gap-3">
            {['S','M','T','W','T','F','S'].map((d, i) => (
              <div key={`${d}-${i}`} className="text-[10px] text-zinc-600 font-black text-center mb-2 tracking-widest">{d}</div>
            ))}
            {/* Simple dummy grid for visual filler matching design */}
            {Array.from({ length: 21 }).map((_, i) => (
              <div key={i} className={cn(
                "h-7 rounded-lg transition-all duration-500 border border-transparent hover:scale-110",
                i % 3 === 0 ? "bg-brand-green/30 border-brand-green/20 glow-green" : i % 5 === 0 ? "bg-brand-red/30 border-brand-red/20 glow-red" : "bg-zinc-950 border-zinc-800"
              )} />
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Consistency</span>
              <span className="text-xs font-black text-white">High</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Avg. Daily</span>
              <span className="text-xs font-black text-white">{Math.round(stats.presentCount / 7 || 0)} Classes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
