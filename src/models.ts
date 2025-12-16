
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
  language: 'English' | 'Hindi' | 'Hinglish';
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


export interface User {
  id: string;
  email: string;
  password: string; // Storing plain text for MVP as requested, but highly insecure in real world
  name: string;
}

export interface InterviewSession {
  id: string; // Add ID for history
  userId: string; // Link to user
  config: InterviewConfig;
  chatHistory: ChatMessage[];
  evaluatedQuestions: EvaluatedQuestion[];
  startTime: number;
  endTime?: number;
  overallScore?: number;
  overallFeedback?: string;
  date: string; // ISO string
}

