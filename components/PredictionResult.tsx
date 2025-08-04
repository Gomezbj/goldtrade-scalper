import React, { useState } from 'react';
import { AnalysisResult, Prediction } from '../types';
import { BuyIcon } from './icons/BuyIcon';
import { SellIcon } from './icons/SellIcon';
import { WaitIcon } from './icons/WaitIcon';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';

interface PredictionResultProps {
  result: AnalysisResult;
}

const resultStyles: { [key in Prediction]: {
  container: string;
  signalText: string;
  icon: React.ReactNode;
} } = {
  [Prediction.BUY]: {
    container: 'bg-green-900/50 border-green-500',
    signalText: 'text-green-400',
    icon: <BuyIcon />,
  },
  [Prediction.SELL]: {
    container: 'bg-red-900/50 border-red-500',
    signalText: 'text-red-400',
    icon: <SellIcon />,
  },
  [Prediction.WAIT]: {
    container: 'bg-[#4d77ae]/20 border-[#4d77ae]',
    signalText: 'text-[#4d77ae]',
    icon: <WaitIcon />,
  },
};

const predictionLabels: { [key in Prediction]: string } = {
  [Prediction.BUY]: 'COMPRA',
  [Prediction.SELL]: 'VENTA',
  [Prediction.WAIT]: 'ESPERAR',
};

const ParameterDisplay: React.FC<{ label: string; value: string; valueClassName?: string }> = ({ label, value, valueClassName }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = async () => {
        if (isCopied) return;
        try {
            await navigator.clipboard.writeText(value);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Fallo al copiar texto: ', err);
        }
    };

    return (
        <div className="relative text-center bg-gray-800/50 p-3 rounded-lg group">
            <p className="text-sm text-gray-400 uppercase tracking-wider">{label}</p>
            <p className={`text-xl font-bold ${valueClassName || 'text-gray-200'}`}>{value}</p>
            <button
                onClick={handleCopy}
                disabled={isCopied}
                className="absolute top-1/2 -translate-y-1/2 right-3 p-1.5 rounded-full text-gray-400 hover:text-white bg-gray-900/40 hover:bg-gray-700/60 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 disabled:opacity-100 disabled:bg-transparent"
                aria-label={`Copiar ${label}`}
            >
                {isCopied ? <CheckIcon className="h-5 w-5 text-green-400" /> : <CopyIcon className="h-5 w-5" />}
            </button>
        </div>
    );
};


const PredictionResult: React.FC<PredictionResultProps> = ({ result }) => {
  const styles = resultStyles[result.prediction];
  const label = predictionLabels[result.prediction];
  const showParameters = (result.prediction === Prediction.BUY || result.prediction === Prediction.SELL) && (result.entryPoint || result.takeProfit || result.stopLoss);

  return (
    <div className={`border-2 ${styles.container} rounded-xl p-6 shadow-2xl transition-all duration-500 animate-fade-in`}>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="flex-shrink-0">
          {styles.icon}
        </div>
        <div className="text-center sm:text-left">
          <p className="text-lg text-gray-400 mb-1">Predicción de IA</p>
          <h2 className={`text-5xl font-extrabold tracking-wider ${styles.signalText}`}>
            {label}
            {result.assetName && <span className="text-gray-400 font-semibold text-4xl"> - {result.assetName}</span>}
          </h2>
        </div>
      </div>
      
      {showParameters && (
        <div className="mt-6 pt-6 border-t border-gray-700 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {result.entryPoint && <ParameterDisplay label="Punto de Entrada" value={result.entryPoint} valueClassName="text-sky-300" />}
            {result.takeProfit && <ParameterDisplay label="Take Profit" value={result.takeProfit} valueClassName="text-green-400" />}
            {result.stopLoss && <ParameterDisplay label="Stop Loss" value={result.stopLoss} valueClassName="text-red-400" />}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-700">
        <h3 className="text-lg font-semibold text-gray-300 mb-2">Justificación:</h3>
        <p className="text-gray-400 leading-relaxed">{result.justification}</p>
      </div>
    </div>
  );
};

export default PredictionResult;
