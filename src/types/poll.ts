export interface DateOption {
  id: string;
  month: string;
  monthShort?: string;
  day: number;
  dayName: string;
  year?: number;
  formattedDate?: string;
  shortLabel: string;
}

export interface PollConfig {
  title: string;
  purpose: string;
  description?: string;
  dates: DateOption[];
  updatedAt?: string;
}

export interface ParticipantResponse {
  id: string;
  selectedDateIds: string[]; // List of preferred date IDs
  submittedAt: string;
  // Backward compatibility with previous schema
  name?: string;
  department?: string;
  notes?: string;
  availability?: Record<string, string>;
}

export interface DateTally {
  date: DateOption;
  votesCount: number;
  percentage: number;
  isTopChoice: boolean;
}
