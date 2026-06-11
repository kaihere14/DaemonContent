export interface Iscript_agent {
  topic: string;
  length?: string;
  language?: string;
  tone?: string;
  style?: string;
  format?: string;
  purpose?: string;
}

export interface Iscript_agent_response {
  script: string;
  score: number;
  reason: string;
}
