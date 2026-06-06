import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UploadCloud, ShieldCheck, ShieldAlert, Activity, BarChart3, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '@/App.css';

const BACKEND_URL = "https://nids-sentinel-project.onrender.com";
const API = `${BACKEND_URL}/api`;

function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API}/predict`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/results', { state: { results: response.data } });
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to analyze file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
      <div className="noise-texture" />
      
      {/* Hero Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-zinc-950/0 to-zinc-950/0" />
        <img 
          src="https://images.unsplash.com/photo-1762279388956-1c098163a2a8?crop=entropy&cs=srgb&fm=jpg&q=85" 
          alt="Network background"
          className="w-full h-full object-cover opacity-20"
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 md:p-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="p-2 bg-blue-600/20 rounded-lg border border-blue-500/30">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-2xl tracking-tight text-zinc-50" data-testid="app-title">
                NIDS Sentinel
              </h1>
              <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">Network Intrusion Detection</p>
            </div>
          </motion.div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-6 md:p-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-3xl"
          >
            <div className="text-center mb-12">
              <h2 className="font-heading font-extrabold text-4xl lg:text-5xl tracking-tight mb-4" data-testid="upload-heading">
                Analyze Network Traffic
              </h2>
              <p className="font-sans text-base text-zinc-400 max-w-xl mx-auto">
  Upload your CSV file to detect potential network intrusions using advanced machine learning models.
</p>
            </div>

            {/* Upload Zone */}
            <div
              data-testid="upload-zone"
              className={`border-2 border-dashed rounded-xl p-12 transition-all duration-300 cursor-pointer relative overflow-hidden ${
                isDragging
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-zinc-700 hover:border-blue-500/50 hover:bg-blue-500/5'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input').click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                data-testid="file-input"
              />

              <div className="flex flex-col items-center justify-center gap-4">
                <div className="p-6 bg-zinc-900/50 rounded-full border border-zinc-800">
                  <UploadCloud className="w-12 h-12 text-blue-400" />
                </div>

                {file ? (
                  <div className="text-center">
                    <div className="flex items-center gap-2 justify-center mb-2">
                      <FileText className="w-5 h-5 text-emerald-400" />
                      <span className="font-medium text-zinc-100" data-testid="file-name">{file.name}</span>
                    </div>
                    <p className="text-sm text-zinc-500">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="font-medium text-zinc-100 mb-1">Drop your CSV file here</p>
                    <p className="text-sm text-zinc-500">or click to browse</p>
                  </div>
                )}
              </div>

              {/* Glowing border effect */}
              <div className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 border-2 border-transparent bg-gradient-to-r from-transparent via-blue-500 to-transparent [mask-image:linear-gradient(transparent,white,transparent)]" />
              </div>
            </div>

            {/* Action Button */}
            {file && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex justify-center"
              >
                <button
                  data-testid="analyze-button"
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="h-12 px-8 rounded-md font-medium bg-blue-600 hover:bg-blue-500 text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
                >
                  {isUploading ? (
                    <span className="flex items-center gap-2">
                      <Activity className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Analyze Traffic
                    </span>
                  )}
                </button>
              </motion.div>
            )}

            {/* Info Cards */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: ShieldCheck, label: 'Random Forest', desc: 'High accuracy ensemble' },
                { icon: Activity, label: 'SVM Model', desc: 'Robust classification' },
                { icon: BarChart3, label: 'Real-time Results', desc: 'Instant predictions' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className="bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-sm rounded-lg p-6"
                >
                  <item.icon className="w-8 h-8 text-blue-400 mb-3" />
                  <h3 className="font-heading font-semibold text-lg text-zinc-100 mb-1">{item.label}</h3>
                  <p className="text-sm text-zinc-500">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function ResultsPage() {
  const navigate = useNavigate();
  const results = window.history.state?.usr?.results;

  if (!results) {
    navigate('/');
    return null;
  }

  const rfAttackRate = ((results.rf_results.attack_count / results.total_records) * 100).toFixed(1);
  const svmAttackRate = ((results.svm_results.attack_count / results.total_records) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-zinc-950 relative">
      <div className="noise-texture" />

      <div className="relative z-10">
        {/* Header */}
        <header className="p-6 md:p-12 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/20 rounded-lg border border-blue-500/30">
                <ShieldCheck className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="font-heading font-extrabold text-2xl tracking-tight text-zinc-50" data-testid="results-title">
                  NIDS Sentinel
                </h1>
                <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">Analysis Results</p>
              </div>
            </div>
            <button
              data-testid="new-analysis-button"
              onClick={() => navigate('/')}
              className="h-10 px-6 rounded-md font-medium border border-zinc-700 hover:bg-zinc-800 hover:text-white bg-transparent transition-all"
            >
              New Analysis
            </button>
          </div>
        </header>

        <main className="p-6 md:p-12">
          {/* Status Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-sm rounded-lg p-8" data-testid="status-banner">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-400/10 rounded-lg border border-emerald-400/20">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-2xl tracking-tight text-zinc-100 mb-2">
                      Analysis Complete
                    </h2>
                    <p className="text-zinc-400 mb-4">
                      Processed <span className="font-mono font-medium text-blue-400">{results.total_records}</span> network traffic records
                    </p>
                    <div className="flex gap-6">
                      <div>
                        <p className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-1">Random Forest</p>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-emerald-400" data-testid="rf-normal-count">{results.rf_results.normal_count}</span>
                          <span className="text-zinc-500">Normal</span>
                          <span className="text-zinc-700 mx-2">|</span>
                          <span className="text-2xl font-bold text-rose-500" data-testid="rf-attack-count">{results.rf_results.attack_count}</span>
                          <span className="text-zinc-500">Attack</span>
                        </div>
                      </div>
                      <div>
                        <p className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-1">SVM</p>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-emerald-400" data-testid="svm-normal-count">{results.svm_results.normal_count}</span>
                          <span className="text-zinc-500">Normal</span>
                          <span className="text-zinc-700 mx-2">|</span>
                          <span className="text-2xl font-bold text-rose-500" data-testid="svm-attack-count">{results.svm_results.attack_count}</span>
                          <span className="text-zinc-500">Attack</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Model Metrics - 2 columns */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <div className="bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-sm rounded-lg p-6 h-full">
                <h3 className="font-heading font-semibold text-xl tracking-tight text-zinc-100 mb-6" data-testid="metrics-heading">
                  Model Performance Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Random Forest Metrics */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <ShieldCheck className="w-5 h-5 text-blue-400" />
                      <h4 className="font-heading font-semibold text-lg text-zinc-100">Random Forest</h4>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: 'Accuracy', value: (results.rf_metrics.accuracy * 100).toFixed(2), testid: 'rf-accuracy' },
                        { label: 'Precision', value: (results.rf_metrics.precision * 100).toFixed(2), testid: 'rf-precision' },
                        { label: 'Recall', value: (results.rf_metrics.recall * 100).toFixed(2), testid: 'rf-recall' },
                      ].map((metric) => (
                        <div key={metric.label} className="flex items-center justify-between">
                          <span className="font-mono text-xs uppercase tracking-wider text-zinc-500">{metric.label}</span>
                          <span className="font-mono text-lg font-medium text-blue-400" data-testid={metric.testid}>{metric.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SVM Metrics */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="w-5 h-5 text-blue-400" />
                      <h4 className="font-heading font-semibold text-lg text-zinc-100">SVM</h4>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: 'Accuracy', value: (results.svm_metrics.accuracy * 100).toFixed(2), testid: 'svm-accuracy' },
                        { label: 'Precision', value: (results.svm_metrics.precision * 100).toFixed(2), testid: 'svm-precision' },
                        { label: 'Recall', value: (results.svm_metrics.recall * 100).toFixed(2), testid: 'svm-recall' },
                      ].map((metric) => (
                        <div key={metric.label} className="flex items-center justify-between">
                          <span className="font-mono text-xs uppercase tracking-wider text-zinc-500">{metric.label}</span>
                          <span className="font-mono text-lg font-medium text-blue-400" data-testid={metric.testid}>{metric.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Threat Level - 1 column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-sm rounded-lg p-6 h-full flex flex-col justify-center items-center text-center">
                <div className="p-4 bg-rose-500/10 rounded-full border border-rose-500/20 mb-4">
                  <AlertTriangle className="w-12 h-12 text-rose-500" />
                </div>
                <h3 className="font-heading font-semibold text-xl text-zinc-100 mb-2">Threat Detection</h3>
                <div className="font-mono text-5xl font-bold text-rose-500 mb-2" data-testid="threat-percentage">{rfAttackRate}%</div>
                <p className="text-sm text-zinc-500">of traffic flagged as attacks</p>
              </div>
            </motion.div>
          </div>

          {/* Predictions Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <div className="bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-sm rounded-lg p-6">
              <h3 className="font-heading font-semibold text-xl tracking-tight text-zinc-100 mb-6">Detailed Predictions</h3>
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="predictions-table">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left py-3 px-4 font-mono text-xs uppercase tracking-wider text-zinc-500">ID</th>
                      <th className="text-left py-3 px-4 font-mono text-xs uppercase tracking-wider text-zinc-500">Protocol</th>
                      <th className="text-left py-3 px-4 font-mono text-xs uppercase tracking-wider text-zinc-500">Service</th>
                      <th className="text-left py-3 px-4 font-mono text-xs uppercase tracking-wider text-zinc-500">RF Prediction</th>
                      <th className="text-left py-3 px-4 font-mono text-xs uppercase tracking-wider text-zinc-500">SVM Prediction</th>
                      <th className="text-left py-3 px-4 font-mono text-xs uppercase tracking-wider text-zinc-500">Consensus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.predictions.slice(0, 10).map((pred, idx) => (
                      <tr key={idx} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                        <td className="py-3 px-4 font-mono text-sm text-zinc-400">{pred.record_id}</td>
                        <td className="py-3 px-4 font-mono text-sm text-zinc-300">{pred.protocol_type || 'N/A'}</td>
                        <td className="py-3 px-4 font-mono text-sm text-zinc-300">{pred.service || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                            pred.rf_prediction === 'Attack' 
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                              : 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                          }`}>
                            {pred.rf_prediction === 'Attack' ? <ShieldAlert className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                            {pred.rf_prediction}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                            pred.svm_prediction === 'Attack' 
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                              : 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                          }`}>
                            {pred.svm_prediction === 'Attack' ? <ShieldAlert className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                            {pred.svm_prediction}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                            pred.consensus === 'Attack' 
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                              : 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                          }`}>
                            {pred.consensus === 'Attack' ? <ShieldAlert className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                            {pred.consensus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {results.predictions.length > 10 && (
                <p className="text-sm text-zinc-500 mt-4 text-center">
                  Showing first 10 of {results.predictions.length} predictions
                </p>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

