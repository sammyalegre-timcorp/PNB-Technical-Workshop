import React from 'react';
import { DateTally, DateOption } from '../types/poll';
import { PNBLogo } from './PNBLogo';
import { Trophy, X, CheckCircle2, Check, Calendar } from 'lucide-react';

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tallies: DateTally[];
  dates: DateOption[];
  totalVotesCount: number;
  userSelectedDateIds: string[];
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  isOpen,
  onClose,
  tallies,
  dates,
  totalVotesCount,
  userSelectedDateIds = [],
}) => {
  if (!isOpen) return null;

  const topChoice = tallies.find((t) => t.isTopChoice);
  const userVotedDates = dates.filter((d) => userSelectedDateIds.includes(d.id));

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[92vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top PNB Brand Accent Strip */}
        <div className="h-2.5 w-full bg-gradient-to-r from-[#001489] via-[#009FDC] to-[#E31B23]" />

        {/* Modal Header: Thank You for Voting */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <PNBLogo size="sm" showText={false} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-[#001489] tracking-tight">
                  Thank you for voting!
                </h3>
                <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Your preference has been recorded. Here are your votes and the live tally.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Close results"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* SECTION 1: Your Chosen Dates */}
          <div className="bg-[#001489]/5 border border-[#001489]/20 rounded-xl p-4">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#001489] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#001489]" />
                <span>Your Voted Date(s)</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                {userVotedDates.length} {userVotedDates.length === 1 ? 'date' : 'dates'} selected
              </span>
            </div>

            {userVotedDates.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {userVotedDates.map((date) => (
                  <div
                    key={date.id}
                    className="inline-flex items-center gap-1.5 bg-white border border-[#001489]/30 text-[#001489] px-3 py-1.5 rounded-lg text-xs font-bold shadow-2xs"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#001489]" />
                    <span>{date.month} {date.day}</span>
                    <span className="text-[11px] text-slate-500 font-normal">({date.dayName})</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No specific dates selected.</p>
            )}
          </div>

          {/* SECTION 2: Poll Results Tally */}
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Poll Results Tally
              </h4>
              <span className="text-[11px] font-mono tabular-nums text-slate-500">
                Total Voters: {totalVotesCount}
              </span>
            </div>

            {/* Leading Choice Highlight Banner */}
            {topChoice && topChoice.votesCount > 0 && (
              <div className="mb-3 bg-gradient-to-r from-[#001489] to-[#002294] text-white rounded-xl p-4 shadow-xs border border-blue-900 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F5B212] flex items-center justify-center shrink-0">
                    <Trophy className="w-5 h-5 text-[#001489]" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-[#F5B212] uppercase tracking-wider">
                      Leading Preferred Date
                    </div>
                    <div className="text-base font-black text-white">
                      {topChoice.date.month} {topChoice.date.day} ({topChoice.date.dayName})
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-black font-mono tabular-nums text-[#F5B212]">
                    {topChoice.percentage}%
                  </div>
                  <div className="text-[11px] text-blue-200">
                    {topChoice.votesCount} of {totalVotesCount} votes
                  </div>
                </div>
              </div>
            )}

            {/* All Dates Tally Breakdown */}
            <div className="space-y-2.5">
              {tallies.map((item) => {
                const isTop = item.isTopChoice && totalVotesCount > 0;
                const isUserPick = userSelectedDateIds.includes(item.date.id);

                return (
                  <div
                    key={item.date.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isTop
                        ? 'border-[#F5B212] bg-[#F5B212]/10 ring-1 ring-[#F5B212]/30'
                        : isUserPick
                        ? 'border-[#001489]/40 bg-blue-50/40'
                        : 'border-slate-200 bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Date Badge */}
                        <div
                          className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center font-mono tabular-nums shrink-0 ${
                            isTop
                              ? 'bg-[#001489] text-white shadow-2xs'
                              : isUserPick
                              ? 'bg-[#001489]/10 text-[#001489] border border-[#001489]/20'
                              : 'bg-white border border-slate-200 text-slate-900'
                          }`}
                        >
                          <span className="text-[9px] uppercase font-bold tracking-wider opacity-80">
                            {item.date.month.slice(0, 3)}
                          </span>
                          <span className="text-base font-black leading-none">
                            {item.date.day}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold text-slate-900">
                              {item.date.month} {item.date.day}
                            </span>
                            <span className="text-xs text-slate-500">
                              ({item.date.dayName})
                            </span>
                            {isTop && (
                              <span className="px-1.5 py-0.2 rounded bg-[#F5B212] text-[#001489] font-black text-[9px] uppercase tracking-wider">
                                Top Pick
                              </span>
                            )}
                            {isUserPick && (
                              <span className="px-1.5 py-0.2 rounded bg-blue-100 text-[#001489] font-bold text-[9px] flex items-center gap-0.5">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                                <span>Your vote</span>
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] font-semibold text-[#001489] font-mono tabular-nums">
                            {item.votesCount} {item.votesCount === 1 ? 'vote' : 'votes'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-black font-mono tabular-nums text-slate-900">
                          {item.percentage}%
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2.5 h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${item.percentage}%` }}
                        className={`h-full transition-all duration-300 rounded-full ${
                          isTop ? 'bg-[#001489]' : 'bg-[#001489]/75'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Total Responses:{' '}
            <strong className="text-slate-900 font-mono tabular-nums">
              {totalVotesCount}
            </strong>
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#001489] hover:bg-[#001170] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
