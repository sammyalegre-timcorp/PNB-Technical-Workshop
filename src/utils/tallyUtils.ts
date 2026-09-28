import { DateOption, ParticipantResponse, DateTally } from '../types/poll';

export function calculateDateTallies(
  dates: DateOption[],
  votes: ParticipantResponse[]
): DateTally[] {
  const totalVotes = votes.length;

  const tallies: DateTally[] = dates.map((date) => {
    let votesCount = 0;

    votes.forEach((v) => {
      if (Array.isArray(v.selectedDateIds)) {
        if (v.selectedDateIds.includes(date.id)) {
          votesCount++;
        }
      } else if (v.availability && v.availability[date.id] === 'yes') {
        votesCount++;
      }
    });

    const percentage =
      totalVotes > 0 ? Math.round((votesCount / totalVotes) * 100) : 0;

    return {
      date,
      votesCount,
      percentage,
      isTopChoice: false,
    };
  });

  // Determine top choice
  if (tallies.length > 0 && totalVotes > 0) {
    let maxVotes = 0;
    tallies.forEach((t) => {
      if (t.votesCount > maxVotes) {
        maxVotes = t.votesCount;
      }
    });

    if (maxVotes > 0) {
      tallies.forEach((t) => {
        if (t.votesCount === maxVotes) {
          t.isTopChoice = true;
        }
      });
    }
  }

  return tallies;
}

export function exportVotesToCSV(
  dates: DateOption[],
  votes: ParticipantResponse[]
): string {
  const headers = ['Voter #', 'Submitted At', ...dates.map((d) => d.shortLabel)];
  const rows = votes.map((v, index) => {
    const dateValues = dates.map((d) => {
      const isSelected =
        Array.isArray(v.selectedDateIds) && v.selectedDateIds.includes(d.id);
      return isSelected ? 'Preferred' : 'Not Selected';
    });

    return [
      `Voter ${index + 1}`,
      `"${new Date(v.submittedAt).toLocaleString()}"`,
      ...dateValues.map((val) => `"${val}"`),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
