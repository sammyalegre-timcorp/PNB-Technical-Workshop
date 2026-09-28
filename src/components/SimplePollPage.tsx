import React, { useState } from 'react';
import { PollConfig, ParticipantResponse, DateTally } from '../types/poll';
import { PNBLogo } from './PNBLogo';
import { Check, ArrowRight, CheckCircle2, BarChart3, RotateCcw } from 'lucide-react';

interface SimplePollPageProps {
  config: PollConfig;
  votes: ParticipantResponse[];
  tallies: DateTally[];
  hasVoted: boolean;
  currentUserVote: ParticipantResponse | null;
  onSubmitVote: (selectedDateIds: string[]) => void;
  onOpenResults: () => void;
  onCastAnotherVote: () => void;
  isSubmitting: boolean;
}

export const SimplePollPage: React.FC<SimplePollPageProps> = ({
  config,
  votes,
  tallies,
  hasVoted,
  currentUserVote,
  onSubmitVote,
  onOpenResults,
  onCastAnotherVote,
  isSubmitting,
}) => {
  const [selectedDateIds, setSelectedDateIds] = useState<string[]>(() => {
    if (currentUserVote?.selectedDateIds && currentUserVote.selectedDateIds.length > 0) {
      return [...currentUserVote.selectedDateIds];
    }
    return [];
  });
  const [errorMsg, setErrorMsg] = useState('');

  const toggleDate = (dateId: string) => {
    setSelectedDateIds((prev) =>
      prev.includes(dateId)
        ? prev.filter((id) => id !== dateId)
        : [...prev, dateId]
    );
  };

  const handleSelectAll = () => {
    setSelectedDateIds(config.dates.map((d) => d.id));
  };

  const handleClear = () => {
    setSelectedDateIds([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDateIds.length === 0) {
      setErrorMsg('Please click at least one date you prefer.');
      return;
    }
    setErrorMsg('');
    onSubmitVote(selectedDateIds);
  };

  const months = Array.from(new Set(config.dates.map((d) => d.month)));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Brand Header */}
      <div className="flex flex-col items-center justify-center text-center mb-6">
        <PNBLogo size="md" />
      </div>

      {/* Main Single Page Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* PNB Brand Accent Strip */}
        <div className="h-2.5 w-full bg-gradient-to-r from-[#001489] via-[#009FDC] to-[#E31B23]" />

        <div className="p-6 sm:p-8">
          {/* Header Block: Title - (TBA), Purpose: Technical Workshop */}
          <div className="text-center sm:text-left pb-5 border-b border-slate-100">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#001489]/5 text-[#001489] text-[11px] font-bold uppercase tracking-wider mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#001489]" />
              <span>Scheduling Poll</span>
            </div>

            {/* Title - (TBA) */}
            <h1 className="text-2xl sm:text-3xl font-black text-[#001489] tracking-tight">
              {config.title || 'Title - (TBA)'}
            </h1>

            {/* Purpose: Technical Workshop */}
            <div className="mt-2.5 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm">
              <span className="text-slate-500 font-medium">Purpose:</span>
              <span className="font-bold text-[#001489] bg-blue-50/80 border border-blue-200/80 px-3 py-0.5 rounded-md">
                {config.purpose || 'Technical Workshop'}
              </span>
            </div>

            {config.description && (
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {config.description}
              </p>
            )}
          </div>

          {/* Date Options Summary Header */}
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mb-6">
            <div className="flex items-center flex-wrap gap-1.5 text-slate-600">
              <span className="font-semibold text-slate-800">Date Options:</span>
              {months.map((month) => {
                const monthDates = config.dates.filter((d) => d.month === month);
                return (
                  <span
                    key={month}
                    className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-800"
                  >
                    <strong className="font-bold text-[#001489]">{month}:</strong>{' '}
                    <span className="font-mono tabular-nums">
                      {monthDates.map((d) => d.day).join(', ')}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* If the user has already voted, show confirmation card with button to view results pop-up */}
          {hasVoted ? (
            <div className="py-6 text-center space-y-4 animate-in fade-in duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-100 mx-auto flex items-center justify-center shadow-xs">
                <Check className="w-7 h-7 text-emerald-700 stroke-[3]" />
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Thank you for voting!
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Your preferred workshop dates have been submitted. You can view the live results tally anytime.
                </p>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onOpenResults}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#001489] hover:bg-[#001170] text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  <BarChart3 className="w-4 h-4 text-[#F5B212]" />
                  <span>View Results Tally &amp; Your Vote</span>
                </button>

                <button
                  type="button"
                  onClick={onCastAnotherVote}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Cast Another Vote</span>
                </button>
              </div>
            </div>
          ) : (
            /* Voting Form: NO results visible until they click submit */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Pick Your Preferred Date(s)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click the dates that work for you.
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md font-medium transition-colors cursor-pointer"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-2.5 py-1 text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Date Options by Month */}
              <div className="space-y-5">
                {months.map((month) => {
                  const monthDates = config.dates.filter((d) => d.month === month);
                  return (
                    <div key={month}>
                      <div className="flex items-center justify-between pb-1.5 mb-2.5 border-b border-slate-100">
                        <span className="text-xs font-bold text-[#001489] uppercase tracking-wider">
                          {month} Options
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Fridays
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {monthDates.map((date) => {
                          const isSelected = selectedDateIds.includes(date.id);
                          return (
                            <button
                              key={date.id}
                              type="button"
                              onClick={() => toggleDate(date.id)}
                              className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                                isSelected
                                  ? 'border-[#001489] bg-[#001489]/5 ring-2 ring-[#001489]/30 shadow-xs'
                                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                              }`}
                            >
                              <div className="flex items-center gap-3.5">
                                {/* Date Numeral */}
                                <div
                                  className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center font-mono tabular-nums shrink-0 transition-colors ${
                                    isSelected
                                      ? 'bg-[#001489] text-white shadow-2xs'
                                      : 'bg-slate-100 text-slate-800'
                                  }`}
                                >
                                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                                    {date.month.slice(0, 3)}
                                  </span>
                                  <span className="text-xl font-black leading-none">
                                    {date.day}
                                  </span>
                                </div>

                                <div>
                                  <div className="text-sm font-bold text-slate-900">
                                    {date.month} {date.day}
                                  </div>
                                  <div className="text-xs text-slate-500 font-medium">
                                    {date.dayName}
                                  </div>
                                </div>
                              </div>

                              {/* Selection Checkmark */}
                              <div
                                className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                                  isSelected
                                    ? 'bg-[#001489] border-[#001489] text-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Submit Action Bar */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  {selectedDateIds.length > 0 ? (
                    <strong className="text-[#001489] font-medium">
                      {selectedDateIds.length}{' '}
                      {selectedDateIds.length === 1 ? 'date' : 'dates'} selected
                    </strong>
                  ) : (
                    'Click the dates you prefer above'
                  )}
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 px-7 py-2.5 bg-[#001489] hover:bg-[#001170] text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  <span>Submit Vote</span>
                  <ArrowRight className="w-4 h-4 text-[#F5B212]" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
