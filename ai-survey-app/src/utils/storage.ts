import type { SurveyResponse } from '../types/survey';

const RESPONSES_KEY = 'ai_survey_responses';
const ADMIN_SESSION_KEY = 'ai_survey_admin_session';

export function getResponses(): SurveyResponse[] {
  const data = localStorage.getItem(RESPONSES_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveResponse(response: SurveyResponse): void {
  const responses = getResponses();
  responses.push(response);
  localStorage.setItem(RESPONSES_KEY, JSON.stringify(responses));
}

export function deleteResponse(id: string): void {
  const responses = getResponses().filter(r => r.id !== id);
  localStorage.setItem(RESPONSES_KEY, JSON.stringify(responses));
}

export function clearAllResponses(): void {
  localStorage.removeItem(RESPONSES_KEY);
}

export function isAdminLoggedIn(): boolean {
  const session = localStorage.getItem(ADMIN_SESSION_KEY);
  if (!session) return false;
  try {
    const { isLoggedIn } = JSON.parse(session);
    return isLoggedIn === true;
  } catch {
    return false;
  }
}

export function setAdminSession(loggedIn: boolean): void {
  if (loggedIn) {
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({
      isLoggedIn: true,
      loginTime: new Date().toISOString(),
    }));
  } else {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }
}
