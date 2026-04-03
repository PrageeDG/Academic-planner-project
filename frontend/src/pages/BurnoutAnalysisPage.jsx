import { useState, useEffect } from 'react';
import { RefreshCw, Lightbulb, AlertTriangle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import AppHeader from '../components/AppHeader';
import BurnoutMeter from '../components/BurnoutMeter';
import StressAnalyticsDashboard from '../components/StressAnalyticsDashboard';
import AcademicHeatmap from '../components/AcademicHeatmap';
import { burnoutAPI } from '../services/api';

const BurnoutAnalysisPage = () => {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await burnoutAPI.analyzeBurnout();
      setAnalysis(response.data);
    } catch (err) {
      console.error('Error fetching burnout analysis:', err);
      setError(err.response?.data?.message || 'Failed to load burnout analysis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="app-main">
        <AppHeader />
        <div className="page-body">
        <div className="page-shell">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="flex items-center gap-3 text-3xl font-semibold text-slate-900">
                <AlertTriangle className="h-8 w-8 text-slate-700" />
                Burnout Prediction
              </h1>
              <p className="section-subtitle mt-2">Monitor stress and workload using the same steady theme as the rest of the app.</p>
            </div>
            <button onClick={fetchAnalysis} disabled={loading} className="secondary-btn self-start">
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Analysis
            </button>
          </div>

          {loading && (
            <div className="flex justify-center py-20">
              <div className="surface-card p-8 text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700"></div>
                <p className="text-slate-500">Analyzing your workload and stress levels...</p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="alert-danger text-center">
              <AlertTriangle className="mx-auto mb-3 h-12 w-12" />
              <p className="font-medium">{error}</p>
              <button onClick={fetchAnalysis} className="secondary-btn mt-4">Try Again</button>
            </div>
          )}

          {!loading && !error && analysis && (
            <>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div>
                  <BurnoutMeter riskScore={analysis.riskScore} riskLevel={analysis.riskLevel} />
                </div>

                <div className="space-y-4 lg:col-span-2">
                  <div className="surface-card p-6">
                    <h3 className="mb-4 text-lg font-semibold text-slate-900">Your Risk Assessment</h3>
                    <div className="space-y-3">
                      {analysis.riskLevel === 'Low' && (
                        <div className="alert-success">
                          <p className="font-semibold">Healthy Status</p>
                          <p className="text-sm">Your workload is well-managed and sustainable.</p>
                        </div>
                      )}
                      {analysis.riskLevel === 'Moderate' && (
                        <div className="alert-warning">
                          <p className="font-semibold">Moderate Risk</p>
                          <p className="text-sm">Your workload is manageable but becoming stressful.</p>
                        </div>
                      )}
                      {analysis.riskLevel === 'High' && (
                        <div className="alert-danger">
                          <p className="font-semibold">High Risk</p>
                          <p className="text-sm">Your burnout risk is high. Seek support and redistribute work where possible.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="alert-info flex items-start gap-3">
                    <Lightbulb className="mt-0.5 h-5 w-5 shrink-0" />
                    <div>
                      <h4 className="mb-1 font-semibold">Quick Tip</h4>
                      <p className="text-sm">
                        {analysis.riskScore >= 71
                          ? 'Prioritize your mental health and talk to your academic advisor about workload adjustments.'
                          : analysis.riskScore >= 41
                          ? 'Break down larger tasks into smaller, manageable study blocks.'
                          : 'Keep the current pace and preserve your healthy balance.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <StressAnalyticsDashboard analysis={analysis} />
              <AcademicHeatmap heavyDays={analysis.heavyDays} />

              {analysis.suggestions && analysis.suggestions.length > 0 && (
                <div className="surface-card p-6">
                  <h3 className="mb-4 text-lg font-semibold text-slate-900">Personalized Recommendations</h3>
                  <div className="space-y-3">
                    {analysis.suggestions.map((suggestion, index) => (
                      <div key={index} className="soft-card flex items-start gap-3 p-4">
                        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-slate-500"></div>
                        <p className="text-sm text-slate-700">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="alert-info text-center">
                <p className="text-sm">Your health comes first. If you are feeling overwhelmed, reach out for support early.</p>
              </div>
            </>
          )}
        </div>
        </div>
      </main>
    </div>
  );
};

export default BurnoutAnalysisPage;
