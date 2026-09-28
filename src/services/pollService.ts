import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  deleteDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import { PollConfig, ParticipantResponse } from '../types/poll';
import { DEFAULT_POLL_CONFIG } from '../data/initialData';

const VOTES_COLLECTION_PATH = 'votes';

export function subscribePollConfig(
  onUpdate: (config: PollConfig) => void,
  onError?: (err: Error) => void
) {
  const configDocRef = doc(db, 'poll_config', 'main');

  return onSnapshot(
    configDocRef,
    async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as PollConfig;
        onUpdate({
          title: data.title || DEFAULT_POLL_CONFIG.title,
          purpose: data.purpose || DEFAULT_POLL_CONFIG.purpose,
          description: data.description ?? DEFAULT_POLL_CONFIG.description,
          dates: data.dates && data.dates.length > 0 ? data.dates : DEFAULT_POLL_CONFIG.dates,
          updatedAt: data.updatedAt,
        });
      } else {
        try {
          await setDoc(configDocRef, {
            ...DEFAULT_POLL_CONFIG,
            updatedAt: new Date().toISOString(),
          });
          onUpdate(DEFAULT_POLL_CONFIG);
        } catch (err) {
          console.error('Failed to initialize default poll config in Firestore:', err);
          onUpdate(DEFAULT_POLL_CONFIG);
        }
      }
    },
    (error) => {
      console.warn('Notice: Polling config subscription encountered error:', error.message);
      if (onError) onError(error);
      onUpdate(DEFAULT_POLL_CONFIG);
    }
  );
}

export async function updatePollConfig(config: PollConfig): Promise<void> {
  const configDocRef = doc(db, 'poll_config', 'main');
  await setDoc(configDocRef, {
    title: config.title,
    purpose: config.purpose,
    description: config.description || '',
    dates: config.dates,
    updatedAt: new Date().toISOString(),
  });
}

export function subscribeVotes(
  onUpdate: (votes: ParticipantResponse[]) => void,
  onError?: (err: Error) => void
) {
  const votesRef = collection(db, VOTES_COLLECTION_PATH);

  return onSnapshot(
    votesRef,
    (snapshot) => {
      const votes: ParticipantResponse[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        let selectedDateIds: string[] = [];

        if (Array.isArray(data.selectedDateIds)) {
          selectedDateIds = data.selectedDateIds;
        } else if (data.availability && typeof data.availability === 'object') {
          selectedDateIds = Object.entries(data.availability)
            .filter(([_, status]) => status === 'yes')
            .map(([dId]) => dId);
        }

        votes.push({
          id: docSnap.id,
          selectedDateIds,
          submittedAt: data.submittedAt || new Date().toISOString(),
        });
      });

      votes.sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
      onUpdate(votes);
    },
    (error) => {
      console.warn('Notice: Votes subscription encountered error:', error.message);
      if (onError) onError(error);
    }
  );
}

export async function submitVoteToFirestore(
  selectedDateIds: string[],
  existingVoteId?: string | null
): Promise<string> {
  const voteId =
    existingVoteId ||
    `vote_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const voteRef = doc(db, VOTES_COLLECTION_PATH, voteId);

  await setDoc(voteRef, {
    selectedDateIds,
    submittedAt: new Date().toISOString(),
  });

  return voteId;
}

export async function deleteVoteFromFirestore(voteId: string): Promise<void> {
  const voteRef = doc(db, VOTES_COLLECTION_PATH, voteId);
  await deleteDoc(voteRef);
}

export async function clearAllVotesFromFirestore(): Promise<void> {
  const votesRef = collection(db, VOTES_COLLECTION_PATH);
  const snapshot = await getDocs(votesRef);
  const batch = writeBatch(db);
  snapshot.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });
  await batch.commit();
}
