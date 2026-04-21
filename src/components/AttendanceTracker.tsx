/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  format, 
  addDays, 
  subDays, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameDay, 
  addMonths, 
  subMonths,
  eachDayOfInterval,
  getDay
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  Minus,
  Calendar as CalendarIcon,
  Circle,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';
import { AttendanceRecord, DayOfWeek, TimeSlot, SaturdayOverride, SaturdayOverrideType } from '../types';
import { clsx } from 'clsx';
import { Sparkles, HelpCircle } from 'lucide-react';

interface Props {
  attendance: AttendanceRecord[];
  setAttendance: (records: AttendanceRecord[]) => void;
  timetable: TimeSlot[];
  saturdayOverrides: SaturdayOverride[];
  setSaturdayOverrides: (ovr: SaturdayOverride[]) => void;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AttendanceTracker({ 
  attendance, 
  setAttendance, 
  timetable,
  saturdayOverrides,
  setSaturdayOverrides
}: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  const getSaturdayOverride = (date: Date): SaturdayOverrideType => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return saturdayOverrides.find(o => o.date === dateStr)?.followDay || 'Default';
  };

  const setSaturdayOverride = (date: Date, followDay: SaturdayOverrideType) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const existing = saturdayOverrides.filter(o => o.date !== dateStr);
    if (followDay === 'Default') {
      setSaturdayOverrides(existing);
    } else {
      setSaturdayOverrides([...existing, { date: dateStr, followDay }]);
    }
  };

  const handleMark = (slotId: string, status: 'present' | 'absent') => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const existingIndex = attendance.findIndex(r => r.date === dateStr && r.slotId === slotId);

    if (existingIndex > -1) {
      if (attendance[existingIndex].status === status) {
        // Toggle off if clicking the same status
        const newAttendance = [...attendance];
        newAttendance.splice(existingIndex, 1);
        setAttendance(newAttendance);
        return;
      }
      const newAttendance = [...attendance];
      newAttendance[existingIndex] = { ...newAttendance[existingIndex], status };
      setAttendance(newAttendance);
    } else {
      setAttendance([...attendance, { date: dateStr, slotId, status }]);
    }
  };

  const getStatus = (date: Date, slotId: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return attendance.find(r => r.date === dateStr && r.slotId === slotId)?.status;
  };

  const isSaturday = getDay(selectedDate) === 6;
  const override = getSaturdayOverride(selectedDate);
  
  const dayToFollow: DayOfWeek | 'Holiday' = 
    isSaturday 
      ? (override === 'Default' ? 'Saturday' : override)
      : (format(selectedDate, 'EEEE') as DayOfWeek);

  const dayLectures = dayToFollow === 'Holiday' ? [] : timetable.filter(s => s.day === dayToFollow);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
      {/* Calendar Section */}
      <div className="lg:col-span-7 bg-zinc-900 rounded-[2.5rem] border border-zinc-800 overflow-hidden shadow-2xl flex flex-col">
        <div className="p-6 md:p-10 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/20">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-zinc-950 border border-zinc-700 text-brand-blue rounded-2xl flex items-center justify-center shadow-[inset_0_2px_10px_rgba(255,255,255,0.05)] transition-transform hover:scale-105 active:scale-95">
              <CalendarIcon className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-black text-2xl text-white tracking-tighter uppercase italic">{format(currentDate, 'MMMM yyyy')}</h3>
              <p className="text-[11px] uppercase font-black text-zinc-500 tracking-[0.4em] mt-1 pl-1">Chronicle Ledger</p>
            </div>
          </div>
          <div className="flex gap-2 bg-zinc-950 p-2 rounded-2xl border border-zinc-800 shadow-inner">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-3 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded-xl transition-all border border-transparent hover:border-zinc-700">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-3 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded-xl transition-all border border-transparent hover:border-zinc-700">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-7 border-b border-zinc-800 bg-zinc-950">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-[11px] font-black text-zinc-600 uppercase py-2 tracking-[0.3em]">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-zinc-800/30 flex-1">
          {calendarDays.map((day, i) => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayRecords = attendance.filter(r => r.date === dateStr);
            const hasPresent = dayRecords.some(r => r.status === 'present');
            const hasAbsent = dayRecords.some(r => r.status === 'absent');

            return (
              <button
                key={i}
                onClick={() => setSelectedDate(day)}
                className={clsx(
                  "h-28 p-4 bg-zinc-900 border-none flex flex-col items-center justify-between transition-all group relative overflow-hidden",
                  !isCurrentMonth && "opacity-10 grayscale pointer-events-none",
                  isSelected && "bg-zinc-950 shadow-[inset_0_0_40px_rgba(0,0,0,0.5)]"
                )}
              >
                {isSelected && (
                  <motion.div 
                    layoutId="calendar-selection"
                    className="absolute inset-x-2 inset-y-2 border border-brand-blue/30 bg-brand-blue/5 rounded-xl z-0" 
                  />
                )}
                
                <div className={clsx(
                  "text-sm font-black w-10 h-10 rounded-xl flex items-center justify-center transition-all relative z-10 border",
                  isToday 
                    ? "bg-brand-blue text-white glow-blue border-white/20" 
                    : isSelected 
                      ? "text-white border-zinc-700 bg-zinc-800" 
                      : "text-zinc-600 border-transparent group-hover:text-zinc-200 group-hover:bg-zinc-850"
                )}>
                  {format(day, 'd')}
                </div>

                <div className="flex gap-2 mb-2 relative z-10">
                  {hasPresent && <div className="w-1.5 h-1.5 rounded-full bg-brand-green glow-green" />}
                  {hasAbsent && <div className="w-1.5 h-1.5 rounded-full bg-brand-red glow-red" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Detail Section */}
      <div className="lg:col-span-5 flex flex-col gap-8">
        <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-zinc-500 text-[11px] font-black uppercase tracking-[0.4em] mb-3 pl-1">Daily Manifest</p>
              <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">{format(selectedDate, 'do MMMM')}</h3>
              <p className="text-zinc-400 text-sm font-black uppercase tracking-widest mt-2">{format(selectedDate, 'EEEE')}</p>
            </div>
            <div className="w-16 h-16 bg-zinc-950 border border-zinc-700 rounded-2xl flex items-center justify-center shadow-2xl ring-1 ring-white/5">
              <CalendarIcon className={clsx("w-8 h-8", dayLectures.length > 0 ? "text-brand-green" : "text-zinc-600")} />
            </div>
          </div>

          {isSaturday && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 bg-zinc-950 border border-zinc-800 rounded-3xl flex flex-col gap-5 shadow-inner"
            >
              <div className="flex items-center gap-3 text-[11px] font-black text-brand-blue uppercase tracking-[0.3em] pl-1">
                <Sparkles className="w-4 h-4" />
                Phase Configuration
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(['Default', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Holiday'] as SaturdayOverrideType[]).map(day => (
                  <button
                    key={day}
                    onClick={() => setSaturdayOverride(selectedDate, day)}
                    className={clsx(
                      "px-3 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                      override === day 
                        ? "bg-brand-blue text-white border-white/20 shadow-[0_10px_20px_rgba(0,136,255,0.3)]" 
                        : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-white hover:border-zinc-600"
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-blue/5 rounded-full blur-[100px] -mr-24 -mt-24 pointer-events-none" />
        </div>

        <div className="bg-zinc-900 rounded-[2.5rem] border border-zinc-800 p-6 md:p-10 flex-1 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <h4 className="font-black text-xl uppercase tracking-tighter italic flex items-center gap-4">
              <div className="w-1 md:w-1.5 h-8 bg-brand-blue rounded-full glow-blue" />
              Mission Scope
            </h4>
            <span className="px-5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-[11px] font-black text-zinc-500 uppercase tracking-widest shadow-inner">{dayLectures.length} Total</span>
          </div>

          <div className="space-y-5 flex-1">
            {dayLectures.map(slot => {
              const status = getStatus(selectedDate, slot.id);

              return (
                <div key={slot.id} className={clsx(
                  "p-5 md:p-8 rounded-3xl border transition-all duration-700 relative group/slot overflow-hidden shadow-lg",
                  status === 'present' ? "bg-zinc-950 border-brand-green/30" : 
                  status === 'absent' ? "bg-zinc-950 border-brand-red/30" : 
                  "bg-zinc-950 border-zinc-800"
                )}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6 relative z-10">
                    <div className="flex-1 min-w-0">
                      <h5 className="font-black text-base md:text-lg text-white leading-tight mb-2 md:mb-3 uppercase tracking-tight group-hover/slot:text-brand-blue transition-colors italic truncate">
                        {slot.subject}
                      </h5>
                      <div className="flex items-center gap-3 text-[10px] md:text-[11px] text-zinc-500 font-black uppercase tracking-[0.3em]">
                        <div className="w-4 h-4 bg-zinc-800 rounded-md flex items-center justify-center">
                           <Clock className="w-2.5 h-2.5 text-brand-blue" />
                        </div>
                        {slot.startTime} <span className="text-zinc-800">|</span> {slot.endTime}
                      </div>
                    </div>
                    <div className="shrink-0 flex gap-2 md:gap-3">
                      <button 
                        onClick={() => handleMark(slot.id, 'present')}
                        className={clsx(
                          "flex-1 sm:flex-none w-full sm:w-14 h-12 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border-2",
                          status === 'present' ? "bg-brand-green border-white/20 text-black scale-105 sm:scale-110 shadow-[0_10px_20px_rgba(0,255,102,0.3)]" : "bg-zinc-900 text-zinc-600 hover:text-brand-green hover:bg-zinc-850 border-zinc-800"
                        )}
                      >
                        <Check className="w-5 h-5 md:w-6 md:h-6 stroke-[3]" />
                        <span className="sm:hidden ml-2 text-[10px] font-black uppercase tracking-widest">Present</span>
                      </button>
                      <button 
                        onClick={() => handleMark(slot.id, 'absent')}
                        className={clsx(
                          "flex-1 sm:flex-none w-full sm:w-14 h-12 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border-2",
                          status === 'absent' ? "bg-brand-red border-white/20 text-white scale-105 sm:scale-110 shadow-[0_10px_20px_rgba(255,0,68,0.3)]" : "bg-zinc-900 text-zinc-600 hover:text-brand-red hover:bg-zinc-850 border-zinc-800"
                        )}
                      >
                        <X className="w-5 h-5 md:w-6 md:h-6 stroke-[3]" />
                        <span className="sm:hidden ml-2 text-[10px] font-black uppercase tracking-widest">Absent</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="absolute left-0 bottom-0 right-0 h-1 bg-zinc-800 overflow-hidden">
                    <div className={clsx(
                      "absolute inset-y-0 left-0 transition-all duration-1000 ease-out",
                      status === 'present' ? "w-full bg-brand-green glow-green" : 
                      status === 'absent' ? "w-full bg-brand-red glow-red" : 
                      "w-0 bg-transparent"
                    )} />
                  </div>
                </div>
              );
            })}

            {dayLectures.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 text-center py-12">
                <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mb-6 border border-zinc-800">
                  <Minus className="w-8 h-8 opacity-20" />
                </div>
                <p className="font-bold text-white text-lg tracking-tight">Zero Constraints</p>
                <p className="text-xs text-zinc-500 max-w-[200px] mt-1 mx-auto leading-relaxed italic">No academic commitments found in the timetable for this cycle.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

