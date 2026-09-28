import React, { useState } from 'react';
import { PollConfig, DateOption, ParticipantResponse, DateTally } from '../types/poll';
import { DEFAULT_POLL_CONFIG } from '../data/initialData';
import { exportVotesToCSV } from '../utils/tallyUtils';
import { PNBLogo } from './PNBLogo';
import {
  Settings,
  Calendar,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  ArrowLeft,
  Users,
  Download,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface AdminPageProps {
  config: PollConfig;
  votes: ParticipantResponse[];
  tallies: DateTally[];
  onSaveConfig: (updatedConfig: PollConfig) => Promise<void>;
  onDeleteVote: (voteId: string) => Promise<void>;
  onClearAllVotes: () => Promise<void>;
  onBackToPoll: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  config,
  votes,
  tallies,
  onSaveConfig,
  onDeleteVote,
  onClearAllVotes,
  onBackToPoll,
}) => {
  const [title, setTitle] = useState(config.title);
  const [purpose, setPurpose] = useState(config.purpose);
  const [description, setDescription] = useState(config.description || '');
  const [dates, setDates] = useState<DateOption[]>(config.dates);

  // New date option inputs
  const [newMonth, setNewMonth] = useState('October');
  const [newDay, setNewDay] = useState(16);
  const [newDayName, setNewDayName] = useState('Friday');
  const [newYear, setNewYear] = useState(2026);

  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleAddDate = () => {
    if (!newDay || isNaN(newDay)) return;
    const shortLabel = `${newMonth.slice(0, 3)} ${newDay}`;
    const newDateItem: DateOption = {
      id: `${newMonth.toLowerCase().slice(0, 3)}-${newDay < 10 ? '0' + newDay : newDay}-${Date.now().toString(36).slice(-3)}`,
      month: newMonth,
      monthShort: newMonth.slice(0, 3).toUpperCase(),
      day: Number(newDay),
      dayName: newDayName,
      year: Number(newYear),
      formattedDate: `${newDayName}, ${newMonth} ${newDay}`,
      shortLabel,
    };

    setDates((prev) => [...prev, newDateItem]);
    showStatus(`Added ${shortLabel} to list. Click 'Save All Changes to Firebase' to persist.`);
  };

  const handleRemoveDate = (id: string) => {
    setDates((prev) => prev.filter((d) => d.id !== id));
    showStatus('Date option removed from list.');
  };

  const handleResetDefaultDates = () => {
    if (window.confirm('Reset dates to the initial October & November defaults?')) {
      setDates(DEFAULT_POLL_CONFIG.dates);
      showStatus('Dates reset to defaults.');
    }
  };

  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || !purpose.trim()) {
      showStatus('Title and Purpose cannot be blank.', 'error');
      return;
    }
    if (dates.length === 0) {
      showStatus('You must have at least one date option.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await onSaveConfig({
        title: title.trim(),
        purpose: purpose.trim(),
        description: description.trim(),
        dates,
        updatedAt: new Date().toISOString(),
      });
      showStatus('Poll options successfully saved to Firebase!');
    } catch (err) {
      showStatus(err instanceof Error ? err.message : 'Error saving to Firebase.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadCSV = () => {
    const csv = exportVotesToCSV(dates, votes);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PNB_Poll_Responses_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      {/* Admin Top Header with PNB Branding */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <PNBLogo size="sm" showText={false} />
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#001489] text-[#F5B212] font-mono text-[11px] font-bold uppercase tracking-wider">
                /admin
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                PNB Poll Administration
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Edit options and manage date selections in Firebase Firestore.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToPoll}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#001489] bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Live Poll</span>
        </button>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in duration-150 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* General Settings */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h2 className="text-xs font-bold text-[#001489] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
          <Settings className="w-4 h-4 text-[#001489]" />
          <span>General Poll Details</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Poll Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Title - (TBA)"
              className="w-full px-3 py-2 text-sm bg-slate-50/50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#001489]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Purpose
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Technical Workshop"
              className="w-full px-3 py-2 text-sm bg-slate-50/50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#001489]/30"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Optional Context / Instructions
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Please mark all dates you are available to attend."
            className="w-full px-3 py-2 text-sm bg-slate-50/50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#001489]/30"
          />
        </div>
      </div>

      {/* Date Options Manager */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-xs font-bold text-[#001489] uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#001489]" />
              <span>Poll Date Options ({dates.length})</span>
            </h2>
            <p className="text-xs text-slate-500">
              Add or remove proposed dates for voters to select.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetDefaultDates}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Defaults (Oct 2,9,23,30 / Nov 6,20)</span>
          </button>
        </div>

        {/* Existing Dates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {dates.map((d, index) => (
            <div
              key={d.id}
              className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between group hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-[#001489]/50">
                  {index + 1}.
                </span>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {d.month} {d.day}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {d.dayName} {d.year ? `· ${d.year}` : ''}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveDate(d.id)}
                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                title="Remove date"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Date Box */}
        <div className="p-4 bg-slate-50/60 border border-dashed border-slate-300 rounded-xl space-y-3">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            + Add Another Date Option
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Month
              </label>
              <select
                value={newMonth}
                onChange={(e) => setNewMonth(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
              >
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
                <option value="January">January</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Day
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={newDay}
                onChange={(e) => setNewDay(parseInt(e.target.value, 10))}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Day of Week
              </label>
              <select
                value={newDayName}
                onChange={(e) => setNewDayName(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
              >
                <option value="Friday">Friday</option>
                <option value="Thursday">Thursday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Monday">Monday</option>
                <option value="Saturday">Saturday</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAddDate}
                className="w-full py-1.5 px-3 bg-[#001489] hover:bg-[#001170] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Date</span>
              </button>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={() => handleSaveAll()}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#001489] hover:bg-[#001170] disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Save className="w-4 h-4 text-[#F5B212]" />
            <span>{isSaving ? 'Saving to Firebase...' : 'Save All Changes to Firebase'}</span>
          </button>
        </div>
      </div>

      {/* Recorded Responses Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-xs font-bold text-[#001489] uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-[#001489]" />
              <span>Recorded Responses ({votes.length})</span>
            </h2>
            <p className="text-xs text-slate-500">
              Live responses stored in Firebase `/votes`.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadCSV}
              disabled={votes.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                if (window.confirm('Delete ALL votes from Firebase? This cannot be undone.')) {
                  await onClearAllVotes();
                  showStatus('All votes have been cleared.');
                }
              }}
              disabled={votes.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Votes</span>
            </button>
          </div>
        </div>

        {votes.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs italic">
            No votes recorded in Firebase yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Voter #</th>
                  <th className="py-2.5 px-3">Selected Dates</th>
                  <th className="py-2.5 px-3">Submitted At</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {votes.map((v, index) => {
                  const selectedLabels = dates
                    .filter((d) => v.selectedDateIds.includes(d.id))
                    .map((d) => d.shortLabel);

                  return (
                    <tr key={v.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        Voter {index + 1}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {selectedLabels.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {selectedLabels.map((lbl) => (
                              <span
                                key={lbl}
                                className="px-2 py-0.5 rounded bg-blue-50 text-[#001489] font-mono text-[11px] font-semibold border border-blue-200/60"
                              >
                                {lbl}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                        {new Date(v.submittedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={async () => {
                            if (window.confirm('Delete this vote record?')) {
                              await onDeleteVote(v.id);
                              showStatus('Vote record deleted.');
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                          title="Delete response"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
