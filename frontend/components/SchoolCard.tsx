"use client";

import React, { useState, useRef, useEffect } from 'react';
import { School } from '../types';
import { MapPin, Scale, ChevronRight, Share2, ShieldCheck, Info } from 'lucide-react';
import Link from 'next/link';
import { useStore } from '../context/StoreContext';

interface SchoolCardProps {
  school: School;
}

/* ── Score helper: calculate overall school score out of 10 ── */
const calcOverallScore = (metrics: { str: number; strStatus: string; bedPct: number; density: number; densityStatus: string; hygieneStatus: string; hasDigital: boolean }) => {
  let score = 0;
  let factors = 0;

  // STR score (0-2.5)
  if (metrics.str > 0) {
    if (metrics.str <= 25) score += 2.5;
    else if (metrics.str <= 30) score += 2;
    else if (metrics.str <= 40) score += 1.2;
    else score += 0.5;
    factors++;
  }

  // Qualification score (0-2.5)
  if (metrics.bedPct > 0) {
    score += (metrics.bedPct / 100) * 2.5;
    factors++;
  }

  // Density score (0-2)
  if (metrics.density > 0) {
    if (metrics.density <= 30) score += 2;
    else if (metrics.density <= 40) score += 1.5;
    else if (metrics.density <= 50) score += 0.8;
    else score += 0.3;
    factors++;
  }

  // Hygiene score (0-1.5)
  if (metrics.hygieneStatus === 'good') score += 1.5;
  else if (metrics.hygieneStatus === 'avg') score += 0.9;
  else score += 0.3;
  factors++;

  // Digital score (0-1.5)
  if (metrics.hasDigital) score += 1.5;
  else score += 0;
  factors++;

  // Normalize if not all factors present
  if (factors < 5 && factors > 0) {
    score = (score / factors) * 5 * 2; // scale to 10
  }

  return Math.min(10, Math.max(0, Math.round(score * 10) / 10));
};

const getGradeLabel = (score: number): { label: string; colorClass: string; bgClass: string } => {
  if (score >= 8) return { label: 'Excellent', colorClass: 'score-excellent', bgClass: 'score-bg-excellent' };
  if (score >= 6) return { label: 'Good', colorClass: 'score-good', bgClass: 'score-bg-good' };
  if (score >= 4) return { label: 'Fair', colorClass: 'score-fair', bgClass: 'score-bg-fair' };
  return { label: 'Needs Work', colorClass: 'score-poor', bgClass: 'score-bg-poor' };
};

const getMetricColor = (status: 'good' | 'avg' | 'poor') => {
  if (status === 'good') return 'var(--gsi-success)';
  if (status === 'avg') return 'var(--gsi-warning)';
  return 'var(--gsi-danger)';
};

