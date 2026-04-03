import { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import AppHeader from '../components/AppHeader';
import ConflictList from '../components/ConflictList';
import WeeklyWorkloadCard from '../components/WeeklyWorkloadCard';
import ConflictResolutionPanel from '../components/ConflictResolutionPanel';
import { collisionAPI } from '../services/api';

const CollisionAnalysisPage = () => {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await collisionAPI.analyzeCollisions();
      setAnalysis(response.data);
    } catch (err) {
      console.error('Error fetching collision analysis:', err);
      setError(err.response?.data?.message || 'Failed to load collision analysis');
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
                Collision Analysis
              </h1>
              <p className="section-subtitle mt-2">Monitor deadline conflicts and workload balance using the same calm visual system.</p>
            </div>
            <button onClick={fetchAnalysis} disabled={loading} className="secondary-btn self-start">
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {loading && (
            <div className="flex justify-center py-20">
              <div className="surface-card p-8 text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700"></div>
                <p className="text-slate-500">Analyzing your deadlines...</p>
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                  ['Same-Day Conflicts', analysis.collisions?.length || 0, 'Days with 3+ deadlines'],
                  ['Daily Overloads', analysis.heavyDays?.length || 0, 'Days exceeding 10 hours'],
                  ['Health Score', analysis.analysis?.healthScore || 100, 'Overall workload health'],
                ].map(([label, value, subtext]) => (
                  <div key={label} className="surface-card p-6">
                    <p className="text-sm text-slate-500">{label}</p>
                    <p className="mt-2 text-4xl font-semibold text-slate-900">{value}</p>
                    <p className="mt-2 text-xs text-slate-500">{subtext}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <ConflictList collisions={analysis.collisions} heavyDays={analysis.heavyDays} />
                </div>

                <div>
                  <WeeklyWorkloadCard analysis={analysis} />
                </div>
              </div>

              <ConflictResolutionPanel analysis={analysis} />

              {analysis.warnings && analysis.warnings.length > 0 && (
                <div className="surface-card p-6">
                  <h3 className="mb-4 text-xl font-semibold text-slate-900">Active Warnings</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {analysis.warnings.map((warning, index) => (
                      <div
                        key={index}
                        className={
                          warning.severity === 'critical'
                            ? 'alert-danger'
                            : warning.severity === 'high'
                            ? 'alert-warning'
                            : 'alert-info'
                        }
                      >
                        <p className="font-medium">{warning.message}</p>
                        <p className="mt-1 text-xs capitalize">Severity: {warning.severity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        </div>
      </main>
    </div>
  );
};

export default CollisionAnalysisPage;
