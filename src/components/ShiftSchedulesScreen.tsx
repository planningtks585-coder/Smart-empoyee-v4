import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Clock,
  Coffee,
  UtensilsCrossed,
  LogOut,
  LogIn,
  CheckCircle2,
  Calendar,
  Sparkles,
  Users,
  ShieldCheck,
  RotateCw,
  Sun,
  MapPin,
  Check
} from 'lucide-react';
import { ShiftItem, ShiftTimelineItem, Language, Employee, UserRoleMode } from '../types';
import { translations } from '../i18n/translations';
import { applyStandardShiftToAllAPI } from '../api/client';

interface ShiftSchedulesScreenProps {
  shifts: ShiftItem[];
  employees?: Employee[];
  roleMode?: UserRoleMode;
  onBackToDashboard: () => void;
  lang?: Language;
  onUpdateTimelineItem?: (shiftId: string, itemId: string) => void;
  onApplyStandardShift?: () => Promise<void>;
}

export const ShiftSchedulesScreen: React.FC<ShiftSchedulesScreenProps> = ({
  shifts = [],
  employees = [],
  roleMode = 'employee',
  onBackToDashboard,
  onApplyStandardShift,
  lang = 'en'
}) => {
  const t = translations[lang];
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('all');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(2); // Wednesday default
  const [shiftList, setShiftList] = useState<ShiftItem[]>(shifts);
  const [isApplyingStandard, setIsApplyingStandard] = useState(false);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  // Sync shifts when prop updates
  useEffect(() => {
    if (shifts && shifts.length > 0) {
      setShiftList(shifts);
    }
  }, [shifts]);

  const daysHeader = [
    { name: t.mon, num: 5, date: '2026-10-05', hasShift: true, dayIdx: 1 },
    { name: t.tue, num: 6, date: '2026-10-06', hasShift: true, dayIdx: 2 },
    { name: t.wed, num: 7, date: '2026-10-07', hasShift: true, dayIdx: 3 },
    { name: t.thu, num: 8, date: '2026-10-08', hasShift: true, dayIdx: 4 },
    { name: t.fri, num: 9, date: '2026-10-09', hasShift: true, dayIdx: 5 },
    { name: t.sat, num: 10, date: '2026-10-10', hasShift: true, dayIdx: 6 },
    { name: t.sun, num: 11, date: '2026-10-11', hasShift: true, dayIdx: 7 },
  ];

  // Filter shifts based on selected employee
  const currentDayHeader = daysHeader[selectedDayIndex];
  const activeEmployee = employees.find(e => e.id === selectedEmployeeId);

  // Shifts for current day
  const dayShifts = shiftList.filter(s => {
    const matchesDay = s.date === currentDayHeader.date || s.dayName.toLowerCase() === currentDayHeader.name.toLowerCase();
    if (selectedEmployeeId === 'all') return matchesDay;
    return matchesDay && s.employeeId === selectedEmployeeId;
  });

  const currentShift: ShiftItem = dayShifts[0] || {
    id: `shift_standard_${selectedDayIndex}`,
    employeeId: selectedEmployeeId !== 'all' ? selectedEmployeeId : 'emp_cian',
    date: currentDayHeader.date,
    dayName: currentDayHeader.name,
    dayNumber: currentDayHeader.num,
    role: activeEmployee?.role || 'Company Standard Shift',
    startTime: '08:30 AM',
    endTime: '05:30 PM',
    hours: 8,
    location: 'Marketing Landmark HQ (ភ្នំពេញ)',
    timeline: [
      { id: 't1', label: 'Clock In', time: '08:30 AM', type: 'clock_in', completed: selectedDayIndex <= 2 },
      { id: 't2', label: 'Short Break', time: '10:15 AM', type: 'short_break', completed: selectedDayIndex <= 2 },
      { id: 't3', label: 'Lunch Break', time: '12:30 PM', type: 'lunch_break', completed: selectedDayIndex <= 1 },
      { id: 't4', label: 'Clock Out', time: '05:30 PM', type: 'clock_out', completed: selectedDayIndex <= 1 }
    ]
  };

  const toggleTimeline = (itemId: string) => {
    setShiftList(prev =>
      prev.map(s => {
        if (s.id === currentShift.id || (s.date === currentShift.date && (selectedEmployeeId === 'all' || s.employeeId === selectedEmployeeId))) {
          return {
            ...s,
            timeline: s.timeline.map(t => (t.id === itemId ? { ...t, completed: !t.completed } : t))
          };
        }
        return s;
      })
    );
  };

  const handleApplyStandardShift = async () => {
    setIsApplyingStandard(true);
    try {
      if (onApplyStandardShift) {
        await onApplyStandardShift();
      } else {
        const res = await applyStandardShiftToAllAPI();
        if (res?.shifts) {
          setShiftList(res.shifts);
        }
      }
      setAppliedNotice(
        lang === 'km'
          ? 'បានកំណត់ និងអនុវត្តវេនការងារស្ដង់ដារ (ម៉ោង 08:30 AM - 05:30 PM រៀងរាល់ថ្ងៃ) ជូនបុគ្គលិកទាំងអស់ដោយជោគជ័យ!'
          : 'Standard daily shift (08:30 AM – 05:30 PM Everyday) applied to all employees successfully!'
      );
      setTimeout(() => setAppliedNotice(null), 4000);
    } catch (err: any) {
      console.error(err);
      setAppliedNotice(err.message || 'Failed to apply standard shift');
      setTimeout(() => setAppliedNotice(null), 4000);
    } finally {
      setIsApplyingStandard(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full px-4 sm:px-8 py-5 pb-24 max-w-5xl mx-auto w-full">
      {/* Page Header with Standard Shift Alert */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>{t.shiftSchedules}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {lang === 'km' ? 'វេនការងារស្ដង់ដារ' : 'Standard Everyday'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {lang === 'km'
              ? 'កាលវិភាគវេនការងារស្ដង់ដារដូចគ្នាជារៀងរាល់ថ្ងៃសម្រាប់បុគ្គលិកទាំងអស់'
              : 'Standard recurring daily shifts (08:30 AM – 05:30 PM) synchronized across all staff'}
          </p>
        </div>

        {/* Action: Apply standard shift to all */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleApplyStandardShift}
            disabled={isApplyingStandard}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
            title="Apply standard 8:30 AM - 5:30 PM schedule to every employee"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isApplyingStandard ? 'animate-spin' : ''}`} />
            <span>
              {isApplyingStandard
                ? (lang === 'km' ? 'កំពុងអនុវត្ត...' : 'Applying...')
                : (lang === 'km' ? 'កំណត់វេនស្ដង់ដារបុគ្គលិកទាំងអស់' : 'Apply Standard Shift to All')}
            </span>
          </button>
        </div>
      </div>

      {/* Applied Notice Banner */}
      {appliedNotice && (
        <div className="mb-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{appliedNotice}</span>
        </div>
      )}

      {/* Standard Shift Notice Card */}
      <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/80 dark:to-slate-800/50 border border-blue-100 dark:border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-600/30">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                {lang === 'km' ? 'វេនការងារស្ដង់ដារក្រុមហ៊ុន (Same Shift Everyday)' : 'Company-Wide Standard Daily Shift'}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Active Everyday
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">08:30 AM – 05:30 PM</span> (8h 00m) • {lang === 'km' ? 'សម្រាកខ្លី' : 'Short Break'}: 10:15 AM • {lang === 'km' ? 'សម្រាកបាយថ្ងៃ' : 'Lunch Break'}: 12:30 PM
            </p>
          </div>
        </div>

        {/* Employee Filter dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Users className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedEmployeeId}
            onChange={e => setSelectedEmployeeId(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-2xs"
          >
            <option value="all">
              {lang === 'km' ? '👥 បុគ្គលិកទាំងអស់ (វេនស្ដង់ដារ)' : '👥 All Employees (Company Standard)'}
            </option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                👤 {emp.name} — {emp.role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Week Navigator */}
      <div className="flex items-center justify-between mt-1 mb-3">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          {t.weekOf} Oct 5 – Oct 11, 2026 (7 Days Scheduled)
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSelectedDayIndex(prev => Math.max(0, prev - 1))}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedDayIndex(prev => Math.min(daysHeader.length - 1, prev + 1))}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days Horizontal Carousel Row (7 Days: Mon - Sun) */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 mb-6">
        {daysHeader.map((day, idx) => {
          const isSelected = idx === selectedDayIndex;
          return (
            <button
              key={day.name}
              onClick={() => setSelectedDayIndex(idx)}
              className={`flex flex-col items-center py-2.5 px-1 rounded-2xl transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-102 ring-2 ring-blue-500/30'
                  : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 border border-slate-100 dark:border-slate-800'
              }`}
            >
              <span className={`text-[11px] font-bold ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                {day.name}
              </span>
              <span className="text-sm font-black mt-1 font-mono">{day.num}</span>
              <div className="flex items-center gap-0.5 mt-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />
                <span className={`text-[9px] font-semibold hidden sm:inline ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                  8h
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Today's Shift Card (Rich Blue Gradient) */}
      <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white p-5 sm:p-6 shadow-xl shadow-blue-600/20 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-200">
                {currentDayHeader.name}, Oct {currentDayHeader.num}, 2026
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
                {lang === 'km' ? 'វេនដូចគ្នាជារៀងរាល់ថ្ងៃ' : 'Same Shift Everyday'}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black mt-1 tracking-tight text-white">
              {selectedEmployeeId === 'all'
                ? (lang === 'km' ? 'វេនស្ដង់ដារបុគ្គលិកទាំងអស់' : 'All Staff Standard Shift')
                : `${activeEmployee?.name || 'Staff'} — ${currentShift.role}`}
            </h3>
            <p className="text-xs text-blue-100/90 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-200" />
              <span>{currentShift.location}</span>
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* 4-Column Metric Row */}
        <div className="grid grid-cols-4 gap-2 mt-5 pt-4 border-t border-white/20 text-center relative z-10">
          <div>
            <div className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">{t.start}</div>
            <div className="text-xs sm:text-base font-extrabold font-mono mt-1 text-white">{currentShift.startTime || '08:30 AM'}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">{t.end}</div>
            <div className="text-xs sm:text-base font-extrabold font-mono mt-1 text-white">{currentShift.endTime || '05:30 PM'}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">{t.hours}</div>
            <div className="text-xs sm:text-base font-extrabold font-mono mt-1 text-white">8h 00m</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">
              {lang === 'km' ? 'សុពលភាពយឺត' : 'Grace Period'}
            </div>
            <div className="text-xs sm:text-base font-extrabold font-mono mt-1 text-white">15 Mins</div>
          </div>
        </div>

        {/* Bottom Shift Status Pill */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-blue-100 relative z-10">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>
              {selectedEmployeeId === 'all'
                ? `${employees.length || 9} employees assigned to this daily shift`
                : `Assigned to ${activeEmployee?.name || 'Staff'}`}
            </span>
          </div>

          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 font-semibold text-[11px]">
            <Clock className="w-3 h-3" />
            <span>Punctuality: 08:30 - 08:45 AM</span>
          </div>
        </div>
      </div>

      {/* Shift Timeline Card */}
      <div className="bg-white dark:bg-slate-800/80 rounded-3xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-xs mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{t.shiftTimeline}</span>
              <span className="text-[11px] font-normal text-slate-400">
                ({lang === 'km' ? 'ដូចគ្នាជារៀងរាល់ថ្ងៃ' : 'Standard Everyday Schedule'})
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {lang === 'km'
                ? 'កាលវិភាគពេលកំណត់ និងការសម្រាកស្ដង់ដារប្រចាំថ្ងៃ'
                : 'Step-by-step milestones for daily work and break intervals'}
            </p>
          </div>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">{t.clickStepToToggle}</span>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
          {/* Step 1: Clock In */}
          <div
            onClick={() => toggleTimeline('t1')}
            className="relative flex items-center justify-between cursor-pointer group"
          >
            <div className="absolute -left-6 top-0.5 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center ring-4 ring-white dark:ring-slate-800">
              <LogIn className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600">
                  {t.clockIn}
                </h5>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                  {lang === 'km' ? 'ម៉ោងចូលស្ដង់ដារ' : 'Mandatory'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{t.scheduledArrival} (Grace period until 08:45 AM)</p>
            </div>
            <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white">
              08:30 AM
            </span>
          </div>

          {/* Step 2: Short Break */}
          <div
            onClick={() => toggleTimeline('t2')}
            className="relative flex items-center justify-between cursor-pointer group"
          >
            <div className="absolute -left-6 top-0.5 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center ring-4 ring-white dark:ring-slate-800">
              <Coffee className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600">
                  {t.shortBreak}
                </h5>
                <span className="text-[10px] text-slate-400">15 mins</span>
              </div>
              <p className="text-[11px] text-slate-400">{t.coffeeBreak}</p>
            </div>
            <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white">
              10:15 AM
            </span>
          </div>

          {/* Step 3: Lunch Break */}
          <div
            onClick={() => toggleTimeline('t3')}
            className="relative flex items-center justify-between cursor-pointer group"
          >
            <div className="absolute -left-6 top-0.5 w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center ring-4 ring-white dark:ring-slate-800">
              <UtensilsCrossed className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600">
                  {t.lunchBreak}
                </h5>
                <span className="text-[10px] text-slate-400">60 mins</span>
              </div>
              <p className="text-[11px] text-slate-400">{t.cafeteriaBreak}</p>
            </div>
            <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white">
              12:30 PM
            </span>
          </div>

          {/* Step 4: Clock Out */}
          <div
            onClick={() => toggleTimeline('t4')}
            className="relative flex items-center justify-between cursor-pointer group"
          >
            <div className="absolute -left-6 top-0.5 w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center ring-4 ring-white dark:ring-slate-800">
              <LogOut className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600">
                  {t.clockOut}
                </h5>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold">
                  {lang === 'km' ? 'បញ្ចប់វេនការងារ' : 'Standard End'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{t.shiftCompletion}</p>
            </div>
            <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white">
              05:30 PM
            </span>
          </div>
        </div>
      </div>

      {/* Team Daily Roster: All Employees Standard Shift List */}
      {selectedEmployeeId === 'all' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span>{lang === 'km' ? 'តារាងវេនការងារបុគ្គលិកទាំងអស់ប្រចាំថ្ងៃ' : 'All Employees Standard Daily Shift Roster'}</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'km'
                  ? `${currentDayHeader.name} ${currentDayHeader.date} — បុគ្គលិកគ្រប់រូបមានវេនដូចគ្នា 08:30 AM ដល់ 05:30 PM (8 ម៉ោង)`
                  : `${currentDayHeader.name} ${currentDayHeader.date} — Every employee assigned uniform daily 08:30 AM – 05:30 PM shift`}
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 self-start sm:self-auto">
              {employees.length} Staff Scheduled
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {employees.map(emp => {
              const empShift = shiftList.find(s => s.employeeId === emp.id && (s.date === currentDayHeader.date || s.dayName.toLowerCase() === currentDayHeader.name.toLowerCase())) || {
                startTime: '08:30 AM',
                endTime: '05:30 PM',
                hours: 8
              };
              return (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmployeeId(emp.id)}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 hover:border-blue-300 dark:hover:border-blue-700 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      {emp.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {emp.name}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">
                          {emp.department}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{emp.role}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {empShift.startTime} – {empShift.endTime}
                    </div>
                    <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                      <Check className="w-3 h-3" />
                      <span>{lang === 'km' ? '8h ស្ដង់ដារ' : '8h Standard'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week Overview Commitment Metric */}
      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {lang === 'km' ? 'ម៉ោងការងារស្ដង់ដារប្រចាំសប្ដាហ៍' : 'Standard Weekly Commitment'}
            </h5>
            <p className="text-[11px] text-slate-500">
              {lang === 'km'
                ? 'វេនការងារស្មើគ្នា 8 ម៉ោងក្នុងមួយថ្ងៃសម្រាប់បុគ្គលិកទាំងអស់'
                : '56 Scheduled Shift Hours (8 Hours/Day, Same schedule everyday)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            ✓ 100% Workforce Standardized
          </span>
        </div>
      </div>
    </div>
  );
};