const SchoolCard: React.FC<SchoolCardProps> = ({ school }) => {
  const { toggleCompare, isInCompare } = useStore();
  const [showScoreInfo, setShowScoreInfo] = useState(false);
  const scoreInfoRef = useRef<HTMLDivElement>(null);

  // Close tooltip on outside tap (mobile)
  useEffect(() => {
    if (!showScoreInfo) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (scoreInfoRef.current && !scoreInfoRef.current.contains(e.target as Node)) {
        setShowScoreInfo(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showScoreInfo]);

  // ── Derived Metrics ──
  // NOTE: List API returns school_stats rows (no transformSchool), so some fields use
  // different column names than the detail API. We handle both with fallbacks.
  const s = school as any; // allow access to school_stats-specific columns

  const strRaw = school.student_teacher_ratio ?? (school.totalTeacher > 0 ? school.rowTotal / school.totalTeacher : 0);
  const str = Math.round(strRaw);
  const strStatus: 'good' | 'avg' | 'poor' = str > 0 && str <= 30 ? 'good' : str <= 40 ? 'avg' : 'poor';

  const bedPctRaw = school.bed_qualification_pct ?? (
    school.totalTeacher > 0 ? ((school.profQual3 || 0) / school.totalTeacher) * 100 : 0
  );
  const bedPct = Math.round(bedPctRaw);
  const bedStatus: 'good' | 'avg' | 'poor' = bedPct >= 80 ? 'good' : bedPct >= 50 ? 'avg' : 'poor';

  const densityRaw = school.students_per_classroom ?? (
    school.clsrmsGd > 0 ? school.rowTotal / school.clsrmsGd : 0
  );
  const density = Math.round(densityRaw);
  const densityStatus: 'good' | 'avg' | 'poor' = density <= 35 ? 'good' : density <= 45 ? 'avg' : 'poor';

  const girlToiletsRaw = school.girls_toilets_per_1000 ?? (
    school.rowGirlTotal > 0 ? (school.toiletgFun / school.rowGirlTotal) * 1000 : 0
  );
  const girlToiletsRatio = Math.round(girlToiletsRaw);
  const hygieneStatus: 'good' | 'avg' | 'poor' = girlToiletsRatio >= 25 ? 'good' : girlToiletsRatio >= 15 ? 'avg' : 'poor';

  // Digital: use raw counts when available (detail page), fall back to pre-computed ratio (list page)
  const rawDigital = (school.digiBoardTot || 0) + (school.projectorTot || 0);
  const hasDigital = rawDigital > 0 || Number(s.displays_per_classroom || 0) > 0;
  const digitalStatus: 'good' | 'avg' | 'poor' = hasDigital ? 'good' : 'poor';

  // Inclusion: raw fields only available on detail page (from schools JOIN); hide on list cards
  const hasRawInclusion = school.rampsYn !== undefined || school.handrailsYn !== undefined;
  const inclusionScore = (school.rampsYn ? 1 : 0) + (school.handrailsYn ? 1 : 0);
  const inclusionStatus: 'good' | 'avg' | 'poor' = inclusionScore >= 2 ? 'good' : inclusionScore === 1 ? 'avg' : 'poor';

  // Fee: school_stats uses `tuition_fee`, detail page uses `tuitionFeeInRupees`
  const annualFee = school.tuitionFeeInRupees || Number(s.tuition_fee || 0);
  const monthlyFee = annualFee > 0 ? Math.round(annualFee / 12) : 0;

  // Board: school_stats uses `board` column, detail page maps to `boardSecName`
  const cleanBoard = (school.boardSecName || s.board || '').replace(/^[0-9]+-/, '');

  // ID: school_stats PK is `udise_code`; detail page maps it to `id` via transformSchool
  // Always prefer udise_code as canonical identifier (backend resolves it reliably)
  const udiseCode = String(s.udise_code || school.id || '');
  const schoolId = udiseCode;
  const isComparing = isInCompare(schoolId);

  // Overall score
  const overallScore = calcOverallScore({ str, strStatus, bedPct, density, densityStatus, hygieneStatus, hasDigital });
  const grade = getGradeLabel(overallScore);

  // School URL — prefer slug for SEO; fallback to UDISE code (backend handles both)
  const slugValue = school.slug || s.slug || '';
  const schoolUrl = `/${school.district.toLowerCase().replace(/\s+/g, '-')}/${slugValue || udiseCode}`;

  // WhatsApp share
  const shareText = `Check out ${school.name} on GetSchoolsInfo — Score: ${overallScore}/10\nhttps://getschoolsinfo.com${schoolUrl}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="report-card" style={showScoreInfo ? { position: 'relative', zIndex: 999 } : undefined}>
      {/* Main content area: grid with score panel */}
      <div className="grid" style={{ gridTemplateColumns: '1fr 100px', overflow: 'visible' }}>
        {/* Left: School info */}
        <div className="p-4 flex flex-col justify-between min-w-0">
          {/* Header */}
          <div>
            <div className="flex items-start gap-2 mb-1.5">
              <h3 className="text-base font-bold leading-snug line-clamp-2 font-display" style={{ color: 'var(--gsi-text)' }}>
                {school.name}
              </h3>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--gsi-text-muted)' }}>
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{school.block}, {school.district}</span>
              </div>
              {cleanBoard && cleanBoard !== 'NA' && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wide"
                  style={{ background: 'var(--gsi-bg-warm)', color: 'var(--gsi-text-secondary)', border: '1px solid var(--gsi-border-light)' }}>
                  {cleanBoard}
                </span>
              )}
              {monthlyFee > 0 && (
                <span className="text-xs font-semibold" style={{ color: 'var(--gsi-text)' }}>
                  ₹{monthlyFee.toLocaleString()}<span className="font-normal" style={{ color: 'var(--gsi-text-muted)' }}>/mo</span>
                </span>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {school.badge_value_for_money && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                  style={{ background: 'var(--gsi-accent-light)', color: 'var(--gsi-accent-dark)', border: '1px solid #FDE68A' }}>
                  Best Value
                </span>
              )}
              {school.badge_academic_elite && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                  style={{ background: 'var(--gsi-primary-50)', color: 'var(--gsi-primary-dark)', border: '1px solid #99F6E4' }}>
                  Academic Elite
                </span>
              )}
              {school.bndrywallType === 'Pucca' && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                  style={{ background: 'var(--gsi-success-light)', color: '#15803D', border: '1px solid #BBF7D0' }}>
                  Secure Campus
                </span>
              )}
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center gap-2 pt-2">
            <Link
              href={schoolUrl}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white inline-flex items-center gap-1 transition-colors"
              style={{ background: 'var(--gsi-primary)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gsi-primary-dark)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--gsi-primary)'}
            >
              View Details <ChevronRight className="w-3 h-3" />
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleCompare(schoolId);
              }}
              className="text-[11px] font-medium flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors"
              style={{
                background: isComparing ? 'var(--gsi-primary-50)' : 'transparent',
                color: isComparing ? 'var(--gsi-primary-dark)' : 'var(--gsi-text-muted)',
                border: `1px solid ${isComparing ? 'var(--gsi-primary-light)' : 'var(--gsi-border)'}`,
              }}
            >
              <Scale className="w-3 h-3" />
              {isComparing ? 'Comparing' : '+ Compare'}
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-medium flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--gsi-text-muted)', border: '1px solid var(--gsi-border)' }}
              title="Share on WhatsApp"
            >
              <Share2 className="w-3 h-3" />
              <span className="hidden sm:inline">Share</span>
            </a>
          </div>
        </div>

        {/* Right: Score panel */}
        <div className="score-panel relative" ref={scoreInfoRef}>
          <div className="text-2xl font-extrabold font-display" style={{ color: getMetricColor(overallScore >= 6 ? 'good' : overallScore >= 4 ? 'avg' : 'poor') }}>
            {overallScore}
          </div>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowScoreInfo(!showScoreInfo); }}
            className="text-[10px] font-medium flex items-center gap-0.5 min-h-[28px]"
            style={{ color: 'var(--gsi-text-muted)' }}
            aria-label="How is this score calculated?"
          >
            out of 10
            <Info className="w-3 h-3 opacity-50" />
          </button>
          <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${grade.bgClass}`}>
            {grade.label}
          </div>
          {/* Score explanation tooltip — tap toggle for mobile, hover for desktop */}
          {showScoreInfo && (
            <div className="absolute right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 top-full mt-2 w-56 p-3 rounded-lg z-50 text-left animate-fade-in"
              style={{ background: '#1F2937', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}>
              <div className="text-[11px] font-semibold text-white mb-1.5">How is this scored?</div>
              <div className="text-[10px] text-gray-300 leading-relaxed space-y-1">
                <div>Student-Teacher Ratio (0-2.5)</div>
                <div>Teacher Qualifications (0-2.5)</div>
                <div>Classroom Density (0-2)</div>
                <div>Hygiene & Sanitation (0-1.5)</div>
                <div>Digital Equipment (0-1.5)</div>
              </div>
              <a href="/how-it-works" className="text-[10px] font-semibold mt-2 inline-block" style={{ color: '#5EEAD4' }}>
                Full methodology &rarr;
              </a>
              <div className="absolute -top-1 right-8 sm:left-1/2 sm:-translate-x-1/2 w-2 h-2 rotate-45" style={{ background: '#1F2937' }} />
            </div>
          )}
        </div>
      </div>

      {/* Bottom: 5 Metric cells */}
      <div className="metric-cells">
        {/* Infrastructure */}
        <div className="metric-cell">
          <div className="text-[10px] font-medium mb-1" style={{ color: 'var(--gsi-text-muted)' }}>Infra</div>
          <div className="text-xs font-bold" style={{ color: getMetricColor(densityStatus) }}>
            {density > 0 ? density : '—'}
          </div>
          <div className="text-[9px]" style={{ color: 'var(--gsi-text-muted)' }}>per class</div>
          <div className="mini-bar-track mt-1.5">
            <div className="mini-bar-fill" style={{ width: density > 0 ? `${Math.max(10, Math.min(100, ((50 - density) / 50) * 100))}%` : '0%', background: getMetricColor(densityStatus) }} />
          </div>
        </div>

        {/* Academic */}
        <div className="metric-cell">
          <div className="text-[10px] font-medium mb-1" style={{ color: 'var(--gsi-text-muted)' }}>Academic</div>
          <div className="text-xs font-bold" style={{ color: getMetricColor(bedStatus) }}>
            {bedPct}%
          </div>
          <div className="text-[9px]" style={{ color: 'var(--gsi-text-muted)' }}>qualified</div>
          <div className="mini-bar-track mt-1.5">
            <div className="mini-bar-fill" style={{ width: `${bedPct}%`, background: getMetricColor(bedStatus) }} />
          </div>
        </div>

        {/* Safety */}
        <div className="metric-cell">
          <div className="text-[10px] font-medium mb-1" style={{ color: 'var(--gsi-text-muted)' }}>Safety</div>
          <div className="text-xs font-bold" style={{ color: getMetricColor(hygieneStatus) }}>
            {hygieneStatus === 'good' ? 'Good' : hygieneStatus === 'avg' ? 'Fair' : 'Low'}
          </div>
          <div className="text-[9px]" style={{ color: 'var(--gsi-text-muted)' }}>hygiene</div>
          <div className="mini-bar-track mt-1.5">
            <div className="mini-bar-fill" style={{ width: hygieneStatus === 'good' ? '100%' : hygieneStatus === 'avg' ? '60%' : '25%', background: getMetricColor(hygieneStatus) }} />
          </div>
        </div>

        {/* Digital */}
        <div className="metric-cell">
          <div className="text-[10px] font-medium mb-1" style={{ color: 'var(--gsi-text-muted)' }}>Digital</div>
          <div className="text-xs font-bold" style={{ color: getMetricColor(digitalStatus) }}>
            {hasDigital ? 'Yes' : 'No'}
          </div>
          <div className="text-[9px]" style={{ color: 'var(--gsi-text-muted)' }}>smart class</div>
          <div className="mini-bar-track mt-1.5">
            <div className="mini-bar-fill" style={{ width: hasDigital ? '100%' : '0%', background: getMetricColor(digitalStatus) }} />
          </div>
        </div>

        {/* Inclusion */}
        <div className="metric-cell">
          <div className="text-[10px] font-medium mb-1" style={{ color: 'var(--gsi-text-muted)' }}>Inclusion</div>
          <div className="text-xs font-bold" style={{ color: hasRawInclusion ? getMetricColor(inclusionStatus) : 'var(--gsi-text-muted)' }}>
            {hasRawInclusion ? `${inclusionScore}/2` : '—'}
          </div>
          <div className="text-[9px]" style={{ color: 'var(--gsi-text-muted)' }}>access</div>
          <div className="mini-bar-track mt-1.5">
            <div className="mini-bar-fill" style={{ width: hasRawInclusion ? `${(inclusionScore / 2) * 100}%` : '0%', background: hasRawInclusion ? getMetricColor(inclusionStatus) : 'var(--gsi-border)' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolCard;
