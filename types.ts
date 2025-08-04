export enum Prediction {
  BUY = 'BUY',
  SELL = 'SELL',
  WAIT = 'WAIT',
}

export type AnalysisStatus = 'won' | 'lost' | 'pending';

export interface AnalysisData {
  prediction: Prediction;
  assetName?: string;
  justification: string;
  entryPoint?: string;
  takeProfit?: string;
  stopLoss?: string;
}

export interface AnalysisResult extends AnalysisData {
  id: string;
  status: AnalysisStatus;
}

export interface ImageFile {
  name: string;
  base64: string;
  mimeType: string;
}