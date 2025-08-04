import React, { useState, useRef, useCallback, useMemo } from 'react';
import * as htmlToImage from 'html-to-image';
import { AnalysisResult, Prediction, AnalysisStatus } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { CaptureIcon } from './icons/CaptureIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { CalendarIcon } from './icons/CalendarIcon';

interface HistoryProps {
  history: AnalysisResult[];
  onDeleteItem: (id: string) => void;
  onUpdateStatus: (id: string, status: AnalysisStatus) => void;
}

const resultStyles: { [key in Prediction]: {
  borderColor: string;
  signalText: string;
  bgColor: string;
} } = {
  [Prediction.BUY]: {
    borderColor: 'border-green-500',
    signalText: 'text-green-400',
    bgColor: 'bg-green-500',
  },
  [Prediction.SELL]: {
    borderColor: 'border-red-500',
    signalText: 'text-red-400',
    bgColor: 'bg-red-500',
  },
  [Prediction.WAIT]: {
    borderColor: 'border-[#4d77ae]',
    signalText: 'text-[#4d77ae]',
    bgColor: 'bg-[#4d77ae]',
  },
};

const predictionLabels: { [key in Prediction]: string } = {
  [Prediction.BUY]: 'COMPRA',
  [Prediction.SELL]: 'VENTA',
  [Prediction.WAIT]: 'ESPERAR',
};

const statusStyles: { [key in AnalysisStatus]: { text: string; bg: string } } = {
    won: { text: 'text-green-300', bg: 'bg-green-500/20' },
    lost: { text: 'text-red-300', bg: 'bg-red-500/20' },
    pending: { text: 'text-sky-300', bg: 'bg-sky-500/20' },
};

const statusLabels: { [key in AnalysisStatus]: string } = {
    won: 'Ganada',
    lost: 'Perdida',
    pending: 'Pendiente',
};

const CopyableParameter: React.FC<{ label: string; value: string; valueClassName?: string }> = ({ label, value, valueClassName }) => {
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
        <div className="flex items-center group">
            <p>
                <strong className="text-gray-500 font-medium mr-2">{label}:</strong> 
                <span className={`font-mono ${valueClassName}`}>{value}</span>
            </p>
            <button 
                onClick={handleCopy} 
                disabled={isCopied}
                className="ml-2 p-1 rounded-full text-gray-500 hover:text-white hover:bg-gray-700/50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-100"
                aria-label={`Copiar ${label}`}
            >
                {isCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
            </button>
        </div>
    );
};

interface HistoryItemProps {
    result: AnalysisResult;
    onDelete: (id: string) => void;
    onUpdateStatus: (id: string, status: AnalysisStatus) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ result, onDelete, onUpdateStatus }) => {
    const styles = resultStyles[result.prediction];
    const label = predictionLabels[result.prediction];
    const showParameters = (result.prediction === Prediction.BUY || result.prediction === Prediction.SELL) && (result.entryPoint || result.takeProfit || result.stopLoss);
    const showTradeControls = result.prediction !== Prediction.WAIT;
    
    const itemRef = useRef<HTMLLIElement>(null);
    const controlsRef = useRef<HTMLDivElement>(null);
    const [isCopiedAsImage, setIsCopiedAsImage] = useState(false);

    const currentStatusStyle = statusStyles[result.status];
    const currentStatusLabel = statusLabels[result.status];

    const handleCapture = useCallback(async () => {
        if (!itemRef.current || isCopiedAsImage) return;
        const element = itemRef.current;
        const controls = controlsRef.current;
        if (controls) controls.style.opacity = '0';

        try {
            const blob = await htmlToImage.toBlob(element, { backgroundColor: '#1f2937', pixelRatio: 2 });
            if (!blob) throw new Error('Failed to generate image blob.');
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            setIsCopiedAsImage(true);
            setTimeout(() => setIsCopiedAsImage(false), 2500);
        } catch (err) {
            console.error('Failed to copy image to clipboard:', err);
            let alertMessage = 'No se pudo copiar la imagen. Es posible que tu navegador no soporte esta función o que se requieran permisos.';
            if (err instanceof Error) {
                if (err.name === 'NotAllowedError') {
                    alertMessage = 'Se necesita permiso para acceder al portapapeles. Por favor, habilítalo en tu navegador.';
                } else if (err.message.toLowerCase().includes('document is not focused')) {
                    alertMessage = 'No se pudo copiar. Asegúrate de que la ventana de la aplicación esté activa y visible e inténtalo de nuevo.';
                }
            }
            alert(alertMessage);
        } finally {
            if (controls) controls.style.opacity = '';
        }
    }, [isCopiedAsImage]);

    return (
        <li ref={itemRef} className={`relative group bg-gray-800/60 border-l-4 ${styles.borderColor} p-4 rounded-r-lg shadow-md animate-fade-in overflow-hidden`}>
            <div
                ref={controlsRef}
                className="absolute top-2 right-2 flex items-center gap-1 backdrop-blur-sm bg-gray-900/60 p-1 rounded-full transition-opacity duration-300 opacity-0 group-hover:opacity-100 focus-within:opacity-100"
            >
                {showTradeControls && (
                    <>
                        <button
                            onClick={() => onUpdateStatus(result.id, 'won')}
                            disabled={result.status === 'won'}
                            className="text-gray-400 p-1.5 rounded-full hover:bg-green-600/80 hover:text-white transition-colors disabled:text-green-400 disabled:hover:bg-transparent"
                            aria-label="Marcar como ganada"
                        >
                            <CheckCircleIcon className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => onUpdateStatus(result.id, 'lost')}
                            disabled={result.status === 'lost'}
                            className="text-gray-400 p-1.5 rounded-full hover:bg-red-600/80 hover:text-white transition-colors disabled:text-red-400 disabled:hover:bg-transparent"
                            aria-label="Marcar como perdida"
                        >
                            <XCircleIcon className="h-4 w-4" />
                        </button>
                        <div className="h-4 w-px bg-gray-600 mx-1"></div>
                    </>
                )}
                <button
                    onClick={handleCapture}
                    disabled={isCopiedAsImage}
                    className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-sky-600/80 transition-colors disabled:text-green-400 disabled:hover:bg-transparent"
                    aria-label="Capturar y copiar como imagen"
                >
                    {isCopiedAsImage ? <CheckIcon className="h-4 w-4" /> : <CaptureIcon />}
                </button>
                <button
                    onClick={() => onDelete(result.id)}
                    className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-red-600/80 transition-colors"
                    aria-label={`Eliminar análisis de ${result.assetName || 'activo desconocido'}`}
                >
                    <CloseIcon />
                </button>
            </div>
            <div className="flex items-center gap-3 mb-2">
                <div className={`h-3 w-3 rounded-full ${styles.bgColor}`}></div>
                <h3 className={`text-lg font-bold tracking-wide ${styles.signalText}`}>
                    {label}
                    {result.assetName && <span className="text-gray-500 font-medium"> - {result.assetName}</span>}
                </h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-3 pr-24">{result.justification}</p>
            {showParameters && (
                <div className="pl-6 pt-3 border-t border-gray-700/50 flex flex-col sm:flex-row sm:flex-wrap gap-x-6 gap-y-2 text-sm">
                    {result.entryPoint && <CopyableParameter label="Entrada" value={result.entryPoint} valueClassName="text-sky-400" />}
                    {result.takeProfit && <CopyableParameter label="Take Profit" value={result.takeProfit} valueClassName="text-green-400" />}
                    {result.stopLoss && <CopyableParameter label="Stop Loss" value={result.stopLoss} valueClassName="text-red-400" />}
                </div>
            )}
             {showTradeControls && (
                <div className={`absolute bottom-3 right-3 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full ${currentStatusStyle.bg} ${currentStatusStyle.text}`}>
                    {currentStatusLabel}
                </div>
            )}
        </li>
    );
};


