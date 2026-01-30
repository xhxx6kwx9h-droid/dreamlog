export type Mood = "happy" | "sad" | "scary" | "romantic" | "weird" | "neutral";

export interface Dream {
  id: string;
  user_id: string;
  title: string;
  occurredAt: string;
  content: string;
  tags: string[];
  mood: Mood;
  intensity: number;
  lucid: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListDreamsFilter {
  query?: string;
  mood?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  day?: string;
}
