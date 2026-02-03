import React, { useState, useEffect, useRef } from 'react';
import { TrapMasterProEngine } from './engine/audioEngine.js';
import FileUpload from './components/FileUpload.jsx';
import PresetSelector from './components/PresetSelector.jsx';
import LoudnessMeter from './components/LoudnessMeter.jsx';
import VolumeMixer from './components/VolumeMixer.jsx';
import WaveformVisualizer from './components/WaveformVisualizer.jsx';
import ExportButtons from './components/ExportButtons.jsx';
import ExportValidationPanel from './components/ExportValidationPanel.jsx';
import { Loader2, AlertCircle, Play, Pause, RotateCcw } from 'lucide-react';

export default function App() {
  const [engine, setEngine] = useState(null);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [presets, setPresets] = useState([]);
  const [presetIntents, setPresetIntents] = useState({});
  const [analysisData, setAnalysisData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [originalVolume, setOriginalVolume] = useState(0);
  const [processedVolume, setProcessedVolume] = useState(1);
  const [fileName, setFileName] = useState('');
  const [audioBuffer, setAudioBuffer] = useState(null);
  
  const audioFileRef = useRef(null);
  const timeUpdateIntervalRef = useRef(null);
  const currentSourceRef = useRef(null);

  // Initialize engine (deferred - browsers may require user interaction for AudioContext)
  useEffect(() => {
    const initEngine = async () => {
      setLoading(true);
      try {
        const audioEngine = new TrapMasterProEngine();
        const initialized = await audioEngine.initialize();
        
        if (initialized) {
          setEngine(audioEngine);
          const presetList = audioEngine.getPresets();
          setPresets(presetList);
          
          // Get intents for all presets
          const intents = {};
          presetList.forEach(preset => {
            intents[preset] = audioEngine.getPresetIntent(preset);
          });
          setPresetIntents(intents);
        } else {
          setError('Failed to initialize audio engine. Please refresh the page.');
        }
      } catch (err) {
        console.error('Engine initialization error:', err);
        setError(`Failed to initialize: ${err.message}. Please check browser console.`);
      } finally {
        setLoading(false);
      }
    };

    // Try to initialize immediately
    initEngine();
  }, []);

  // Handle file selection
  const handleFileSelect = async (file) => {
    if (!engine) return;
    
    setLoading(true);
    setError(null);
    setAudioLoaded(false);
    setSelectedPreset(null);
    setIsPlaying(false);
    setCurrentTime(0);
    stopPlayback();
    audioFileRef.current = file;
    setFileName(file.name);
    
    try {
      const result = await engine.loadAudioFile(file);
      
      if (result.success) {
        setAnalysisData(result.analysis);
        setAudioBuffer(engine.originalBuffer);
        setAudioLoaded(true);
      } else {
        setError(result.error || 'Failed to load audio file');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle preset selection (for real-time preview)
  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset);
    
    // If playing, switch preset in real-time
    if (isPlaying && engine) {
      engine.switchPresetRealtime(preset);
    }
  };

  // Handle preset preview (starts playback with preset)
  const handlePresetPreview = (preset) => {
    if (!engine || !audioLoaded) return;
    
    setSelectedPreset(preset);
    
    // Start playback with this preset
    if (!isPlaying) {
      startPlayback(preset);
    } else {
      // Switch preset in real-time
      engine.switchPresetRealtime(preset);
    }
  };

  // Start playback
  const startPlayback = (preset = selectedPreset) => {
    if (!engine || !audioLoaded) return;
    
    stopPlayback();
    
    try {
      const source = engine.playRealtime(
        preset,
        originalVolume,
        processedVolume,
        () => {
          setIsPlaying(false);
          setCurrentTime(0);
          currentSourceRef.current = null;
          if (timeUpdateIntervalRef.current) {
            clearInterval(timeUpdateIntervalRef.current);
            timeUpdateIntervalRef.current = null;
          }
        }
      );
      
      currentSourceRef.current = source;
      setIsPlaying(true);
      
      // Update time
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
      
      const startTime = Date.now() - (currentTime * 1000);
      timeUpdateIntervalRef.current = setInterval(() => {
        if (audioBuffer) {
          const elapsed = (Date.now() - startTime) / 1000;
          const newTime = elapsed % audioBuffer.duration;
          setCurrentTime(newTime);
          
          if (newTime >= audioBuffer.duration - 0.1) {
            setIsPlaying(false);
            setCurrentTime(0);
            if (timeUpdateIntervalRef.current) {
              clearInterval(timeUpdateIntervalRef.current);
              timeUpdateIntervalRef.current = null;
            }
          }
        }
      }, 100);
    } catch (err) {
      setError(err.message);
    }
  };

  // Stop playback
  const stopPlayback = () => {
    if (engine) {
      engine.stopRealtime();
    }
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = null;
    }
    setIsPlaying(false);
    currentSourceRef.current = null;
  };

  // Handle play/pause toggle
  const handlePlayPause = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      if (!selectedPreset) {
        setError('Please select a preset first');
        return;
      }
      startPlayback();
    }
  };

  // Handle volume changes
  const handleOriginalVolumeChange = (volume) => {
    setOriginalVolume(volume);
    if (engine) {
      engine.setVolumeMix(volume, processedVolume);
    }
  };

  const handleProcessedVolumeChange = (volume) => {
    setProcessedVolume(volume);
    if (engine) {
      engine.setVolumeMix(originalVolume, volume);
    }
  };

  // Handle export
  const handleExportWAV = async () => {
    if (!engine || !selectedPreset) return;
    
    setLoading(true);
    try {
      // Process preset offline for export
      const result = await engine.processPreset(selectedPreset);
      if (result.success) {
        const buffers = engine.getABBuffers();
        if (buffers) {
          const baseName = fileName.replace(/\.[^/.]+$/, '');
          await engine.exportToWAV(buffers.processed, `${baseName}_${selectedPreset}.wav`, {
            bitDepth: 24, // High quality
            dither: true,
            normalize: false
          });
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportMP3 = async () => {
    if (!engine || !selectedPreset) return;
    
    setLoading(true);
    try {
      // Process preset offline for export
      const result = await engine.processPreset(selectedPreset);
      if (result.success) {
        const buffers = engine.getABBuffers();
        if (buffers) {
          const baseName = fileName.replace(/\.[^/.]+$/, '');
          await engine.exportToMP3(buffers.processed, `${baseName}_${selectedPreset}.mp3`, 320, {
            dither: true,
            normalize: false
          });
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportAppleLossless = async () => {
    if (!engine || !selectedPreset) return;
    
    setLoading(true);
    try {
      // Process preset offline for export
      const result = await engine.processPreset(selectedPreset);
      if (result.success) {
        const buffers = engine.getABBuffers();
        if (buffers) {
          const baseName = fileName.replace(/\.[^/.]+$/, '');
          const exportResult = await engine.exportToAppleLossless(
            buffers.processed, 
            `${baseName}_${selectedPreset}_AppleLossless.m4a`,
            {
              sampleRate: 48000,
              bitDepth: 24,
              targetLUFS: -9, // Optional loudness target (preset feature)
              truePeakCeiling: -0.5
            }
          );
          
          if (exportResult.appleMusicCompatible) {
            // Display validation results
            if (exportResult.validation) {
              setExportValidation(exportResult.validation);
              console.log('Export validation:', exportResult.validation);
            }
            
            // Log CLI verification commands
            if (exportResult.cliVerification) {
              console.log('\n=== CLI Verification Commands ===');
              console.log('File Header Check:');
              console.log(exportResult.cliVerification.ffprobe);
              console.log('\nTrue Peak Check:');
              console.log(exportResult.cliVerification.ffmpeg);
              console.log('================================\n');
            }
            
            console.log('Apple Music Lossless-compatible export complete:', exportResult.specifications);
          }
          
          // Clear validation after 15 seconds
          setTimeout(() => {
            setExportValidation(null);
          }, 15000);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPlayback();
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, []);

  if (loading && !audioLoaded && !engine) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-500" />
          <p className="text-gray-400">Initializing audio engine...</p>
        </div>
      </div>
    );
  }

  // Show initialization prompt if engine not ready
  if (!engine && !loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            TrapMasterPro
          </h1>
          <p className="text-gray-400 mb-6">
            Click the button below to initialize the audio engine. Modern browsers require user interaction to enable audio processing.
          </p>
          <button
            onClick={() => {
              const initEngine = async () => {
                setLoading(true);
                try {
                  const audioEngine = new TrapMasterProEngine();
                  const initialized = await audioEngine.initialize();
                  
                  if (initialized) {
                    setEngine(audioEngine);
                    const presetList = audioEngine.getPresets();
                    setPresets(presetList);
                    
                    // Get intents for all presets
                    const intents = {};
                    presetList.forEach(preset => {
                      intents[preset] = audioEngine.getPresetIntent(preset);
                    });
                    setPresetIntents(intents);
                  } else {
                    setError('Failed to initialize audio engine');
                  }
                } catch (err) {
                  setError(err.message);
                } finally {
                  setLoading(false);
                }
              };
              initEngine();
            }}
            className="px-8 py-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium transition-all shadow-lg shadow-purple-500/30"
          >
            Initialize Audio Engine
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            TrapMasterPro
          </h1>
          <p className="text-gray-400">Professional mastering engine for Trap-Soul, Trap, Urban, and Hip-Hop</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-300">{error}</span>
          </div>
        )}

        {/* File Upload */}
        {!audioLoaded && (
          <div className="mb-8">
            <FileUpload onFileSelect={handleFileSelect} disabled={!engine || loading} />
          </div>
        )}

        {/* Main Interface */}
        {audioLoaded && (
          <div className="space-y-8">
            {/* File Info & Playback Controls */}
            <div className="p-6 bg-gray-900/50 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Loaded:</p>
                  <p className="text-white font-medium">{fileName}</p>
                  {analysisData && (
                    <div className="mt-1 text-xs text-gray-500">
                      {analysisData.duration.toFixed(2)}s • {analysisData.sampleRate}Hz • {analysisData.channels} channel{analysisData.channels > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setCurrentTime(0);
                      if (isPlaying) {
                        stopPlayback();
                        startPlayback();
                      }
                    }}
                    className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                    title="Restart"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handlePlayPause}
                    disabled={!selectedPreset}
                    className="p-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-5 h-5" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        <span>Play Preview</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Waveform */}
              {audioBuffer && (
                <WaveformVisualizer
                  audioBuffer={audioBuffer}
                  isPlaying={isPlaying}
                  currentTime={currentTime}
                />
              )}
            </div>

            {/* Preset Selector */}
            <PresetSelector
              presets={presets}
              selectedPreset={selectedPreset}
              onSelect={handlePresetSelect}
              presetIntents={presetIntents}
              isPlaying={isPlaying}
              onPreview={handlePresetPreview}
            />

            {/* Volume Mixer */}
            {selectedPreset && (
              <div className="p-6 bg-gray-900/50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Volume Mix</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Adjust the balance between original and processed audio. Play both simultaneously to hear the difference.
                </p>
                <VolumeMixer
                  originalVolume={originalVolume}
                  processedVolume={processedVolume}
                  onOriginalChange={handleOriginalVolumeChange}
                  onProcessedChange={handleProcessedVolumeChange}
                />
              </div>
            )}

            {/* Loudness Meters */}
            {selectedPreset && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-gray-900/50 rounded-lg">
                <LoudnessMeter
                  lufs={analysisData?.integratedLUFS || -70}
                  label="Original LUFS"
                />
                {(() => {
                  // For real-time, we'd need to calculate processed LUFS
                  // For now, show estimated based on preset
                  const estimatedLUFS = selectedPreset === 'Festival Banger' || selectedPreset === 'Maximum Impact'
                    ? (analysisData?.integratedLUFS || -70) + 0.5
                    : (analysisData?.integratedLUFS || -70);
                  return (
                    <LoudnessMeter
                      lufs={estimatedLUFS}
                      label="Processed LUFS (Estimated)"
                    />
                  );
                })()}
              </div>
            )}

            {/* Export Buttons */}
            {selectedPreset && (
              <div className="p-6 bg-gray-900/50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Export</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Export your mastered track. Processing will be applied offline for highest quality.
                </p>
                <ExportButtons
                  onExportWAV={handleExportWAV}
                  onExportMP3={handleExportMP3}
                  onExportAppleLossless={handleExportAppleLossless}
                  disabled={!selectedPreset || loading}
                />
              </div>
            )}

            {/* Instructions */}
            {!selectedPreset && (
              <div className="p-6 bg-purple-900/20 border border-purple-700/30 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 text-purple-300">Getting Started</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Click on any preset to preview it in real-time</li>
                  <li>• Use the volume mixer to hear original and processed audio simultaneously</li>
                  <li>• Switch between presets while playing to compare them instantly</li>
                  <li>• Each preset has a unique character - try them all to find your sound</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
