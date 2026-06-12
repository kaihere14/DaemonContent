export interface IevaluationScores {
  hook: number;
  clarity: number;
  niche: number;
  voice: number;
  length: number;
}

export interface IevaluationResult {
  scores: IevaluationScores;
  passed: boolean;
  average: number;
  feedback: string;
}
