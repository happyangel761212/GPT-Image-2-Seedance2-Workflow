export interface SurveyResponse {
  id: string;
  submittedAt: string;

  // Section 1: Basic Info
  name: string;
  ageGroup: string;
  occupation: string;

  // Section 2: Learning Purpose
  educationPurpose: string;
  learningGoals: string[];

  // Section 3: Device & Digital
  laptopStatus: string;
  smartphoneLevel: string;
  digitalConfidence: string;
  digitalTools: string[];

  // Section 4: AI Experience
  aiExperience: string;
  usedAIServices: string[];
  paidAIServices: string[];
  aiUsagePurpose: string[];
  aiSelfLevel: string;

  // Section 5: Challenges
  currentChallenges: string[];
  messageToInstructor: string;

  // Computed scores
  digitalScore: number;
  aiScore: number;
  competencyGroup: string;
  recommendedDirection: string[];
}

export type AdminSession = {
  isLoggedIn: boolean;
  loginTime: string;
};
