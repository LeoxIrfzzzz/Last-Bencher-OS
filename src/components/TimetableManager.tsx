/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Trash2, Clock, BookOpen, PlusCircle, Sparkles, UploadCloud, Loader2, Minus } from 'lucide-react';
import { DayOfWeek, TimeSlot } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { extractTimetableFromImage } from '../services/geminiService';
import { cn } from '../lib/utils';

interface Props {
  timetable: TimeSlot[];
  setTimetable: (slots: TimeSlot[]) => void;
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function TimetableManager({ timetable, setTimetable }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const [newSlot, setNewSlot] = useState<Partial<TimeSlot>>({
    day: 'Monday',
    subject: '',
    startTime: '09:00',
    endTime: '10:00'
  });

  const handleAdd = () => {
    if (!newSlot.subject || !newSlot.startTime || !newSlot.endTime || !newSlot.day) return;
    
    const slot: TimeSlot = {
      id: crypto.randomUUID(),
      subject: newSlot.subject,
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
      day: newSlot.day as DayOfWeek
    };

    setTimetable([...timetable, slot]);
    setIsAdding(false);
    setNewSlot({ day: 'Monday', subject: '', startTime: '09:00', endTime: '10:00' });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        try {
          const extractedSlots = await extractTimetableFromImage(base64, file.type);
          if (extractedSlots.length > 0) {
            setTimetable([...timetable, ...extractedSlots]);
          } else {
            setError("Could not find any lectures in the image.");
          }
        } catch (err) {
          console.error(err);
          setError("AI processing failed. Please try a clearer image.");
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("File reading failed.");
      setIsProcessing(false);
    }
  };

  const handleDelete = (id: string) => {
    setTimetable(timetable.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-zinc-900 border border-zinc-800 p-6 md:p-8 rounded-[2.5rem] glow-blue gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-zinc-950 border border-zinc-700 text-brand-blue rounded-2xl flex items-center justify-center shadow-inner glow-blue">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-black text-2xl text-white tracking-tighter uppercase italic text-glow-blue">Operations Schedule</h3>
            <p className="text-[11px] uppercase font-black text-zinc-500 tracking-[0.4em] mt-1 pl-1">Tactical Planning</p>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          {timetable.length > 0 && (
            <button
              onClick={() => {
                if (confirmReset) {
                  setTimetable([]);
                  setConfirmReset(false);
                } else {
                  setConfirmReset(true);
                  setTimeout(() => setConfirmReset(false), 3000);
                }
              }}
              className={cn(
                "flex items-center gap-3 border px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95",
                confirmReset 
                  ? "bg-brand-red text-white border-white/20 glow-red" 
                  : "bg-zinc-950 text-brand-red border-brand-red/20 hover:bg-brand-red/10"
              )}
            >
              <Trash2 className="w-4 h-4" />
              {confirmReset ? "Confirm Reset?" : "Reset All"}
            </button>
          )}
          <label className="flex-1 md:flex-none">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageUpload}
              disabled={isProcessing}
            />
            <div className={cn(
              "flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer border",
              isProcessing 
                ? "bg-zinc-800 border-zinc-700 text-zinc-500 cursor-wait whitespace-nowrap" 
                : "bg-zinc-950 hover:bg-zinc-850 border-zinc-800 text-white hover:border-brand-blue shadow-lg active:scale-95 whitespace-nowrap"
            )}>
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin text-brand-blue" /> : <Sparkles className="w-4 h-4 text-brand-blue" />}
              {isProcessing ? "Analyzing Sequence..." : "AI Intelligence"}
            </div>
          </label>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-3 bg-brand-blue text-white px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_15px_30px_rgba(0,136,255,0.3)] border border-white/10"
          >
            <Plus className="w-4 h-4" />
            Add Entry
          </button>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-950 border border-brand-red/30 text-brand-red p-6 rounded-3xl text-sm font-black uppercase tracking-widest flex items-center gap-4 shadow-xl"
        >
          <div className="w-10 h-10 bg-brand-red/10 rounded-full flex items-center justify-center">
            <Minus className="w-5 h-5" />
          </div>
          {error}
        </motion.div>
      )}

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-zinc-900 text-white p-6 md:p-12 rounded-[2.5rem] overflow-hidden border border-zinc-800 shadow-2xl relative"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
            <h4 className="font-black text-2xl mb-10 flex items-center gap-4 uppercase tracking-tighter italic">
              <PlusCircle className="w-7 h-7 text-brand-blue" />
              Configure Target Entry
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase text-zinc-500 tracking-[0.3em] pl-1">Designation</label>
                <input
                  type="text"
                  placeholder="Subject Key..."
                  value={newSlot.subject}
                  onChange={(e) => setNewSlot({ ...newSlot, subject: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand-blue outline-none transition-all shadow-inner"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase text-zinc-500 tracking-[0.3em] pl-1">Temporal Day</label>
                <select
                  value={newSlot.day}
                  onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value as DayOfWeek })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand-blue outline-none transition-all shadow-inner"
                >
                  {DAYS.map(day => <option key={day} value={day} className="bg-zinc-900">{day}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase text-zinc-500 tracking-[0.3em] pl-1">Commence</label>
                <input
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand-blue outline-none transition-all shadow-inner"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase text-zinc-500 tracking-[0.3em] pl-1">Conclude</label>
                <input
                  type="time"
                  value={newSlot.endTime}
                  onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand-blue outline-none transition-all shadow-inner"
                />
              </div>
            </div>
            <div className="mt-12 flex justify-end gap-5 pt-10 border-t border-zinc-800">
              <button onClick={() => setIsAdding(false)} className="px-8 py-3 text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Abort</button>
              <button onClick={handleAdd} className="bg-brand-blue text-white font-black text-[11px] uppercase tracking-widest px-10 py-4 rounded-2xl border border-white/20 hover:shadow-[0_15px_30px_rgba(0,136,255,0.3)] transition-all">Commit Entry</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {DAYS.map(day => {
          const daySlots = timetable.filter(s => s.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
          if (daySlots.length === 0) return null;

          return (
            <div key={day} className="bg-zinc-900 rounded-[2.5rem] border border-zinc-800 overflow-hidden shadow-2xl flex flex-col group/day hover:border-zinc-700 transition-all duration-500">
              <div className="p-8 bg-zinc-950/20 border-b border-zinc-800 flex items-center justify-between">
                <h5 className="font-black text-[11px] uppercase tracking-[0.4em] text-zinc-500 pl-1">{day}</h5>
                <div className="w-1.5 h-6 bg-zinc-800 group-hover/day:bg-brand-blue transition-all duration-500 rounded-full shadow-[0_0_15px_transparent] group-hover/day:shadow-brand-blue/50" />
              </div>
              <div className="flex-1 p-5 space-y-4">
                {daySlots.map(slot => (
                  <div key={slot.id} className="group p-6 rounded-3xl bg-zinc-950 border border-zinc-800 hover:border-brand-blue/30 hover:bg-zinc-900 transition-all duration-500 relative shadow-md">
                    <div className="flex justify-between items-start mb-4">
                      <p className="font-black text-md text-white uppercase tracking-tight italic truncate pr-8">{slot.subject}</p>
                      <button 
                        onClick={() => handleDelete(slot.id)}
                        className="opacity-0 group-hover:opacity-100 transition-all p-2 text-brand-red hover:bg-brand-red/10 rounded-xl absolute top-3 right-3 border border-transparent hover:border-brand-red/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] bg-zinc-900/50 p-2 rounded-xl border border-zinc-800 w-fit">
                      <Clock className="w-3 h-3 text-brand-blue" />
                      {slot.startTime} <span className="opacity-20">/</span> {slot.endTime}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {timetable.length === 0 && (
          <div className="col-span-full py-32 bg-zinc-900 border-2 border-dashed border-zinc-800 rounded-[3rem] flex flex-col items-center justify-center text-zinc-600 gap-8 shadow-inner overflow-hidden relative">
            <div className="absolute inset-0 bg-brand-blue/5 blur-[120px] pointer-events-none" />
            <BookOpen className="w-20 h-20 relative z-10" />
            <div className="text-center relative z-10">
              <p className="font-black text-2xl text-white uppercase tracking-tighter italic">Schedule Idle</p>
              <p className="text-[11px] font-black uppercase text-zinc-500 max-w-[250px] mx-auto mt-3 tracking-[0.2em] leading-relaxed">No operational directives established. Initiate AI Intelligence or manual entry phase.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

