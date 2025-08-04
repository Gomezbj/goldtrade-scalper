import React, { useState, useCallback, useRef } from 'react';
import { ImageFile, AnalysisResult, AnalysisStatus } from './types';
import { analyzeMarketImages } from './services/geminiService';
import ImageUploader, { ImageUploaderHandles } from './components/ImageUploader';
import PredictionResult from './components/PredictionResult';
import { LogoIcon } from './components/icons/LogoIcon';
import History from './components/History';
import Metrics from './components/Metrics';

const TabButton: React.FC<{ name: string; active: boolean; onClick: () => void }> = ({ name, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 text-lg font-semibold border-b-4 transition-colors duration-300 -mb-px
      ${
        active
          ? 'text-[#4d77ae] border-[#4d77ae]'
          : 'text-gray-500 border-transparent hover:text-gray-300 hover:border-gray-600'
      }`}
    aria-current={active ? 'page' : undefined}
  >
    {name}
  </button>
);


const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'metrics'>('metrics');
  const [higherTimeframeImg, setHigherTimeframeImg] = useState<ImageFile | null>(null);
  const [lowerTimeframeImg, setLowerTimeframeImg] = useState<ImageFile | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const higherUploaderRef = useRef<ImageUploaderHandles>(null);
  const lowerUploaderRef = useRef<ImageUploaderHandles>(null);

  const handleAnalysis = useCallback(async () => {
    if (!higherTimeframeImg || !lowerTimeframeImg) {
      setError("Por favor, sube imágenes para ambas temporalidades.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const apiResult = await analyzeMarketImages(higherTimeframeImg, lowerTimeframeImg);
      const resultWithId: AnalysisResult = {
        ...apiResult,
        id: `${new Date().toISOString()}-${Math.random()}`,
        status: 'pending',
      };
      setAnalysisResult(resultWithId);
      setHistory(prevHistory => [resultWithId, ...prevHistory]);

      higherUploaderRef.current?.clear();
      lowerUploaderRef.current?.clear();

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Ocurrió un error desconocido durante el análisis.");
    } finally {
      setIsLoading(false);
    }
  }, [higherTimeframeImg, lowerTimeframeImg]);

  const handleClear = () => {
    higherUploaderRef.current?.clear();
    lowerUploaderRef.current?.clear();
    setAnalysisResult(null);
    setError(null);
  };

  const handleDeleteHistoryItem = useCallback((idToDelete: string) => {
    setHistory(prevHistory => prevHistory.filter(item => item.id !== idToDelete));
  }, []);
  
  const handleUpdateHistoryStatus = useCallback((idToUpdate: string, status: AnalysisStatus) => {
    setHistory(prevHistory =>
      prevHistory.map(item =>
        item.id === idToUpdate ? { ...item, status } : item
      )
    );
  }, []);

  const canAnalyze = higherTimeframeImg && lowerTimeframeImg && !isLoading;
  const canClear = (higherTimeframeImg || lowerTimeframeImg) && !isLoading;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <LogoIcon />
            <div className="flex items-baseline justify-center gap-x-2">
                <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] to-[#2b63c0]">
                    Goldtrade.AI
                </h1>
                <span className="font-bold text-[#4d77ae] uppercase" style={{fontSize: '15px'}}>
                    BETA
                </span>
            </div>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Sube imágenes del gráfico en dos temporalidades diferentes. Nuestra IA analizará los patrones fractales para proporcionar una señal de trading completa.
          </p>
        </header>
        
        <div className="mb-8 flex justify-center border-b border-gray-700">
          <TabButton name="Métricas" active={activeTab === 'metrics'} onClick={() => setActiveTab('metrics')} />
          <TabButton name="Analizador" active={activeTab === 'analyzer'} onClick={() => setActiveTab('analyzer')} />
        </div>

        <main className="w-full">
         {activeTab === 'analyzer' && (
            <div className="animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <ImageUploader
                    ref={higherUploaderRef}
                    title="Temporalidad Mayor"
                    onImageUpload={setHigherTimeframeImg}
                    disabled={isLoading}
                    />
                    <ImageUploader
                    ref={lowerUploaderRef}
                    title="Temporalidad Menor"
                    onImageUpload={setLowerTimeframeImg}
                    disabled={isLoading}
                    />
                </div>

                <div className="flex justify-center items-center gap-4 mb-8">
                    <button
                    onClick={handleClear}
                    disabled={!canClear}
                    className="px-8 py-3 text-lg font-semibold text-gray-300 bg-gray-700 rounded-lg shadow-md hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-300 ease-in-out"
                    aria-label="Limpiar imágenes cargadas"
                    >
                    Limpiar
                    </button>
                    <button
                    onClick={handleAnalysis}
                    disabled={!canAnalyze}
                    className="px-8 py-3 text-lg font-semibold text-white bg-[#4d77ae] rounded-lg shadow-lg hover:bg-[#3b82f6] disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-400 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:transform-none flex items-center justify-center"
                    >
                    {isLoading ? (
                        <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analizando...
                        </>
                    ) : "Analizar Mercado"}
                    </button>
                </div>
                
                {error && (
                    <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative text-center" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {analysisResult && (
                    <div className="mb-12">
                    <PredictionResult result={analysisResult} />
                    </div>
                )}

                {history.length > 0 && (
                    <History history={history} onDeleteItem={handleDeleteHistoryItem} onUpdateStatus={handleUpdateHistoryStatus} />
                )}
            </div>
         )}
         {activeTab === 'metrics' && (
            <Metrics history={history} />
         )}

        </main>
      </div>
    </div>
  );
};

export default App;