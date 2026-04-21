/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { AttendanceRecord, AttendanceStats } from '../types';

export function calculateStats(
  records: AttendanceRecord[],
  targetPercentage: number,
  range: 'all' | 'week' | 'month' = 'all'
): AttendanceStats {
  const now = new Date();
  
  const filteredRecords = records.filter(r => {
    if (range === 'all') return true;
    const date = parseISO(r.date);
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

  const presentCount = filteredRecords.filter(r => r.status === 'present').length;
  const absentCount = filteredRecords.filter(r => r.status === 'absent').length;
  const totalClasses = presentCount + absentCount;
  
  const percentage = totalClasses === 0 ? 0 : (presentCount / totalClasses) * 100;

  let requiredToReachTarget = 0;
  if (percentage < targetPercentage) {
    // Equation: (P + x) / (T + x) >= Target
    // P + x >= Target * (T + x)
    // P + x >= Target * T + Target * x
    // x - Target * x >= Target * T - P
    // x(1 - Target) >= Target * T - P
    // x >= (Target * T - P) / (1 - Target)
    const target = targetPercentage / 100;
    requiredToReachTarget = Math.ceil((target * totalClasses - presentCount) / (1 - target));
    if (requiredToReachTarget < 0) requiredToReachTarget = 0;
  }

  let canBunk = 0;
  if (percentage >= targetPercentage && totalClasses > 0) {
    // Equation: P / (T + x) >= Target
    // P >= Target * (T + x)
    // P >= Target * T + Target * x
    // P - Target * T >= Target * x
    // x <= (P - Target * T) / Target
    const target = targetPercentage / 100;
    canBunk = Math.floor((presentCount - target * totalClasses) / target);
    if (canBunk < 0) canBunk = 0;
  }

  return {
    totalClasses,
    presentCount,
    absentCount,
    percentage,
    requiredToReachTarget,
    canBunk
  };
}
