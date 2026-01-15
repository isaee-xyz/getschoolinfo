"use client";

import React from 'react';
import { School } from '../types';
import { MapPin, CheckCircle, Scale } from 'lucide-react';
import Link from 'next/link';
import { useStore } from '../context/StoreContext';
import InfoTooltip from './InfoTooltip';

interface SchoolCardProps {
  school: School;
}

const SchoolCard: React.FC<SchoolCardProps> = ({ school }) => {
  const { toggleCompare, isInCompare, isInShortlist } = useStore();
  const isComparing = isInCompare(school.id);
  const isSaved = isInShortlist(school.id);

  // --- Derivative Metric Calculations ---
  // The API (school_stats table) provides pre-calculated snake_case metrics.
  // We prioritize those, falling back to on-the-fly calc for backward compat.
  // IMPORTANT: All percentages and ratios must be rounded to Integers for UI.

  // 1. Student-Teacher Ratio (Benchmark <= 30)
  const strRaw = school.student_teacher_ratio ?? (school.totalTeacher > 0 ? school.rowTotal / school.totalTeacher : 0);
  const str = Math.round(strRaw);
  const isStrGood = str > 0 && str <= 30;

  // 2. Gender Parity Index (Benchmark 0.97 - 1.03) -> Keep decimals for GPI (index, not %)
  const gpiValue = school.gender_parity_index ||
    ((school.rowBoyTotal && school.rowBoyTotal > 0) ? (school.rowGirlTotal / school.rowBoyTotal) : 0);
  const isGpiGood = gpiValue >= 0.90 && gpiValue <= 1.10;

  // 3. B.Ed Qualification % (Benchmark 100%)
  const bedPctRaw = school.bed_qualification_pct ?? (
    school.totalTeacher > 0 ? ((school.profQual3 || 0) / school.totalTeacher) * 100 : 0
  );
  const bedPct = Math.round(bedPctRaw);

  // 4. Regular Teacher % (Benchmark > 80%)
  const regTeacherPctRaw = school.regular_teacher_pct ?? (
    school.totalTeacher > 0 ? (school.tchReg / school.totalTeacher) * 100 : 0
  );
  const regTeacherPct = Math.round(regTeacherPctRaw);

  // 5. Students Per Classroom (Benchmark 25-35)
  const densityRaw = school.students_per_classroom ?? (
    school.clsrmsGd > 0 ? school.rowTotal / school.clsrmsGd : 0
  );
  const classroomDensity = Math.round(densityRaw);
  const isDensityGood = classroomDensity <= 40;

  // 6. Girls Toilets Per 1000 (Benchmark >= 25)
  const girlToiletsRaw = school.girls_toilets_per_1000 ?? (
    school.rowGirlTotal > 0 ? (school.toiletgFun / school.rowGirlTotal) * 1000 : 0
  );
  const girlToiletsRatio = Math.round(girlToiletsRaw);
  const isHygineGood = girlToiletsRatio >= 20;

  // 7. Furniture Availability (Benchmark 100%)
  const furniturePctRaw = school.furniture_availability_pct ?? (
    school.rowTotal > 0 ? ((school.stusHvFurnt || 0) / school.rowTotal) * 100 : 0
  );
  const furniturePct = Math.round(furniturePctRaw);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col md:flex-row relative">
      {/* Thumbnail */}
      <div className="md:w-56 h-48 md:h-auto relative shrink-0 overflow-hidden bg-gray-100">
        <img
          src={school.image || '/default-school.jpg'}
          alt={school.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/default-school.jpg';
          }}
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
          <div className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
            <CheckCircle className="w-3 h-3" />
            {school.schoolStatusName}
          </div>
          {school.badge_value_for_money && (
            <div className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm border border-purple-200">
              💰 Best Value
            </div>
          )}
          {school.badge_academic_elite && (
            <div className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm border border-blue-200">
              🎓 Academic Elite
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1">{school.name}</h3>
              <div className="flex items-center text-slate-500 text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                {school.block}, {school.district}
              </div>
            </div>
            <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-1 rounded border border-gray-200 uppercase tracking-wide">
              {school.boardSecName}
            </span>
          </div>

          {/* Key Metrics Grid - The "Scorecard" */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 bg-gray-50 p-2 rounded-lg border border-gray-100">

            {/* Metric 1: STR */}
            <div className="flex flex-col items-center p-1">
              <span className="text-[10px] uppercase text-gray-500 font-bold flex items-center">
                STR <InfoTooltip text="Student-Teacher Ratio (Ideal ≤ 30)" />
              </span>
              <span className={`text-base font-bold ${isStrGood ? 'text-green-600' : 'text-red-500'}`}>
                1:{str}
              </span>
            </div>

            {/* Metric 2: Class Density */}
            <div className="flex flex-col items-center p-1 border-l border-gray-200">
              <span className="text-[10px] uppercase text-gray-500 font-bold flex items-center">
                Density <InfoTooltip text="Students per Good Classroom (Ideal 25-35)" />
              </span>
              <span className={`text-base font-bold ${isDensityGood ? 'text-slate-800' : 'text-red-500'}`}>
                {classroomDensity}
              </span>
            </div>

            {/* Metric 3: Teacher Quality (B.Ed) */}
            <div className="flex flex-col items-center p-1 border-l border-gray-200">
              <span className="text-[10px] uppercase text-gray-500 font-bold flex items-center">
                B.Ed % <InfoTooltip text="% of Teachers with B.Ed qualification" />
              </span>
              <span className={`text-base font-bold ${bedPct > 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                {bedPct}%
              </span>
            </div>

            {/* Metric 4: Hygiene (Girls Toilet) */}
            <div className="flex flex-col items-center p-1 border-l border-gray-200">
              <span className="text-[10px] uppercase text-gray-500 font-bold flex items-center">
                G-Toilet <InfoTooltip text="Girls Toilets per 1000 girls (RTE: 25)" />
              </span>
              <span className={`text-base font-bold ${isHygineGood ? 'text-green-600' : 'text-red-500'}`}>
                {girlToiletsRatio}
              </span>
            </div>
          </div>

          {/* Additional Tags (Regular Teachers, Furniture, etc.) */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`px-2 py-0.5 text-[10px] font-medium rounded border ${regTeacherPct > 80 ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
              {regTeacherPct}% Regular Staff
            </span>
            {furniturePct < 100 && (
              <span className="px-2 py-0.5 text-[10px] font-medium rounded border bg-red-50 text-red-700 border-red-100">
                {100 - furniturePct}% Missing Furniture
              </span>
            )}
            {school.bndrywallType === 'Pucca' && (
              <span className="px-2 py-0.5 text-[10px] font-medium rounded border bg-emerald-50 text-emerald-700 border-emerald-100">
                Secure Perimeter
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("SchoolCard Compare Clicked:", school.id, typeof school.id);
              toggleCompare(String(school.id));
            }}
            className={`text-xs font-bold flex items-center gap-1 transition-colors ${isComparing ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Scale className={`w-4 h-4 ${isComparing ? 'fill-blue-100' : ''}`} />
            {isComparing ? 'Comparing' : 'Compare'}
          </button>

          <div className="flex items-center gap-3">
            <div className="text-[10px] text-gray-400 font-medium">
              Fee: ₹{(school.tuitionFeeInRupees / 12).toFixed(0)}/mo
            </div>
            <Link
              href={`/${school.district.toLowerCase().replace(/\s+/g, '-')}/${school.slug || 'school-' + school.id}`}
              className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-slate-800 transition-colors"
            >
              View Report
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolCard;