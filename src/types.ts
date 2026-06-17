export interface Lesson {
  title: string;
  description: string;
}

export interface Framework {
  name: string;
  description: string;
  howToApply: string;
}

export interface DayPlan {
  dayNumber: number;
  dailyObjective: string;
  actionSteps: string[];
  estimatedTime: string;
  expectedOutcome: string;
}

export interface WeekPlan {
  weekNumber: number;
  weekTitle: string;
  days: DayPlan[];
}

export interface ActionPlan {
  weeks: WeekPlan[];
}

export interface BookSummary {
  mainIdea: string;
  coreThesis: string;
  keyBonusQuote?: string;
  keyLessons: Lesson[];
  importantFrameworks: Framework[];
  practicalInsights: string[];
  actionableTakeaways: string[];
}

export interface Concept {
  conceptName: string;
  explanation: string;
  importanceScore: number; // 1-100
  practicalApplication: string;
  relatedConcepts: string[];
}

export interface FlowchartNode {
  id: string;
  label: string;
  type: 'root' | 'chapter' | 'concept' | 'action' | string;
  description: string;
}

export interface FlowchartEdge {
  from: string;
  to: string;
  label?: string;
}

export interface BookFlowchart {
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
}

export interface BookAnalysis {
  title: string;
  author: string;
  tagline: string;
  summary: BookSummary;
  actionPlan: ActionPlan;
  concepts: Concept[];
  flowchart: BookFlowchart;
}

export interface SavedBook {
  id: string;
  title: string;
  author: string;
  tagline: string;
  timestamp: string;
  data: BookAnalysis;
}

export interface UserAccount {
  email: string;
  tier: 'free' | 'premium';
  isLoggedIn: boolean;
  savedBooks: SavedBook[];
}