const History: React.FC<HistoryProps> = ({ history, onDeleteItem, onUpdateStatus }) => {
    const [selectedDate, setSelectedDate] = useState('');

    const availableDates = useMemo(() => {
        return Array.from(new Set(history.map(item => item.id.split('T')[0])));
    }, [history]);

    const filteredHistory = useMemo(() => {
        if (!selectedDate) {
        return history;
        }
        return history.filter(item => item.id.startsWith(selectedDate));
    }, [history, selectedDate]);

    const getTodayString = () => new Date().toISOString().split('T')[0];

    return (
        <section aria-labelledby="history-heading">
            <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
                <h2 id="history-heading" className="text-3xl font-bold text-gray-300">Historial de Análisis</h2>
                
                <div className="flex items-center gap-4">
                     {selectedDate && (
                        <button
                            onClick={() => setSelectedDate('')}
                            className="text-sm text-sky-400 hover:text-sky-300 hover:underline focus:outline-none focus:ring-2 focus:ring-sky-500 rounded px-2 py-1"
                        >
                            Limpiar filtro
                        </button>
                    )}
                    <div className="relative w-11 h-11" title="Filtrar por fecha">
                        <input 
                            type="date"
                            list="available-dates"
                            value={selectedDate}
                            onChange={e => setSelectedDate(e.target.value)}
                            max={getTodayString()}
                            className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            style={{ colorScheme: 'dark' }}
                            aria-label="Filtrar historial por fecha"
                        />
                        <div className={`flex items-center justify-center w-full h-full rounded-lg bg-gray-700 transition-colors text-gray-400 peer-hover:bg-gray-600 peer-hover:text-gray-200 ${selectedDate ? 'bg-[#4d77ae]/20 text-[#4d77ae] ring-1 ring-[#4d77ae]' : ''}`}>
                            <CalendarIcon className="w-6 h-6" />
                        </div>
                        <datalist id="available-dates">
                            {availableDates.map(date => <option key={date} value={date} />)}
                        </datalist>
                    </div>
                </div>
            </div>

            {history.length === 0 ? (
                <div className="text-center text-gray-500 mt-8 bg-gray-800/30 py-12 rounded-lg max-w-4xl mx-auto">
                    <p className="text-lg">No hay historial de análisis.</p>
                    <p>Vuelve a la pestaña 'Analizador' para generar tu primer análisis.</p>
                </div>
            ) : filteredHistory.length === 0 ? (
                <div className="text-center text-gray-500 mt-8 bg-gray-800/30 py-12 rounded-lg max-w-4xl mx-auto">
                    <p className="text-lg">No se encontraron análisis para la fecha seleccionada.</p>
                    <p>Prueba a elegir otra fecha o a limpiar el filtro.</p>
                </div>
            ) : (
                <ul className="space-y-4 max-w-4xl mx-auto">
                    {filteredHistory.map(item => (
                        <HistoryItem key={item.id} result={item} onDelete={onDeleteItem} onUpdateStatus={onUpdateStatus} />
                    ))}
                </ul>
            )}
        </section>
    );
};

export default History;