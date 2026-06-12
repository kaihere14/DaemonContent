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
  message?: string;
  postId?: string;
  script: string;
  caption: string;
  score: number;
  reason: string;
}
