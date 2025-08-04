import React, { useMemo } from 'react';
import { AnalysisResult } from '../types';
import { ChartUpIcon } from './icons/ChartUpIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { ClockIcon } from './icons/ClockIcon';

interface MetricsProps {
  history: AnalysisResult[];
}

const MetricCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; description: string }> = ({ title, value, icon, description }) => (
  <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg flex items-start gap-4">
    <div className="flex-shrink-0 w-12 h-12 bg-gray-700/50 rounded-lg flex items-center justify-center">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-400 uppercase tracking-wider">{title}</p>
      <p className="text-3xl font-bold text-gray-100">{value}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  </div>
);

const Metrics: React.FC<MetricsProps> = ({ history }) => {
  const stats = useMemo(() => {
    const won = history.filter(h => h.status === 'won').length;
    const lost = history.filter(h => h.status === 'lost').length;
    const pending = history.filter(h => h.status === 'pending' && h.prediction !== 'WAIT').length;
    const tradesEvaluated = won + lost;
    const effectiveness = tradesEvaluated > 0 ? `${((won / tradesEvaluated) * 100).toFixed(1)}%` : 'N/A';

    return { won, lost, pending, tradesEvaluated, effectiveness };
  }, [history]);

  if (history.length === 0) {
      return (
        <section aria-labelledby="metrics-heading" className="animate-fade-in text-center text-gray-500 mt-12 bg-gray-800/30 py-16 rounded-lg">
            <h2 id="metrics-heading" className="text-3xl font-bold text-center mb-4 text-gray-300">Métricas de Rendimiento</h2>
            <p className="text-lg">No hay datos de análisis todavía.</p>
            <p>Vuelve al Analizador para empezar a generar señales.</p>
        </section>
      )
  }

  return (
    <section aria-labelledby="metrics-heading" className="animate-fade-in">
      <h2 id="metrics-heading" className="text-3xl font-bold text-center mb-8 text-gray-300">Métricas de Rendimiento</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
            <MetricCard
              title="Efectividad Total"
              value={stats.effectiveness}
              icon={<ChartUpIcon className="w-7 h-7 text-[#4d77ae]" />}
              description={`Basado en ${stats.tradesEvaluated} operaciones evaluadas (ganadas o perdidas).`}
            />
        </div>
        <MetricCard
          title="Trades Ganados"
          value={stats.won}
          icon={<CheckCircleIcon className="w-7 h-7 text-green-400" />}
          description="Operaciones marcadas como completadas con éxito."
        />
        <MetricCard
          title="Trades Perdidos"
          value={stats.lost}
          icon={<XCircleIcon className="w-7 h-7 text-red-400" />}
          description="Operaciones marcadas como cerradas con pérdidas."
        />
         <MetricCard
          title="Trades Pendientes"
          value={stats.pending}
          icon={<ClockIcon className="w-7 h-7 text-sky-400" />}
          description="Operaciones abiertas esperando un resultado."
        />
      </div>
    </section>
  );
};

export default Metrics;
