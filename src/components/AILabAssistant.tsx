import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Brain,
  Search,
  MapPin,
  Volume2,
  Music,
  Image,
  Video,
  Mic,
  Send,
  Upload,
  Play,
  Pause,
  Loader2,
  ExternalLink,
  ChevronDown,
  Layers,
  Radio,
  FileCheck,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  model?: string;
  thinking?: boolean;
  groundingSources?: any[];
}

export const AILabAssistant: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'chat' | 'thinking' | 'grounded' | 'tts_music' | 'image_video' | 'multimodal'
  >('chat');

  // Multi-turn Chat states
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      role: 'model',
      text: 'Greetings, Scientist. I am Q Tracker AI. I can formulate biochemical hypotheses, debug complex experimental protocols, analyze microplate assay metrics, search real-time literature, and generate laboratory media.',
      timestamp: 'Just now',
      model: 'gemini-3.5-flash',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [chatModel, setChatModel] = useState<'gemini-3.5-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite'>('gemini-3.5-flash');
  const [isGenerating, setIsGenerating] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // High Thinking states
  const [thinkingPrompt, setThinkingPrompt] = useState('Analyze why EGFR C797S point mutation causes steric resistance to covalent osimertinib binding, and propose 3 alternative allosteric strategies.');
  const [thinkingOutput, setThinkingOutput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  // Grounded Search / Maps states
  const [groundedQuery, setGroundedQuery] = useState('Recent FDA approvals for non-small cell lung cancer kinase inhibitors in 2026');
  const [groundedMode, setGroundedMode] = useState<'search' | 'maps'>('search');
  const [groundedResult, setGroundedResult] = useState<{ text: string; sources?: any[] } | null>(null);
  const [isGrounding, setIsGrounding] = useState(false);

  // TTS & Music states
  const [ttsInput, setTtsInput] = useState('Protocol Step 4: Centrifuge at 14,000 RPM for 15 minutes at 4 degrees Celsius. Carefully aspirate supernatant without disturbing the kinase pellet.');
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);
  const [isGeneratingTts, setIsGeneratingTts] = useState(false);

  const [musicPrompt, setMusicPrompt] = useState('Calm ambient laboratory focus soundscape with minimal periodic acoustic harmonics');
  const [musicModel, setMusicModel] = useState<'lyria-3-clip-preview' | 'lyria-3-pro-preview'>('lyria-3-clip-preview');
  const [musicAudioUrl, setMusicAudioUrl] = useState<string | null>(null);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);

  // Image & Video Gen states
  const [imagePrompt, setImagePrompt] = useState('Scientific 3D cartoon depiction of receptor tyrosine kinase dimer transphosphorylation at cell membrane');
  const [imageModel, setImageModel] = useState<'gemini-nano-banana-2.1' | 'gemini-3-pro-image-preview'>('gemini-nano-banana-2.1');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [imageSize, setImageSize] = useState('1K');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const [videoPrompt, setVideoPrompt] = useState('Fluorescent microscopic time-lapse of cellular mitosis with spindle fiber elongation');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoOperationName, setVideoOperationName] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoStatus, setVideoStatus] = useState<string | null>(null);

  // Multimodal Vision & Audio states
  const [multimodalFile, setMultimodalFile] = useState<{ data: string; mimeType: string; name: string } | null>(null);
  const [multimodalPrompt, setMultimodalPrompt] = useState('Examine this laboratory assay image. Calculate molecular band weights and flag anomalies.');
  const [multimodalAnalysis, setMultimodalAnalysis] = useState('');
  const [isAnalyzingMultimodal, setIsAnalyzingMultimodal] = useState(false);

  // Audio transcription states
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Auto scroll chat
  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 1. Chat handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isGenerating) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsGenerating(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          model: chatModel,
          systemInstruction: 'You are Q Tracker AI, a world-class senior scientific assistant specialized in computational biology, enzyme kinetics, pharmacology, and laboratory automation. Deliver rigorous, data-driven answers with clear molecular explanations.',
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Chat request failed');

      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: data.model,
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'model',
          text: `Error processing query: ${err.message}`,
          timestamp: 'Just now',
          model: chatModel,
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. High Thinking handler (gemini-3.1-pro-preview with thinkingLevel HIGH)
  const handleExecuteThinking = async () => {
    if (!thinkingPrompt.trim() || isThinking) return;
    setIsThinking(true);
    setThinkingOutput('');

    try {
      const res = await fetch('/api/gemini/thinking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: thinkingPrompt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Thinking request failed');
      setThinkingOutput(data.text);
    } catch (err: any) {
      setThinkingOutput(`Reasoning error: ${err.message}`);
    } finally {
      setIsThinking(false);
    }
  };

  // 3. Grounded Search / Maps handler
  const handleExecuteGrounded = async () => {
    if (!groundedQuery.trim() || isGrounding) return;
    setIsGrounding(true);
    setGroundedResult(null);

    const endpoint = groundedMode === 'search' ? '/api/gemini/grounded-search' : '/api/gemini/grounded-maps';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: groundedQuery }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Grounded request failed');

      setGroundedResult({
        text: data.text,
        sources: data.groundingMetadata?.groundingChunks || [],
      });
    } catch (err: any) {
      setGroundedResult({ text: `Search failed: ${err.message}` });
    } finally {
      setIsGrounding(false);
    }
  };

  // 4. TTS handler (gemini-3.8-flash-tts)
  const handleGenerateTts = async () => {
    if (!ttsInput.trim() || isGeneratingTts) return;
    setIsGeneratingTts(true);
    try {
      const res = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: ttsInput, voiceName: 'Kore' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'TTS failed');
      setTtsAudioUrl(data.audioData);
    } catch (err: any) {
      alert(`TTS generation error: ${err.message}`);
    } finally {
      setIsGeneratingTts(false);
    }
  };

  // 5. Music generator (Lyria)
  const handleGenerateMusic = async () => {
    if (!musicPrompt.trim() || isGeneratingMusic) return;
    setIsGeneratingMusic(true);
    try {
      const res = await fetch('/api/gemini/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: musicPrompt, model: musicModel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Music failed');
      if (data.audioData) {
        setMusicAudioUrl(data.audioData);
      }
    } catch (err: any) {
      alert(`Music generation error: ${err.message}`);
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  // 6. Image generator (gemini-nano-banana-2.1 or gemini-3-pro-image-preview)
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim() || isGeneratingImage) return;
    setIsGeneratingImage(true);
    try {
      const res = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          model: imageModel,
          aspectRatio,
          imageSize,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Image failed');
      setGeneratedImageUrl(data.imageUrl);
    } catch (err: any) {
      alert(`Image generation error: ${err.message}`);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 7. Veo video generator (veo-3.1-fast-generate-preview)
  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim() || isGeneratingVideo) return;
    setIsGeneratingVideo(true);
    setVideoStatus('Initiating Veo 3.1 video generation...');
    try {
      const res = await fetch('/api/gemini/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoPrompt,
          aspectRatio: videoAspectRatio,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Video failed');
      setVideoOperationName(data.operationName);
      setVideoStatus(`Queued: ${data.operationName}. Polling in progress...`);
    } catch (err: any) {
      setVideoStatus(`Video generation failed: ${err.message}`);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // 8. Multimodal file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setMultimodalFile({
        data: result,
        mimeType: file.type || 'image/png',
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeMultimodal = async () => {
    if (!multimodalFile || isAnalyzingMultimodal) return;
    setIsAnalyzingMultimodal(true);
    setMultimodalAnalysis('');

    try {
      const res = await fetch('/api/gemini/analyze-multimodal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Data: multimodalFile.data,
          mimeType: multimodalFile.mimeType,
          prompt: multimodalPrompt,
          type: multimodalFile.mimeType.startsWith('video') ? 'video' : 'image',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setMultimodalAnalysis(data.analysis);
    } catch (err: any) {
      setMultimodalAnalysis(`Analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzingMultimodal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top AI Studio Header & Nav */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs font-semibold bg-purple-50 text-purple-700 rounded-md border border-purple-200/60 uppercase">
                Gemini 3 Suite
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Flash • Pro Thinking • Live Audio • Veo Video • Lyria • Transcribe • TTS
              </span>
            </div>
            <h1 className="text-lg font-bold text-slate-900">Virtual Laboratory AI Studio</h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Deep reasoning hypotheses, real-time grounded search, laboratory media synthesis, and hands-free multimodal intelligence.
            </p>
          </div>

          {/* Subtabs */}
          <div className="flex flex-wrap bg-slate-100 p-1 rounded-lg text-xs font-medium gap-0.5">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'chat' ? 'bg-white text-purple-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Multi-Turn Chat
            </button>
            <button
              onClick={() => setActiveTab('thinking')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'thinking' ? 'bg-white text-purple-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              High Thinking
            </button>
            <button
              onClick={() => setActiveTab('grounded')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'grounded' ? 'bg-white text-purple-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Search & Maps
            </button>
            <button
              onClick={() => setActiveTab('tts_music')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'tts_music' ? 'bg-white text-purple-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              TTS & Lyria Music
            </button>
            <button
              onClick={() => setActiveTab('image_video')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'image_video' ? 'bg-white text-purple-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Image & Veo Video
            </button>
            <button
              onClick={() => setActiveTab('multimodal')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'multimodal' ? 'bg-white text-purple-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vision & Audio
            </button>
          </div>
        </div>
      </div>

      {/* 1. MULTI-TURN CHAT */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col h-[600px] overflow-hidden">
          {/* Top Chat Bar with Model Switcher */}
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                Laboratory Intelligence Thread
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Model:</span>
              <select
                value={chatModel}
                onChange={(e) => setChatModel(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-md px-2.5 py-1 text-slate-800 font-medium text-xs"
              >
                <option value="gemini-3.5-flash">gemini-3.5-flash (General STEM)</option>
                <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex Science)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Low-Latency)</option>
              </select>
            </div>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1 px-1">
                  <span>{m.role === 'user' ? 'Scientist' : 'Q Tracker AI'}</span>
                  {m.model && <span className="font-mono text-[10px] text-slate-400">({m.model})</span>}
                  <span>• {m.timestamp}</span>
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-xs'
                      : 'bg-slate-100 text-slate-800 rounded-tl-xs whitespace-pre-wrap'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex items-center gap-2 text-xs text-slate-500 p-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                <span>Q Tracker AI is synthesizing biochemical response...</span>
              </div>
            )}
            <div ref={chatScrollRef} />
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-slate-50/50 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about biochemical pathways, assay curve fitting, buffer preparations, or kinase mutations..."
              className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={isGenerating || !inputText.trim()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Send
            </button>
          </form>
        </div>
      )}

      {/* 2. HIGH THINKING MODE */}
      {activeTab === 'thinking' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                High Thinking Mode (ThinkingLevel.HIGH)
              </h2>
              <p className="text-xs text-slate-500">
                Powered by gemini-3.1-pro-preview with unconstrained reasoning token budgets for complex STEM proofs and structural biology.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Complex Hypothesis or Assay Query
            </label>
            <textarea
              rows={3}
              value={thinkingPrompt}
              onChange={(e) => setThinkingPrompt(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleExecuteThinking}
              disabled={isThinking}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              {isThinking ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deep Thinking In Progress...
                </>
              ) : (
                <>
                  <Brain className="w-3.5 h-3.5" /> Execute High Thinking Analysis
                </>
              )}
            </button>
          </div>

          {thinkingOutput && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-mono">
                <span>Model Output: gemini-3.1-pro-preview (ThinkingLevel.HIGH)</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                {thinkingOutput}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. GROUNDED SEARCH & MAPS */}
      {activeTab === 'grounded' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Grounded Real-Time Intelligence (gemini-3.5-flash)
              </h2>
              <p className="text-xs text-slate-500">
                Utilize Google Search grounding for literature and Google Maps grounding for scientific facilities.
              </p>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-medium">
              <button
                onClick={() => setGroundedMode('search')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md ${
                  groundedMode === 'search' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'text-slate-600'
                }`}
              >
                <Search className="w-3.5 h-3.5" /> Google Search
              </button>
              <button
                onClick={() => setGroundedMode('maps')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md ${
                  groundedMode === 'maps' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'text-slate-600'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" /> Google Maps
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={groundedQuery}
              onChange={(e) => setGroundedQuery(e.target.value)}
              placeholder={
                groundedMode === 'search'
                  ? 'e.g. Recent FDA drug approvals for ALK or EGFR positive NSCLC in 2026'
                  : 'e.g. High-throughput synchrotron beamlines or biobanks in California'
              }
              className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handleExecuteGrounded}
              disabled={isGrounding}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {isGrounding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              Search
            </button>
          </div>

          {groundedResult && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
              {groundedResult.text}
            </div>
          )}
        </div>
      )}

      {/* 4. TTS & LYRIA MUSIC */}
      {activeTab === 'tts_music' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* TTS Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-blue-600" />
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Text-to-Speech (gemini-3.8-flash-tts)
                </h3>
                <p className="text-[11px] text-slate-500">Audio playback for protocol voice debriefs</p>
              </div>
            </div>

            <textarea
              rows={3}
              value={ttsInput}
              onChange={(e) => setTtsInput(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            <button
              onClick={handleGenerateTts}
              disabled={isGeneratingTts}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {isGeneratingTts ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Volume2 className="w-3.5 h-3.5" />}
              Convert Protocol to Speech
            </button>

            {ttsAudioUrl && (
              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200">
                <audio controls src={ttsAudioUrl} className="w-full h-8" />
              </div>
            )}
          </div>

          {/* Lyria Music Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-purple-600" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Laboratory Ambient Music (Lyria)
                  </h3>
                  <p className="text-[11px] text-slate-500">lyria-3-clip-preview / lyria-3-pro-preview</p>
                </div>
              </div>

              <select
                value={musicModel}
                onChange={(e) => setMusicModel(e.target.value as any)}
                className="text-[11px] bg-slate-50 border border-slate-200 rounded px-2 py-1 font-mono"
              >
                <option value="lyria-3-clip-preview">Lyria Clip (30s)</option>
                <option value="lyria-3-pro-preview">Lyria Pro (Full)</option>
              </select>
            </div>

            <textarea
              rows={3}
              value={musicPrompt}
              onChange={(e) => setMusicPrompt(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
            />

            <button
              onClick={handleGenerateMusic}
              disabled={isGeneratingMusic}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {isGeneratingMusic ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Music className="w-3.5 h-3.5" />}
              Generate Ambient Focus Audio
            </button>

            {musicAudioUrl && (
              <div className="p-3 bg-purple-50/60 rounded-lg border border-purple-200">
                <audio controls src={musicAudioUrl} className="w-full h-8" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. IMAGE & VEO VIDEO GENERATION */}
      {activeTab === 'image_video' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image Gen Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-slate-900">Lab Diagram Generation</h3>
              </div>
              <div className="flex gap-2">
                <select
                  value={imageModel}
                  onChange={(e) => setImageModel(e.target.value as any)}
                  className="text-[11px] bg-slate-50 border border-slate-200 rounded px-2 py-1"
                >
                  <option value="gemini-nano-banana-2.1">nano-banana-2.1</option>
                  <option value="gemini-3-pro-image-preview">3-pro-image</option>
                </select>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="text-[11px] bg-slate-50 border border-slate-200 rounded px-2 py-1 font-mono"
                >
                  <option value="16:9">16:9</option>
                  <option value="1:1">1:1</option>
                  <option value="9:16">9:16</option>
                  <option value="4:3">4:3</option>
                </select>
                <select
                  value={imageSize}
                  onChange={(e) => setImageSize(e.target.value)}
                  className="text-[11px] bg-slate-50 border border-slate-200 rounded px-2 py-1 font-mono"
                >
                  <option value="1K">1K</option>
                  <option value="2K">2K</option>
                  <option value="4K">4K</option>
                </select>
              </div>
            </div>

            <textarea
              rows={2}
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            <button
              onClick={handleGenerateImage}
              disabled={isGeneratingImage}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {isGeneratingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Image className="w-3.5 h-3.5" />}
              Generate Scientific Diagram
            </button>

            {generatedImageUrl && (
              <div className="rounded-lg overflow-hidden border border-slate-200">
                <img src={generatedImageUrl} alt="Generated scientific figure" className="w-full h-auto" />
              </div>
            )}
          </div>

          {/* Veo Video Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-rose-600" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Veo 3.1 Video Synthesis</h3>
                  <p className="text-[11px] text-slate-500">veo-3.1-fast-generate-preview</p>
                </div>
              </div>

              <select
                value={videoAspectRatio}
                onChange={(e) => setVideoAspectRatio(e.target.value as any)}
                className="text-[11px] bg-slate-50 border border-slate-200 rounded px-2 py-1 font-mono"
              >
                <option value="16:9">16:9 Landscape</option>
                <option value="9:16">9:16 Portrait</option>
              </select>
            </div>

            <textarea
              rows={2}
              value={videoPrompt}
              onChange={(e) => setVideoPrompt(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
            />

            <button
              onClick={handleGenerateVideo}
              disabled={isGeneratingVideo}
              className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {isGeneratingVideo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Video className="w-3.5 h-3.5" />}
              Generate Simulation Video
            </button>

            {videoStatus && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono text-slate-600">
                {videoStatus}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. MULTIMODAL VISION & AUDIO */}
      {activeTab === 'multimodal' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Multimodal Image & Video Understanding (gemini-3.1-pro-preview)
              </h2>
              <p className="text-xs text-slate-500">
                Upload western blots, microscopy photos, or kinetic video recordings for algorithmic inspection.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Upload Media File (Image / Video)
              </label>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg cursor-pointer"
              />
              {multimodalFile && (
                <div className="mt-2 text-xs text-emerald-600 font-mono">
                  Loaded: {multimodalFile.name} ({multimodalFile.mimeType})
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Analytical Instructions
              </label>
              <textarea
                rows={2}
                value={multimodalPrompt}
                onChange={(e) => setMultimodalPrompt(e.target.value)}
                className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleAnalyzeMultimodal}
              disabled={isAnalyzingMultimodal || !multimodalFile}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              {isAnalyzingMultimodal ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Layers className="w-3.5 h-3.5" />}
              Execute Multimodal Analysis
            </button>
          </div>

          {multimodalAnalysis && (
            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
              {multimodalAnalysis}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
