export interface Projeto {
  id: string;
  nome: string;
  userId: string;
  criadoEm: number;
}

export interface Caderno {
  id: string;
  projetoId: string;
  nome: string;
  userId: string;
  criadoEm: number;
}

export interface Materia {
  id: string;
  cadernoId: string;
  projetoId: string;
  nome: string;
  userId: string;
  criadoEm: number;
}

export interface SM2State {
  interval: number;
  repetitions: number;
  easeFactor: number;
  lastReview: number;
  nextReview: number;
  lastQuality: number;
}

export interface Questao {
  id: string;
  materiaId: string;
  cadernoId: string;
  projetoId: string;
  userId: string;
  enunciado: string;
  alternativas: { A?: string; B?: string; C?: string; D?: string; E?: string };
  gabarito: 'A' | 'B' | 'C' | 'D' | 'E';
  explicacao?: string;
  banca?: string;
  ano?: string;
  sm2: SM2State | null;
  criadoEm: number;
}

export type NovaQuestao = Omit<Questao, 'id' | 'userId' | 'criadoEm' | 'sm2'>;
