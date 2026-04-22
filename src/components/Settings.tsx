/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserSettings } from '../types';
import { User, Target, Shield, Save, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface Props {
  settings: UserSettings;
  setSettings: (settings: UserSettings) => void;
}

export default function Settings({ settings, setSettings }: Props) {
  const [formData, setFormData] = useState(settings);

  const handleSave = () => {
    setSettings(formData);
    // Visual feedback
    const btn = document.getElementById('save-settings');
    if (btn) {
      const original = btn.innerHTML;
      btn.innerHTML = 'Preferences Updated!';
      btn.classList.replace('bg-brand-blue', 'bg-brand-green');
      setTimeout(() => {
        btn.innerHTML = original;
        btn.classList.replace('bg-brand-green', 'bg-brand-blue');
      }, 2000);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Profile Section */}
      <section className="bg-zinc-900 p-6 md:p-8 rounded-3xl border border-zinc-800 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-zinc-800 text-brand-blue rounded-2xl flex items-center justify-center border border-zinc-700">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-white">Identity</h3>
              <p className="text-zinc-500 text-sm">Personalize student profile.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="group space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest pl-1">
                Full Handle
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-zinc-850 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all group-hover:border-zinc-700"
                placeholder="Student Alias"
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest pl-1 flex items-center gap-2">
                  <Target className="w-3 h-3 text-brand-red" />
                  Threshold Limit
                </label>
                <span className="text-3xl font-black text-brand-blue tracking-tighter">
                  {formData.targetPercentage}<span className="text-xs text-zinc-600">%</span>
                </span>
              </div>
              <div className="relative h-2 bg-zinc-800 rounded-full">
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="1"
                  value={formData.targetPercentage}
                  onChange={(e) => setFormData({ ...formData, targetPercentage: parseInt(e.target.value) })}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
                />
                <div 
                  className="h-full bg-brand-blue rounded-full glow-blue transition-all ease-out" 
                  style={{ width: `${formData.targetPercentage}%` }} 
                />
              </div>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
                Adjusting this affects your Bunk Counselor strategy and Dashboard metrics instantly.
              </p>
            </div>
          </div>
        </div>

        <button
          id="save-settings"
          onClick={handleSave}
          className="mt-12 w-full bg-brand-blue text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-lg active:scale-95 border border-white/10"
        >
          <Save className="w-5 h-5" />
          Synchronize Configuration
        </button>
      </section>

      {/* Storage & Global Section */}
      <div className="space-y-8">
        <section className="bg-zinc-900 text-white p-6 md:p-8 rounded-3xl border border-zinc-800 shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-zinc-800 text-zinc-300 rounded-2xl flex items-center justify-center border border-zinc-700">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-xl">Cryptography</h3>
                <p className="text-zinc-500 text-sm">Security & node persistence.</p>
              </div>
            </div>

            <div className="p-5 bg-zinc-950/50 border border-zinc-800 rounded-2xl mb-8 group-hover:border-zinc-700 transition-colors">
              <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                Your credentials and records are stored in <span className="text-brand-blue font-mono">Local Node (Browser)</span>. 
                Clearing node data will reset your academic progress to zero.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleReset}
                className="col-span-2 px-6 py-3.5 bg-brand-red/10 border border-brand-red/20 text-brand-red font-black rounded-xl flex items-center justify-center gap-2 hover:bg-brand-red/20 transition-all text-[11px] uppercase tracking-widest shadow-inner shadow-brand-red/5"
              >
                <RefreshCw className="w-4 h-4" />
                Format Data Node
              </button>
            </div>
          </div>
          
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none group-hover:bg-brand-blue/10 transition-colors duration-500" />
        </section>
      </div>

      {/* Credits Section */}
      <div className="col-span-1 md:col-span-2 text-center pt-8 pb-12">
        <div className="flex flex-col items-center gap-2 opacity-30">
          <div className="h-px w-24 bg-zinc-800" />
          <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.4em]">Node Established 2026</p>
        </div>
      </div>
    </div>
  );
}

