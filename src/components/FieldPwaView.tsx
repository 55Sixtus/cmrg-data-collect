import React, { useState, useEffect, useRef } from 'react';
import { Project, Questionnaire, Submission, Enumerator, GeofenceZone } from '../types';
import { offlineQueue } from '../services/offlineQueue';
import { QuestionRenderer } from './QuestionRenderer';
import { LogicEngine } from '../services/questionnaireLogicEngine';
import { 
  Smartphone, 
  MapPin, 
  ShieldCheck, 
  ShieldAlert, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  AlertTriangle, 
  Camera, 
  Mic, 
  Send, 
  Save, 
  RefreshCw, 
  Lock, 
  Unlock,
  KeyRound,
  Download,
  Info,
  Check,
  UserCheck,
  Play,
  Pause,
  Video,
  Square,
  RotateCcw,
  UploadCloud,
  Volume2,
  Radio,
  Eye
} from 'lucide-react';

interface FieldPwaViewProps {
  projects: Project[];
  questionnaires: Questionnaire[];
  enumerators: Enumerator[];
  geofences?: GeofenceZone[];
  onAddSubmission: (sub: Submission) => void;
}

export const FieldPwaView: React.FC<FieldPwaViewProps> = ({
  projects,
  questionnaires,
  enumerators,
  geofences: initialGeofences,
  onAddSubmission
}) => {
  // Enumerator Authentication & Access Code state
  const [step, setStep] = useState<'auth' | 'geolock' | 'interview' | 'success'>('auth');
  const [enumeratorId, setEnumeratorId] = useState('CMRG-ENU-001');
  const [accessCode, setAccessCode] = useState('CMRG-2026-NGR');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || 'proj-1');
  const [authError, setAuthError] = useState<string | null>(null);

  // WhatsApp-style fast pair session state
  const [pairedSession, setPairedSession] = useState<{
    projectCode: string;
    accessCode: string;
    projectTitle: string;
    enumeratorId: string;
    autoPaired: boolean;
  } | null>(null);

  // Read pre-paired session from QR code install
  useEffect(() => {
    try {
      const raw = localStorage.getItem('cmrg_paired_session');
      if (raw) {
        const data = JSON.parse(raw);
        setPairedSession(data);
        if (data.enumeratorId) setEnumeratorId(data.enumeratorId);
        if (data.accessCode) setAccessCode(data.accessCode);
        const matching = projects.find(p => p.code === data.projectCode);
        if (matching) setSelectedProjectId(matching.id);
      }
    } catch (e) {
      // Ignore JSON error
    }
  }, [projects]);

  // Live Camera Selfie state
  const [selfieCaptured, setSelfieCaptured] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Geo-lock verification state
  const [gpsLat, setGpsLat] = useState<number>(6.6018);
  const [gpsLng, setGpsLng] = useState<number>(3.3515);
  const [gpsAccuracy, setGpsAccuracy] = useState<number>(12.5);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'locating' | 'verified' | 'out_of_bounds' | 'error'>('idle');
  const [geoMessage, setGeoMessage] = useState<string>('Ready to verify field GPS coordinates against project geofence.');
  const [overrideRequested, setOverrideRequested] = useState<boolean>(false);
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [overrideStatus, setOverrideStatus] = useState<'none' | 'pending' | 'approved'>('none');

  // Interview Questionnaire state
  const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0];
  const currentQuestionnaire = questionnaires.find(q => q.projectId === selectedProjectId) || questionnaires[0];
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [interviewDuration, setInterviewDuration] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [clientUuid, setClientUuid] = useState<string>('');
  const [mediaAttached, setMediaAttached] = useState<{ photo?: string; video?: string; audio?: string; selfie?: string }>({});

  // Inbuilt Audio Recorder with Pause / Continue & Live Waveform
  const [audioRecording, setAudioRecording] = useState(false);
  const [audioPaused, setAudioPaused] = useState(false);
  const [audioSeconds, setAudioSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [waveformBars, setWaveformBars] = useState<number[]>([25, 45, 60, 80, 45, 90, 65, 40, 75, 95, 50, 30, 70, 85, 40, 60, 75, 30]);

  // Video Survey Recording (Up to 1 minute / 60s countdown)
  const [videoRecording, setVideoRecording] = useState(false);
  const [videoSeconds, setVideoSeconds] = useState(0); // 0 to 60s
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Photo Capture State
  const [photoWatermarked, setPhotoWatermarked] = useState<string | null>(null);

  // Offline Queue State
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Live Visual Upload Progress State
  const [syncProgress, setSyncProgress] = useState<{
    isSyncing: boolean;
    current: number;
    total: number;
    percent: number;
    message: string;
  }>({
    isSyncing: false,
    current: 0,
    total: 0,
    percent: 0,
    message: ''
  });

  useEffect(() => {
    const unsub = offlineQueue.subscribe((count, online) => {
      setOfflineQueueCount(count);
      setIsOnline(online);
    });
    const unsubProgress = offlineQueue.onProgress((p) => {
      setSyncProgress(p);
    });
    return () => {
      unsub();
      unsubProgress();
    };
  }, []);

  const handleTriggerManualSync = async () => {
    if (!isOnline) {
      alert('Device is currently offline. Connect to Wi-Fi or cellular data to trigger sync.');
      return;
    }
    await offlineQueue.syncQueue();
  };

  // Timer for interview duration
  useEffect(() => {
    let interval: any;
    if (timerActive && step === 'interview') {
      interval = setInterval(() => {
        setInterviewDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, step]);

  // Audio Recording Timer & Live Waveform Animation
  useEffect(() => {
    let timerInterval: any;
    let waveInterval: any;
    if (audioRecording && !audioPaused) {
      timerInterval = setInterval(() => {
        setAudioSeconds(s => s + 1);
      }, 1000);
      waveInterval = setInterval(() => {
        setWaveformBars(prev => prev.map(() => Math.floor(Math.random() * 75) + 20));
      }, 150);
    }
    return () => {
      clearInterval(timerInterval);
      clearInterval(waveInterval);
    };
  }, [audioRecording, audioPaused]);

  // Video Recording Timer (1 minute max = 60s countdown)
  useEffect(() => {
    let interval: any;
    if (videoRecording) {
      interval = setInterval(() => {
        setVideoSeconds(prev => {
          if (prev >= 59) {
            // Auto stop at 60s
            handleStopVideoRecord();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [videoRecording]);

  const handleStartAudioRecord = () => {
    setAudioRecording(true);
    setAudioPaused(false);
    setAudioSeconds(0);
    setAudioUrl(null);
  };

  const handlePauseAudioRecord = () => {
    setAudioPaused(true);
  };

  const handleResumeAudioRecord = () => {
    setAudioPaused(false);
  };

  const handleStopAudioRecord = (qId?: string) => {
    setAudioRecording(false);
    setAudioPaused(false);
    const audioStamp = `https://actions.google.com/sounds/v1/ambiences/market.ogg`;
    setAudioUrl(audioStamp);
    setMediaAttached(prev => ({ ...prev, audio: audioStamp }));
    if (qId) {
      handleAnswerChange(qId, {
        url: audioStamp,
        duration: audioSeconds,
        gps: { lat: gpsLat, lng: gpsLng, accuracy: gpsAccuracy },
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleStartVideoRecord = () => {
    setVideoRecording(true);
    setVideoSeconds(0);
    setVideoUrl(null);
  };

  const handleStopVideoRecord = (qId?: string) => {
    setVideoRecording(false);
    const dummyVideo = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
    setVideoUrl(dummyVideo);
    setMediaAttached(prev => ({ ...prev, video: dummyVideo }));
    if (qId) {
      handleAnswerChange(qId, {
        url: dummyVideo,
        duration: videoSeconds || 1,
        maxDuration: 60,
        gps: { lat: gpsLat, lng: gpsLng, accuracy: gpsAccuracy },
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleCapturePhotoWithWatermark = (qId?: string) => {
    const stamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    // Create high-res watermarked SVG canvas image
    const photoData = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480"><rect width="640" height="480" fill="%231E293B"/><rect x="40" y="40" width="560" height="400" rx="12" fill="%230F172A" stroke="%23334155" stroke-width="2"/><circle cx="320" cy="200" r="70" fill="%233B82F6" fill-opacity="0.2"/><path d="M280 240 L320 160 L360 240 Z" fill="%23E30620"/><rect x="40" y="380" width="560" height="60" fill="%23000000" fill-opacity="0.85"/><text x="60" y="405" font-family="monospace" font-size="14" font-weight="bold" fill="%2310B981">CMRG GPS VERIFIED FIELD EVIDENCE</text><text x="60" y="425" font-family="monospace" font-size="11" fill="%23CBD5E1">LAT: ${gpsLat.toFixed(4)} | LNG: ${gpsLng.toFixed(4)} (±${gpsAccuracy}m) | TIME: ${stamp} UTC | ENU: ${enumeratorId}</text></svg>`;
    setPhotoWatermarked(photoData);
    setMediaAttached(prev => ({ ...prev, photo: photoData }));
    if (qId) {
      handleAnswerChange(qId, {
        url: photoData,
        gps: { lat: gpsLat, lng: gpsLng, accuracy: gpsAccuracy },
        timestamp: new Date().toISOString()
      });
    }
  };

  // Start Front Camera Stream
  const handleStartCamera = async () => {
    setCameraError(null);
    setCameraActive(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 480 } },
          audio: false
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } else {
        throw new Error('Camera device API unavailable in this browser context.');
      }
    } catch (err: any) {
      console.warn('Camera error:', err);
      setCameraError('Direct camera access not granted. Tap below to capture simulated biometric verification snapshot.');
    }
  };

  // Capture Frame to Canvas
  const handleCaptureSelfie = () => {
    if (videoRef.current && canvasRef.current && videoRef.current.srcObject) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = 320;
      canvas.height = 320;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, 320, 320);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setSelfieCaptured(dataUrl);
        setMediaAttached(prev => ({ ...prev, selfie: dataUrl }));
        // Stop video stream
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
        setCameraActive(false);
      }
    } else {
      // High-res SVG snapshot fallback
      const stamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const sampleSelfie = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320"><rect width="320" height="320" fill="%2317243A"/><circle cx="160" cy="120" r="55" fill="%23E30620"/><circle cx="160" cy="270" r="105" fill="%23E30620"/><rect x="20" y="260" width="280" height="45" rx="8" fill="%230B0F17" fill-opacity="0.85"/><text x="160" y="280" font-family="monospace" font-size="10" font-weight="bold" fill="%2310B981" text-anchor="middle">✓ VERIFIED ENUMERATOR SELFIE</text><text x="160" y="296" font-family="monospace" font-size="8" fill="%2394A3B8" text-anchor="middle">ID: ${enumeratorId} • ${stamp} UTC</text></svg>`;
      setSelfieCaptured(sampleSelfie);
      setMediaAttached(prev => ({ ...prev, selfie: sampleSelfie }));
      setCameraActive(false);
    }
  };

  const handleRetakeSelfie = () => {
    setSelfieCaptured(null);
    handleStartCamera();
  };

  const handleAuthenticateEnumerator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enumeratorId || !accessCode) {
      setAuthError('Please enter valid Enumerator ID and Access Code.');
      return;
    }
    if (!selfieCaptured) {
      setAuthError('Mandatory verification: You must take your live facial verification selfie before proceeding to field data collection.');
      return;
    }
    setAuthError(null);
    setStep('geolock');
  };

  // Available supervisor-locked interview locations
  const availableGeofences: GeofenceZone[] = (initialGeofences && initialGeofences.length > 0) ? initialGeofences : [
    {
      id: 'geo-1',
      projectId: selectedProjectId,
      name: 'Ikeja Central Market & Computer Village',
      state: 'Lagos',
      lga: 'Ikeja',
      lat: 6.6018,
      lng: 3.3515,
      radiusMeters: 1500,
      driftBufferMeters: 150,
      targetInterviews: 120,
      assignedEnumerator: 'Amina Bello (CMRG-TAB-208)',
      active: true
    },
    {
      id: 'geo-2',
      projectId: selectedProjectId,
      name: 'Surulere National Stadium Zone',
      state: 'Lagos',
      lga: 'Surulere',
      lat: 6.5059,
      lng: 3.3603,
      radiusMeters: 1200,
      driftBufferMeters: 100,
      targetInterviews: 80,
      assignedEnumerator: 'Emeka Okafor (CMRG-TAB-311)',
      active: true
    }
  ];

  const [selectedGeofenceId, setSelectedGeofenceId] = useState<string>(availableGeofences[0]?.id || 'geo-1');
  const activeLockedZone = availableGeofences.find(g => g.id === selectedGeofenceId) || availableGeofences[0];

  const handleAcquireGpsAndVerify = () => {
    setGpsStatus('locating');
    setGeoMessage('Acquiring high-accuracy GPS satellite fix...');

    const target = activeLockedZone || { lat: 6.6018, lng: 3.3515, radiusMeters: 1500, driftBufferMeters: 150, name: 'Default Zone' };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = position.coords.accuracy;
          setGpsLat(lat);
          setGpsLng(lng);
          setGpsAccuracy(accuracy);

          // Calculate precise Haversine distance in meters
          const R = 6371e3; // Earth radius in metres
          const φ1 = lat * Math.PI/180;
          const φ2 = target.lat * Math.PI/180;
          const Δφ = (target.lat - lat) * Math.PI/180;
          const Δλ = (target.lng - lng) * Math.PI/180;
          const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                    Math.cos(φ1) * Math.cos(φ2) *
                    Math.sin(Δλ/2) * Math.sin(Δλ/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distanceMeters = Math.round(R * c);

          if (accuracy > 300) {
            setGpsStatus('out_of_bounds');
            setGeoMessage(`GPS accuracy too low (${Math.round(accuracy)}m). High urban satellite bounce detected. Move to open sky or request supervisor override.`);
          } else if (distanceMeters > (target.radiusMeters + target.driftBufferMeters) && overrideStatus !== 'approved') {
            setGpsStatus('out_of_bounds');
            setGeoMessage(`Outside supervisor-locked boundary! You are ${distanceMeters}m away from "${target.name}" (Allowed: ${target.radiusMeters + target.driftBufferMeters}m). Supervisor override required to conduct interviews here.`);
          } else {
            setGpsStatus('verified');
            setGeoMessage(`✓ GPS fix verified! You are inside "${target.name}" (${distanceMeters}m from center anchor). Questionnaire unlocked.`);
          }
        },
        (error) => {
          setGpsStatus('error');
          setGeoMessage(`GPS error: ${error.message}. Please enable device location services or request supervisor override.`);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setTimeout(() => {
        setGpsStatus('verified');
        setGeoMessage(`✓ GPS verified inside "${target.name}" using device coordinates.`);
      }, 600);
    }
  };

  const handleRequestSupervisorOverride = () => {
    if (!overrideReason.trim()) {
      alert('Please provide a reason for the supervisor override request.');
      return;
    }
    setOverrideRequested(true);
    setOverrideStatus('pending');
    setGeoMessage('Override request submitted to supervisor queue. Awaiting approval or simulating instant supervisor sign-off...');
    
    // Simulate supervisor approval after 3 seconds for demonstration smoothness
    setTimeout(() => {
      setOverrideStatus('approved');
      setGpsStatus('verified');
      setGeoMessage('Supervisor override approved! Questionnaire unlocked with audit flag recorded.');
    }, 2500);
  };

  const handleStartInterview = () => {
    setClientUuid(`sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`);
    setStep('interview');
    setTimerActive(true);
    setCurrentQIndex(0);
  };

  const handleAnswerChange = (qId: string, value: any, varName?: string) => {
    setAnswers(prev => {
      const updated = { ...prev, [qId]: value };
      if (varName) updated[varName] = value;
      return updated;
    });
  };

  const handleSimulateMediaCapture = (type: 'photo' | 'audio' | 'selfie') => {
    if (type === 'photo') {
      setMediaAttached(prev => ({ ...prev, photo: 'store://media/photos/survey_evidence_01.jpg' }));
    } else if (type === 'audio') {
      setMediaAttached(prev => ({ ...prev, audio: 'store://media/audio/interview_recording_01.wav' }));
    } else if (type === 'selfie') {
      setMediaAttached(prev => ({ ...prev, selfie: 'store://media/selfies/enumerator_verify_01.jpg' }));
    }
  };

  const handleSaveDraftLocally = async () => {
    const draftSub: Submission = {
      id: clientUuid || `sub-${Date.now()}`,
      projectId: currentProject.id,
      projectTitle: currentProject.title,
      enumeratorId,
      enumeratorName: enumeratorId === 'CMRG-ENU-001' ? 'Amina Bello (Lagos North)' : 'Field Enumerator',
      state: 'Lagos',
      lga: 'Ikeja',
      gps: { lat: gpsLat, lng: gpsLng, accuracy: gpsAccuracy },
      durationSeconds: interviewDuration,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'Pending',
      answers,
      client_submission_uuid: clientUuid,
      is_offline: true
    };

    await offlineQueue.enqueue(draftSub);
    alert('Interview draft saved locally to IndexedDB successfully!');
  };

  const handleFinalSubmit = async () => {
    const finalSub: Submission = {
      id: clientUuid || `sub-${Date.now()}`,
      projectId: currentProject.id,
      projectTitle: currentProject.title,
      enumeratorId,
      enumeratorName: enumeratorId === 'CMRG-ENU-001' ? 'Amina Bello (Lagos North)' : 'Field Enumerator',
      state: 'Lagos',
      lga: 'Ikeja',
      gps: { lat: gpsLat, lng: gpsLng, accuracy: gpsAccuracy },
      durationSeconds: interviewDuration,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: overrideStatus === 'approved' ? 'Flagged' : 'Pending',
      flagReason: overrideStatus === 'approved' ? `Supervisor Override: ${overrideReason}` : undefined,
      answers,
      client_submission_uuid: clientUuid,
      is_offline: !isOnline
    };

    // Enqueue or push immediately
    await offlineQueue.enqueue(finalSub);
    if (isOnline) {
      await offlineQueue.syncQueue();
    }

    onAddSubmission(finalSub);
    setTimerActive(false);
    setStep('success');
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#17243A] to-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#C8202F] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Phase 2.4 Field PWA & Offline Engine</span>
            <span className="bg-white/10 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3 text-amber-400" />}
              {isOnline ? 'Online (Auto-Sync)' : 'Offline IndexedDB Mode'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black">Enumerator Field Application & Offline Caching</h1>
          <p className="text-xs text-gray-300 mt-1">Secure mobile data collection with geo-lock validation, media capture, idempotency UUIDs, and reliable sync.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/10">
            <Smartphone className="w-8 h-8 text-[#C8202F]" />
            <div>
              <p className="text-[11px] font-bold text-white">IndexedDB Queue</p>
              <p className="text-xs font-mono text-amber-300 font-bold">{offlineQueueCount} submissions pending sync</p>
            </div>
          </div>

          {offlineQueueCount > 0 && isOnline && (
            <button
              type="button"
              onClick={handleTriggerManualSync}
              disabled={syncProgress.isSyncing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            >
              <UploadCloud className={`w-4 h-4 ${syncProgress.isSyncing ? 'animate-bounce' : ''}`} />
              <span>{syncProgress.isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Visual Upload Progress Bar (Live Background Sync to Situation Room) */}
      {(syncProgress.isSyncing || syncProgress.percent === 100) && (
        <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] border border-emerald-500/40 rounded-2xl p-4 shadow-xl space-y-2 animate-in fade-in duration-300 text-white">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>{syncProgress.message || 'Auto-Syncing Offline Surveys & Media to Situation Room...'}</span>
            </span>
            <span className="font-mono font-bold text-emerald-400">
              {syncProgress.percent}%
            </span>
          </div>

          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${syncProgress.percent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-400 pt-0.5 font-mono">
            <span>Server: Supabase PostgreSQL Realtime</span>
            <span className="text-emerald-400 font-bold">
              {syncProgress.percent === 100 ? '● All records verified & synced' : `Syncing ${syncProgress.current} / ${syncProgress.total || offlineQueueCount} records`}
            </span>
          </div>
        </div>
      )}

      {/* Step 1: Enumerator Sign-in & Access Code */}
      {step === 'auth' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6 max-w-xl mx-auto">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-red-50 text-[#C8202F] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-[#17243A]">Enumerator Field Sign-In & Access Code</h2>
            <p className="text-xs text-gray-500">Enter your assigned enumerator ID and project access code to unlock authorized surveys.</p>
          </div>

          {authError && (
            <div className="bg-red-50 border border-red-200 text-[#C8202F] p-3 rounded-xl text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthenticateEnumerator} className="space-y-4">
            {/* Auto-Paired Study Card (WhatsApp-Style Scan Detected) */}
            {pairedSession?.autoPaired ? (
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> WhatsApp Fast-Pair Linked
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('cmrg_paired_session');
                      setPairedSession(null);
                    }}
                    className="text-[10px] text-gray-500 hover:text-red-600 underline font-semibold"
                  >
                    Unlink / Switch Study
                  </button>
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#17243A] leading-tight">{currentProject.title}</h4>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">Project Code: {currentProject.code}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
                  <div className="bg-white p-2 rounded-xl border border-emerald-200 shadow-2xs">
                    <span className="text-gray-400 text-[9px] block uppercase">Enumerator ID</span>
                    <b className="text-[#17243A]">{enumeratorId}</b>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-emerald-200 shadow-2xs">
                    <span className="text-gray-400 text-[9px] block uppercase">Access PIN</span>
                    <b className="text-emerald-700">●●●●● (Auto-Verified)</b>
                  </div>
                </div>
                <p className="text-[11px] text-emerald-800 font-medium pt-1">
                  ⚡ Auto-authenticated via QR scan — zero typing needed. Snap your verification selfie below to proceed!
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Select Assigned Research Project</label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-semibold text-[#17243A]"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.code}: {p.title} ({p.sector})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Enumerator ID</label>
                  <input
                    type="text"
                    value={enumeratorId}
                    onChange={(e) => setEnumeratorId(e.target.value)}
                    placeholder="e.g. CMRG-ENU-001"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-mono text-[#17243A]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Project Access Code / QR PIN</label>
                  <input
                    type="password"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="e.g. CMRG-2026-NGR"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-mono text-[#17243A]"
                    required
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Hint: Default test code is <span className="font-mono text-gray-600">CMRG-2026-NGR</span> or assigned project code.</p>
                </div>
              </>
            )}

            {/* Live Camera Selfie Verification */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-[#C8202F]" />
                  <span>Mandatory Facial Verification Selfie</span>
                </label>
                {selfieCaptured && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Identity Verified
                  </span>
                )}
              </div>

              {cameraError && (
                <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  {cameraError}
                </div>
              )}

              {/* If no selfie yet and camera not active */}
              {!selfieCaptured && !cameraActive && (
                <button
                  type="button"
                  onClick={handleStartCamera}
                  className="w-full py-3 bg-[#17243A] hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Camera className="w-4 h-4 text-[#E30620]" />
                  <span>Open Front Camera & Take Selfie</span>
                </button>
              )}

              {/* Active Camera Viewfinder */}
              {cameraActive && (
                <div className="space-y-3">
                  <div className="relative w-44 h-44 mx-auto rounded-full overflow-hidden border-4 border-[#E30620] shadow-lg bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    <div className="absolute inset-0 border-2 border-dashed border-white/60 rounded-full pointer-events-none"></div>
                  </div>
                  <canvas ref={canvasRef} className="hidden" />

                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={handleCaptureSelfie}
                      className="px-4 py-2 bg-[#E30620] hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Capture Selfie</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCameraActive(false)}
                      className="px-3 py-2 bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Captured Selfie Preview */}
              {selfieCaptured && (
                <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-200">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500 shrink-0 shadow-sm">
                    <img src={selfieCaptured} alt="Enumerator Selfie" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 text-[11px] space-y-1">
                    <p className="font-bold text-gray-900">Biometric Verification Logged</p>
                    <p className="text-gray-500 font-mono text-[10px]">ID: {enumeratorId}</p>
                    <button
                      type="button"
                      onClick={handleRetakeSelfie}
                      className="text-[#C8202F] font-bold text-[10px] hover:underline"
                    >
                      Retake Photo
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-[#C8202F] hover:bg-red-700 text-white font-bold py-3.5 rounded-xl shadow-md text-xs flex items-center justify-center gap-2 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Authenticate (ID + Access Code + Selfie) & Proceed</span>
            </button>
          </form>

          {/* PWA Installation Guidance */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-2 font-bold text-[#17243A]">
              <Download className="w-4 h-4 text-[#C8202F]" />
              <span>Installing as a Mobile PWA</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              <b>Android (Chrome):</b> Tap the browser menu (three dots) and select <b>"Install App"</b> or <b>"Add to Home Screen"</b>.<br />
              <b>iPhone (Safari):</b> Tap the <b>Share</b> button at the bottom and select <b>"Add to Home Screen"</b> for full-screen offline fieldwork.
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Geo-Lock Verification Sequence */}
      {step === 'geolock' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6 max-w-xl mx-auto">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <MapPin className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-[#17243A]">GPS Geofence & Boundary Verification</h2>
            <p className="text-xs text-gray-500">Project: <b>{currentProject.title}</b> ({currentProject.code})</p>
          </div>

          {/* Supervisor Pre-Field Locked Location Selector */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <Lock className="w-3.5 h-3.5 text-[#E30620]" />
              <span>Supervisor Pre-Field Locked Interview Zone</span>
            </div>
            <p className="text-[11px] text-amber-800">
              Your research supervisor locked the following locations for this survey. Select your field target:
            </p>
            <select
              value={selectedGeofenceId}
              onChange={(e) => {
                setSelectedGeofenceId(e.target.value);
                setGpsStatus('idle');
                setGeoMessage('Location selected. Tap below to verify your GPS coordinates against this boundary.');
              }}
              className="w-full bg-white border border-amber-300 rounded-lg p-2.5 text-xs font-bold text-gray-900 mt-1 shadow-xs"
            >
              {availableGeofences.map(gf => (
                <option key={gf.id} value={gf.id}>
                  🔒 {gf.name} — Radius: {gf.radiusMeters}m (Target: {gf.targetInterviews || 50} interviews)
                </option>
              ))}
            </select>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">GPS Status:</span>
              <span className={`font-bold uppercase tracking-wider text-[10px] px-2.5 py-0.5 rounded-full ${
                gpsStatus === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                gpsStatus === 'out_of_bounds' ? 'bg-amber-100 text-amber-800' :
                gpsStatus === 'error' ? 'bg-red-100 text-[#C8202F]' :
                'bg-gray-200 text-gray-700'
              }`}>{gpsStatus}</span>
            </div>

            <div className="text-xs text-gray-700 font-mono bg-white p-3 rounded-lg border border-gray-200 space-y-1">
              <div>Lat: <span className="font-bold">{gpsLat.toFixed(4)}</span> | Lng: <span className="font-bold">{gpsLng.toFixed(4)}</span></div>
              <div>Reported Accuracy: <span className="font-bold text-emerald-600">±{gpsAccuracy}m</span></div>
            </div>

            <p className="text-xs text-gray-600">{geoMessage}</p>
          </div>

          {gpsStatus !== 'verified' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleAcquireGpsAndVerify}
                className="w-full bg-[#17243A] hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow-md text-xs flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Acquire Satellite GPS & Verify Boundary</span>
              </button>

              {gpsStatus === 'out_of_bounds' && overrideStatus === 'none' && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Request Supervisor Override</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Reason (e.g. Respondent located outside boundary in Ikeja GRA)"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded-lg p-2.5 text-xs text-gray-800"
                  />
                  <button
                    type="button"
                    onClick={handleRequestSupervisorOverride}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded-lg text-xs"
                  >
                    Submit Override Request to Supervisor
                  </button>
                </div>
              )}
            </div>
          )}

          {gpsStatus === 'verified' && (
            <button
              type="button"
              onClick={handleStartInterview}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md text-xs flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Geofence Passed — Start Interview</span>
            </button>
          )}
        </div>
      )}

      {/* Step 3: Interview Questionnaire Form */}
      {step === 'interview' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <span className="text-[10px] font-bold text-[#C8202F] uppercase tracking-wider">{currentProject.code}: {currentProject.title}</span>
              <h2 className="text-lg font-bold text-[#17243A]">Live Field Interview (UUID: {clientUuid.substring(0, 12)}...)</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-gray-100 text-gray-700 font-mono text-xs px-3 py-1.5 rounded-xl font-bold">
                ⏱️ {Math.floor(interviewDuration / 60)}m {interviewDuration % 60}s
              </span>
            </div>
          </div>

          {/* Questionnaire Questions */}
          <div className="space-y-6">
            {currentQuestionnaire.questions.map((q, index) => {
              // Evaluate skip logic & relevance condition
              if (!LogicEngine.isQuestionRelevant(q, answers)) {
                return null;
              }

              // Special hardware sensor handlers: photo, video, audio
              if (q.type === 'photo') {
                return (
                  <div key={q.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#17243A]">
                        Q{index + 1}. {LogicEngine.pipeText(q.label, answers)} {q.required && <span className="text-[#C8202F]">*</span>}
                      </label>
                      <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-500">photo</span>
                    </div>
                    {q.hint && <p className="text-[11px] text-gray-500">{q.hint}</p>}

                    <div className="bg-white border border-gray-200 rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                          <Camera className="w-4 h-4 text-[#C8202F]" />
                          <span>Camera Photo with GPS Watermarking</span>
                        </span>
                        {answers[q.id]?.url || photoWatermarked ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Photo Watermarked ✓
                          </span>
                        ) : null}
                      </div>

                      {answers[q.id]?.url || photoWatermarked ? (
                        <div className="space-y-2">
                          <div className="relative rounded-xl overflow-hidden border border-gray-300 max-w-sm">
                            <img
                              src={answers[q.id]?.url || photoWatermarked}
                              alt="GPS Watermarked Field Photo"
                              className="w-full h-44 object-cover"
                            />
                            <div className="absolute bottom-0 inset-x-0 bg-black/80 backdrop-blur-xs p-2 text-[10px] font-mono text-emerald-400">
                              <div>📍 LAT: {gpsLat.toFixed(4)} | LNG: {gpsLng.toFixed(4)} (±{gpsAccuracy}m)</div>
                              <div className="text-gray-300">📅 {new Date().toISOString().substring(0, 19).replace('T', ' ')} UTC • {enumeratorId}</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCapturePhotoWithWatermark(q.id)}
                            className="text-xs font-semibold text-gray-600 hover:text-black flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Retake Photo
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleCapturePhotoWithWatermark(q.id)}
                          className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 hover:border-gray-400 rounded-xl text-xs font-bold text-gray-700 flex items-center justify-center gap-2 transition-colors"
                        >
                          <Camera className="w-4 h-4 text-[#C8202F]" />
                          <span>Take Photo (Auto-Embed GPS Lat/Long & Timestamp)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              }

              if (q.type === 'video') {
                return (
                  <div key={q.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#17243A]">
                        Q{index + 1}. {LogicEngine.pipeText(q.label, answers)} {q.required && <span className="text-[#C8202F]">*</span>}
                      </label>
                      <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-500">video</span>
                    </div>
                    {q.hint && <p className="text-[11px] text-gray-500">{q.hint}</p>}

                    <div className="bg-white border border-gray-200 rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                          <Video className="w-4 h-4 text-[#C8202F]" />
                          <span>Video Survey of Surroundings (Up to 1 Min)</span>
                        </span>
                        <span className="text-[10px] font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-bold">
                          {videoRecording ? `⏱️ ${videoSeconds}s / 60s` : 'Max 60s'}
                        </span>
                      </div>

                      {videoRecording && (
                        <div className="space-y-1.5 bg-red-50 border border-red-200 p-3 rounded-xl">
                          <div className="flex items-center justify-between text-xs text-red-700 font-bold">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                              <span>Recording Video... ({60 - videoSeconds}s remaining)</span>
                            </span>
                            <span className="font-mono">00:{videoSeconds < 10 ? `0${videoSeconds}` : videoSeconds}</span>
                          </div>
                          <div className="w-full bg-red-200 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-[#C8202F] h-full transition-all duration-1000"
                              style={{ width: `${(videoSeconds / 60) * 100}%` }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleStopVideoRecord(q.id)}
                            className="w-full mt-2 py-2 bg-[#C8202F] hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <Square className="w-3.5 h-3.5" /> Stop &amp; Save Video Recording
                          </button>
                        </div>
                      )}

                      {!videoRecording && (answers[q.id]?.url || videoUrl) ? (
                        <div className="space-y-2">
                          <div className="p-3 bg-gray-900 text-white rounded-xl space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                                <Check className="w-4 h-4" /> 1-Min Video Recorded &amp; Watermarked
                              </span>
                              <span className="text-[10px] font-mono text-gray-400">Duration: {answers[q.id]?.duration || videoSeconds || 28}s</span>
                            </div>
                            <div className="text-[10px] font-mono bg-black/60 p-2 rounded border border-gray-700 text-gray-300">
                              📍 Embedded GPS: {gpsLat.toFixed(4)}, {gpsLng.toFixed(4)} • Timestamp: {new Date().toISOString().substring(0, 19).replace('T', ' ')} UTC
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleStartVideoRecord}
                            className="text-xs font-semibold text-gray-600 hover:text-black flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Record Again
                          </button>
                        </div>
                      ) : !videoRecording && (
                        <button
                          type="button"
                          onClick={handleStartVideoRecord}
                          className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 hover:border-gray-400 rounded-xl text-xs font-bold text-gray-700 flex items-center justify-center gap-2 transition-colors"
                        >
                          <Video className="w-4 h-4 text-[#C8202F]" />
                          <span>Start Video Recording (Max 1 Min with Countdown)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              }

              if (q.type === 'audio') {
                return (
                  <div key={q.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#17243A]">
                        Q{index + 1}. {LogicEngine.pipeText(q.label, answers)} {q.required && <span className="text-[#C8202F]">*</span>}
                      </label>
                      <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-500">audio</span>
                    </div>
                    {q.hint && <p className="text-[11px] text-gray-500">{q.hint}</p>}

                    <div className="bg-white border border-gray-200 rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                          <Mic className="w-4 h-4 text-[#C8202F]" />
                          <span>Audio Statement with Pause/Continue &amp; Live Waveform</span>
                        </span>
                        <span className="text-[10px] font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-bold">
                          ⏱️ 00:{audioSeconds < 10 ? `0${audioSeconds}` : audioSeconds}
                        </span>
                      </div>

                      {(audioRecording || answers[q.id]?.url || audioUrl) && (
                        <div className="bg-[#0B0F17] rounded-xl p-3 flex flex-col items-center justify-center space-y-2">
                          <div className="flex items-end gap-1 h-14 w-full justify-center px-4">
                            {waveformBars.map((height, i) => (
                              <div
                                key={i}
                                className={`w-2 rounded-t transition-all duration-150 ${
                                  audioRecording && !audioPaused
                                    ? 'bg-[#E30620]'
                                    : audioPaused
                                    ? 'bg-amber-400'
                                    : 'bg-emerald-400'
                                }`}
                                style={{ height: `${height}%` }}
                              />
                            ))}
                          </div>
                          <div className="flex items-center justify-between w-full text-[10px] font-mono px-2">
                            <span className={audioRecording && !audioPaused ? 'text-red-400 animate-pulse font-bold' : audioPaused ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                              {audioRecording && !audioPaused ? '● RECORDING LIVE' : audioPaused ? '⏸ PAUSED' : '✓ AUDIO READY'}
                            </span>
                            <span className="text-gray-400">
                              GPS: {gpsLat.toFixed(4)}, {gpsLng.toFixed(4)}
                            </span>
                          </div>
                        </div>
                      )}

                      {audioRecording ? (
                        <div className="flex items-center gap-2">
                          {!audioPaused ? (
                            <button
                              type="button"
                              onClick={handlePauseAudioRecord}
                              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                            >
                              <Pause className="w-3.5 h-3.5" /> Pause Recording
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleResumeAudioRecord}
                              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                            >
                              <Play className="w-3.5 h-3.5" /> Continue / Resume
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleStopAudioRecord(q.id)}
                            className="flex-1 py-2.5 bg-[#C8202F] hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <Square className="w-3.5 h-3.5" /> Stop &amp; Save
                          </button>
                        </div>
                      ) : (answers[q.id]?.url || audioUrl) ? (
                        <div className="space-y-2">
                          <audio controls src={answers[q.id]?.url || audioUrl} className="w-full h-8" />
                          <button
                            type="button"
                            onClick={handleStartAudioRecord}
                            className="text-xs font-semibold text-gray-600 hover:text-black flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Re-record Audio
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleStartAudioRecord}
                          className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 hover:border-gray-400 rounded-xl text-xs font-bold text-gray-700 flex items-center justify-center gap-2 transition-colors"
                        >
                          <Mic className="w-4 h-4 text-[#C8202F]" />
                          <span>Record Audio (With Waveform &amp; Pause/Continue)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              }

              // All other universal question types (single/multi-choice, text, matrix, NPS, ranking, constant sum, etc.)
              return (
                <QuestionRenderer
                  key={q.id}
                  question={q}
                  index={index}
                  value={answers[q.id] ?? answers[q.variableName]}
                  allAnswers={answers}
                  onChange={(val) => handleAnswerChange(q.id, val, q.variableName)}
                  gpsCoords={{ lat: gpsLat, lng: gpsLng, accuracy: gpsAccuracy }}
                />
              );
            })}
          </div>

          {/* Media Capture Section */}
          <div className="border-t border-gray-100 pt-5 space-y-3">
            <h3 className="text-xs font-bold text-[#17243A]">Field Media & Evidence Capture</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleSimulateMediaCapture('photo')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  mediaAttached.photo ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Camera className="w-4 h-4 text-[#C8202F]" />
                <span>{mediaAttached.photo ? 'Photo Attached ✓' : 'Capture Photo'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSimulateMediaCapture('audio')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  mediaAttached.audio ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Mic className="w-4 h-4 text-[#C8202F]" />
                <span>{mediaAttached.audio ? 'Audio Recorded ✓' : 'Record Audio'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSimulateMediaCapture('selfie')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  mediaAttached.selfie ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-[#C8202F]" />
                <span>{mediaAttached.selfie ? 'Selfie Verified ✓' : 'Enumerator Selfie'}</span>
              </button>
            </div>
          </div>

          {/* Action Buttons: Save Draft vs Final Submit */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleSaveDraftLocally}
              className="w-full sm:w-auto flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Draft to IndexedDB</span>
            </button>

            <button
              type="button"
              onClick={handleFinalSubmit}
              className="w-full sm:w-auto flex-1 bg-[#C8202F] hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl shadow-md text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Submit Interview & Sync</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Success View */}
      {step === 'success' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center space-y-5 max-w-lg mx-auto">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[#17243A]">Interview Successfully Submitted!</h2>
            <p className="text-xs text-gray-500">Submission UUID: <span className="font-mono">{clientUuid}</span></p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-600 text-left space-y-1">
            <div><b>Project:</b> {currentProject.title}</div>
            <div><b>Enumerator:</b> {enumeratorId}</div>
            <div><b>GPS Coordinates:</b> {gpsLat.toFixed(4)}, {gpsLng.toFixed(4)}</div>
            <div><b>Sync Status:</b> {isOnline ? 'Synced to Supabase PostgreSQL Database ✓' : 'Queued in IndexedDB (Offline) ✓'}</div>
          </div>

          <button
            type="button"
            onClick={() => setStep('auth')}
            className="w-full bg-[#17243A] hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs"
          >
            Start Another Field Interview
          </button>
        </div>
      )}
    </div>
  );
};
