
export interface GospelStory {
  title: string;
  summary: string;
  moral: string;
  reflection: string;
}

export type GospelMode = 'cuento' | 'analogia' | 'dibujo' | 'oracion';

export interface Prayer {
  id: string;
  title: string;
  content: string;
  icon: string;
}

export enum Section {
  HOME = 'home',
  GOSPEL = 'gospel',
  PRAYERS = 'prayers',
  QUIZ = 'quiz',
  CHAT = 'chat'
}
