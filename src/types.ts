/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface TimeSlot {
  id: string;
  subject: string;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "10:00"
  day: DayOfWeek;
}

export interface AttendanceRecord {
  date: string; // ISO Date string (YYYY-MM-DD)
  slotId: string;
  status: 'present' | 'absent' | 'cancelled';
}

export interface UserSettings {
  targetPercentage: number;
  name: string;
}

export interface AttendanceStats {
  totalClasses: number;
  presentCount: number;
  absentCount: number;
  percentage: number;
  requiredToReachTarget: number;
  canBunk: number;
}

export type SaturdayOverrideType = DayOfWeek | 'Holiday' | 'Default';

export interface SaturdayOverride {
  date: string; // ISO Date YYYY-MM-DD
  followDay: SaturdayOverrideType;
}
