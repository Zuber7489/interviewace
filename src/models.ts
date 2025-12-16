
export type AppView = 'setup' | 'interview' | 'report';

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface InterviewConfig {
  primaryTechnology: string;
  secondarySkills: string;
  yearsOfExperience: number;
  interviewDuration: number; // in minutes
  resumeText?: string;
}

export interface Question {
  question: string;
  type: string;
}

export interface EvaluatedQuestion extends Question {
  answer: string;
  feedback: string;
  score: number; // 0-10
}

export interface InterviewSession {
  config: InterviewConfig;
  chatHistory: ChatMessage[];
  evaluatedQuestions: EvaluatedQuestion[];
  startTime: number;
  endTime?: number;
  overallScore?: number;
  overallFeedback?: string;
}
