/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SimplePollPage } from './components/SimplePollPage';
import { AdminPage } from './components/AdminPage';
import { ResultsModal } from './components/ResultsModal';
import { PollConfig, ParticipantResponse } from './types/poll';
import { DEFAULT_POLL_CONFIG } from './data/initialData';
import {
  subscribePollConfig,
  updatePollConfig,
  subscribeVotes,
  submitVoteToFirestore,
  deleteVoteFromFirestore,
  clearAllVotesFromFirestore,
} from './services/pollService';
import { calculateDateTallies } from './utils/tallyUtils';

const LOCAL_STORAGE_VOTE_KEY = 'pnb_simple_user_vote_id_v3';

export default function App() {
  const [config, setConfig] = useState<PollConfig>(DEFAULT_POLL_CONFIG);
  const [votes, setVotes] = useState<ParticipantResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [latestSelectedDates, setLatestSelectedDates] = useState<string[]>([]);

  // User's vote ID from local storage
  const [userVoteId, setUserVoteId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_VOTE_KEY);
    } catch {
      return null;
    }
  });

  // /admin route detection
  const checkIsAdmin = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return (
      path === '/admin' ||
      path === '/admin/' ||
      path.startsWith('/admin') ||
      hash === '#admin' ||
      hash === '#/admin'
    );
  };

  const [isAdmin, setIsAdmin] = useState(checkIsAdmin);

  useEffect(() => {
    const handleUrlChange = () => {
      setIsAdmin(checkIsAdmin());
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Background subscription to Firestore Poll Config
  useEffect(() => {
    const unsubscribe = subscribePollConfig(
      (updatedConfig) => {
        setConfig(updatedConfig);
      },
      (error) => {
        console.warn('Config subscription notice:', error.message);
      }
    );
    return () => unsubscribe();
  }, []);

  // Background subscription to Firestore Votes
  useEffect(() => {
    const unsubscribe = subscribeVotes(
      (updatedVotes) => {
        setVotes(updatedVotes);
      },
      (error) => {
        console.warn('Votes subscription notice:', error.message);
      }
    );
    return () => unsubscribe();
  }, []);

  // Calculate live tallies
  const tallies = calculateDateTallies(config.dates, votes);

  const currentUserVote = userVoteId
    ? votes.find((v) => v.id === userVoteId) || null
    : null;

  const hasVoted = Boolean(currentUserVote);

  // Active chosen dates for the pop-up (either from latest submission or saved vote)
  const activeUserSelectedDates =
    latestSelectedDates.length > 0
      ? latestSelectedDates
      : currentUserVote?.selectedDateIds || [];

  // Instant optimistic vote submit (Zero latency)
  const handleVoteSubmit = async (selectedDateIds: string[]) => {
    const tempId = userVoteId || `temp_${Date.now()}`;
    setLatestSelectedDates(selectedDateIds);

    // 1. Instant optimistic state update
    const optimisticVote: ParticipantResponse = {
      id: tempId,
      selectedDateIds,
      submittedAt: new Date().toISOString(),
    };

    setVotes((prev) => {
      const filtered = prev.filter((v) => v.id !== tempId && v.id !== userVoteId);
      return [optimisticVote, ...filtered];
    });

    setUserVoteId(tempId);
    try {
      localStorage.setItem(LOCAL_STORAGE_VOTE_KEY, tempId);
    } catch (e) {
      console.error(e);
    }

    // Immediately pop up the results modal!
    setIsResultsOpen(true);

    // 2. Sync to Firebase in parallel
    try {
      setIsSubmitting(true);
      const savedId = await submitVoteToFirestore(
        selectedDateIds,
        currentUserVote?.id
      );
      setUserVoteId(savedId);
      try {
        localStorage.setItem(LOCAL_STORAGE_VOTE_KEY, savedId);
      } catch (e) {
        console.error(e);
      }
    } catch (err) {
      console.error('Failed to sync vote to Firebase:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCastAnotherVote = () => {
    setUserVoteId(null);
    setLatestSelectedDates([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_VOTE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveConfig = async (updatedConfig: PollConfig) => {
    await updatePollConfig(updatedConfig);
    setConfig(updatedConfig);
  };

  const handleDeleteVote = async (voteId: string) => {
    await deleteVoteFromFirestore(voteId);
    if (userVoteId === voteId) {
      handleCastAnotherVote();
    }
  };

  const handleClearAllVotes = async () => {
    await clearAllVotesFromFirestore();
    handleCastAnotherVote();
  };

  const handleBackToPoll = () => {
    window.history.pushState({}, '', '/');
    setIsAdmin(false);
  };

  // Admin View (accessible strictly via /admin)
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
        <AdminPage
          config={config}
          votes={votes}
          tallies={tallies}
          onSaveConfig={handleSaveConfig}
          onDeleteVote={handleDeleteVote}
          onClearAllVotes={handleClearAllVotes}
          onBackToPoll={handleBackToPoll}
        />
      </div>
    );
  }

  // Simple One-Page Poll View
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased">
      <SimplePollPage
        config={config}
        votes={votes}
        tallies={tallies}
        hasVoted={hasVoted}
        currentUserVote={currentUserVote}
        onSubmitVote={handleVoteSubmit}
        onOpenResults={() => setIsResultsOpen(true)}
        onCastAnotherVote={handleCastAnotherVote}
        isSubmitting={isSubmitting}
      />

      {/* Results Pop-up Modal: Shows thank you, your votes, and tally */}
      <ResultsModal
        isOpen={isResultsOpen}
        onClose={() => setIsResultsOpen(false)}
        tallies={tallies}
        dates={config.dates}
        totalVotesCount={votes.length}
        userSelectedDateIds={activeUserSelectedDates}
      />
    </div>
  );
}
