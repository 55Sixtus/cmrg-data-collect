import React, { useState } from 'react';
import { Questionnaire, Project, Submission } from '../types';
import { offlineQueue } from '../services/offlineQueue';
import { 
  PlaySquare, 
  Smartphone, 
  MapPin, 
  Camera, 
  Mic, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  ShieldCheck, 
  Send,
  Wifi,
  WifiOff,
  Database,
  CloudUpload
} from 'lucide-react';

interface FormSimulatorProps {
  questionnaires: Questionnaire[];
  projects: Project[];
  selectedProjectId?: string;
  onAddSubmission: (sub: Submission) => void;
}

export const FormSimulator: React.FC<FormSimulatorProps> = ({ 
  questionnaires, 
  projects, 
  selectedProjectId, 
  onAddSubmission 
}) => {
  const [currentProjId, setCurrentProjId] = useState<string>(selectedProjectId || projects[0]?.id || 'proj-1');
  const currentProject = projects.find(p => p.id === currentProjId) || projects[0];
  const currentQuestionnaire = questionnaires.find(q => q.projectId === currentProjId) || questionnaires[0];

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [simulatedGPS, setSimulatedGPS] = useState({ lat: 6.5244, lng: 3.3792, accuracy: 2.5 });
  
  // Offline Simulation State
  const [simulateOfflineMode, setSimulateOfflineMode] = useState(false);
  const [wasStoredOffline, setWasStoredOffline] = useState(false);

  const questions = currentQuestionnaire?.questions || [];
  const currentQ = questions[currentStep];

  const handleAnswerChange = (varName: string, val: any) => {
    setAnswers(prev => ({ ...prev, [varName]: val }));
  };

  const handleNext = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Submission Payload
      const subId = `sub-${Math.floor(1000 + Math.random() * 9000)}`;
      const isActuallyOffline = simulateOfflineMode || !navigator.onLine;

      const newSub: Submission = {
        id: subId,
        client_submission_uuid: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `uuid-${Date.now()}-${subId}`,
        projectId: currentProject.id,
        projectTitle: currentProject.title,
        enumeratorId: 'ENU-TEST-99',
        enumeratorName: 'Test Supervisor (Simulator)',
        state: 'Lagos',
        lga: 'Ikeja',
        gps: simulatedGPS,
        durationSeconds: Math.floor(120 + Math.random() * 180),
        submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        status: 'Approved',
        is_offline: isActuallyOffline,
        answers: {
          ...answers,
          interviewer_id: 'ENU-TEST-99'
        }
      };

      if (isActuallyOffline) {
        // Enqueue into IndexedDB
        await offlineQueue.enqueue(newSub);
        setWasStoredOffline(true);
      } else {
        setWasStoredOffline(false);
      }

      onAddSubmission(newSub);
      setIsCompleted(true);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({});
    setIsCompleted(false);
    setWasStoredOffline(false);
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#17243A]">Enumerator App Form Test Drive</h1>
          <p className="text-xs text-gray-500">Interactive ODK Form Simulator with Offline-First IndexedDB Queue & Auto-Sync</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Offline Mode Simulator Toggle */}
          <button
            type="button"
            onClick={() => setSimulateOfflineMode(!simulateOfflineMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all shadow-xs ${
              simulateOfflineMode
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
            title="Toggle to test offline IndexedDB queue behavior without disconnecting real Wi-Fi"
          >
            {simulateOfflineMode ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                <span>Simulating Offline Mode</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>Simulate Offline</span>
              </>
            )}
          </button>

          <select
            value={currentProjId}
            onChange={(e) => {
              setCurrentProjId(e.target.value);
              setCurrentStep(0);
              setAnswers({});
              setIsCompleted(false);
            }}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#17243A] shadow-xs"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.code}: {p.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Simulated Android Tablet Frame */}
      <div className="bg-[#17243A] p-4 sm:p-8 rounded-3xl shadow-2xl border-4 border-gray-800 max-w-md mx-auto relative overflow-hidden">
        {/* Tablet Camera Notch / Status bar */}
        <div className="flex items-center justify-between text-white/70 text-[11px] mb-4 pb-2 border-b border-white/10">
          <span className="font-mono">CMRG ODK v4.8</span>
          <div className="flex items-center gap-1.5">
            {simulateOfflineMode ? (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <WifiOff className="w-2.5 h-2.5" /> Offline Mode
              </span>
            ) : (
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
            )}
          </div>
          <span>100% [Battery]</span>
        </div>

        {/* Tablet Screen Container */}
        <div className="bg-white rounded-2xl p-6 text-[#1B2430] min-h-[420px] flex flex-col justify-between shadow-inner">
          {isCompleted ? (
            <div className="py-10 text-center space-y-4 my-auto">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm ${
                wasStoredOffline ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-600'
              }`}>
                {wasStoredOffline ? (
                  <Database className="w-8 h-8 animate-bounce" />
                ) : (
                  <CheckCircle2 className="w-8 h-8" />
                )}
              </div>

              <div>
                <h2 className="text-base font-bold text-[#17243A]">
                  {wasStoredOffline ? 'Saved to Offline IndexedDB Queue!' : 'Survey Successfully Finalized!'}
                </h2>
                <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1 leading-relaxed">
                  {wasStoredOffline
                    ? 'No internet connection was detected. Payload is securely persisted in browser IndexedDB and will auto-sync to Supabase once connection is restored.'
                    : 'Encrypted ODK payload with verified GPS metadata submitted live to CMRG Situation Room.'}
                </p>
              </div>

              {wasStoredOffline && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px]">
                    <CloudUpload className="w-3.5 h-3.5 text-amber-700" />
                    <span>Auto-Sync Trigger Ready</span>
                  </div>
                  <p className="text-[10px] text-amber-800">
                    Switch off "Simulate Offline" or reconnect to trigger automatic push to database.
                  </p>
                </div>
              )}

              <button
                onClick={handleReset}
                className="bg-[#C8202F] hover:bg-red-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Test Another Interview</span>
              </button>
            </div>
          ) : currentQ ? (
            <div className="space-y-6">
              {/* Progress Indicator */}
              <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400">
                <span>Question {currentStep + 1} of {questions.length}</span>
                <span className="text-[#C8202F]">{Math.round(((currentStep + 1) / questions.length) * 100)}%</span>
              </div>

              {/* Question Label */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono bg-red-50 text-[#C8202F] px-2 py-0.5 rounded font-bold">{currentQ.variableName}</span>
                  {currentQ.required && <span className="text-[10px] text-red-600 font-bold">*Required</span>}
                </div>
                <h3 className="text-sm font-bold text-[#17243A] leading-snug">{currentQ.label}</h3>
                {currentQ.hint && <p className="text-[11px] text-gray-500 italic">{currentQ.hint}</p>}
              </div>

              {/* Input Control Based on Type */}
              <div className="py-2">
                {currentQ.type === 'text' && (
                  <input
                    type="text"
                    placeholder="Type response here..."
                    value={answers[currentQ.variableName] || ''}
                    onChange={(e) => handleAnswerChange(currentQ.variableName, e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs text-[#1B2430] focus:outline-none focus:ring-2 focus:ring-[#C8202F]/20 focus:border-[#C8202F]"
                  />
                )}

                {(currentQ.type === 'integer' || currentQ.type === 'decimal') && (
                  <input
                    type="number"
                    placeholder="0"
                    value={answers[currentQ.variableName] || ''}
                    onChange={(e) => handleAnswerChange(currentQ.variableName, Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs text-[#1B2430] focus:outline-none focus:ring-2 focus:ring-[#C8202F]/20 focus:border-[#C8202F]"
                  />
                )}

                {currentQ.type === 'select_one' && (
                  <div className="space-y-2">
                    {currentQ.options?.map((opt) => (
                      <label
                        key={opt.id}
                        onClick={() => handleAnswerChange(currentQ.variableName, opt.label)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                          answers[currentQ.variableName] === opt.label
                            ? 'border-[#C8202F] bg-red-50/50 text-[#C8202F]'
                            : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span>{opt.label}</span>
                        <input
                          type="radio"
                          name={currentQ.variableName}
                          checked={answers[currentQ.variableName] === opt.label}
                          onChange={() => {}}
                          className="text-[#C8202F] focus:ring-[#C8202F]"
                        />
                      </label>
                    ))}
                  </div>
                )}

                {currentQ.type === 'gps' && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center space-y-3">
                    <div className="w-10 h-10 bg-red-50 text-[#C8202F] rounded-full flex items-center justify-center mx-auto shadow-xs">
                      <MapPin className="w-5 h-5 animate-bounce" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#17243A]">GPS Satellite Lock Acquired</p>
                      <p className="text-[11px] text-gray-500 font-mono mt-1">Lat: {simulatedGPS.lat}, Lng: {simulatedGPS.lng}</p>
                      <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">Accuracy: ±{simulatedGPS.accuracy} meters</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSimulatedGPS({ lat: 6.5244 + (Math.random() - 0.5) * 0.01, lng: 3.3792 + (Math.random() - 0.5) * 0.01, accuracy: 2.1 })}
                      className="text-xs font-semibold text-[#C8202F] hover:underline"
                    >
                      Re-calibrate GPS
                    </button>
                  </div>
                )}

                {currentQ.type === 'photo' && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center space-y-3">
                    <div className="w-12 h-12 bg-red-50 text-[#C8202F] rounded-full flex items-center justify-center mx-auto shadow-xs">
                      <Camera className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-semibold text-[#17243A]">Camera ready for audit photo</p>
                    <button
                      type="button"
                      onClick={() => handleAnswerChange(currentQ.variableName, 'https://images.unsplash.com/photo-1586885284437-6077974cfcf0?auto=format&fit=crop&w=600&q=80')}
                      className="bg-[#17243A] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs"
                    >
                      Capture Sample Photo
                    </button>
                    {answers[currentQ.variableName] && (
                      <span className="text-[10px] text-emerald-600 font-semibold block">Photo attached successfully</span>
                    )}
                  </div>
                )}

                {currentQ.type === 'audio' && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center space-y-3">
                    <div className="w-12 h-12 bg-red-50 text-[#C8202F] rounded-full flex items-center justify-center mx-auto shadow-xs">
                      <Mic className="w-6 h-6 animate-pulse" />
                    </div>
                    <p className="text-xs font-semibold text-[#17243A]">Audio Consent Recorder</p>
                    <button
                      type="button"
                      onClick={() => handleAnswerChange(currentQ.variableName, 'audio_recorded_ok.ogg')}
                      className="bg-[#C8202F] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs"
                    >
                      Record 10s Audio Snippet
                    </button>
                    {answers[currentQ.variableName] && (
                      <span className="text-[10px] text-emerald-600 font-semibold block">Audio recorded successfully</span>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  disabled={currentStep === 0}
                  onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 disabled:opacity-40 hover:bg-gray-50 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2 bg-[#C8202F] hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <span>{currentStep === questions.length - 1 ? (simulateOfflineMode ? 'Queue Offline' : 'Submit Survey') : 'Next'}</span>
                  {currentStep === questions.length - 1 ? <Send className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-xs text-gray-500">No questions available in this questionnaire.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
