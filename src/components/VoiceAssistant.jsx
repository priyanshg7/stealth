import React from 'react';

export default function VoiceAssistant({
  voiceAssistantOpen,
  setVoiceAssistantOpen,
  voiceReplies,
  language,
  handleVoiceCommand,
  isListening,
  startSpeechRecognition
}) {
  if (!voiceAssistantOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md border border-outline-variant shadow-2xl overflow-hidden flex flex-col h-[500px] animate-in fade-in slide-in-from-bottom-5 duration-200">
        
        {/* Header */}
        <div className="bg-primary p-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center animate-bounce">
              <span className="material-symbols-outlined notranslate text-white text-lg font-bold">mic</span>
            </div>
            <div>
              <h3 className="font-display font-bold text-sm">KisanMitra Voice Assistant</h3>
              <span className="text-[10px] text-white/80 font-medium">Online | Language: {language.toUpperCase()}</span>
            </div>
          </div>
          <button 
            onClick={() => setVoiceAssistantOpen(false)}
            className="text-white/85 hover:text-white flex items-center justify-center p-1 rounded-full hover:bg-white/10"
          >
            <span className="material-symbols-outlined notranslate text-lg">close</span>
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar bg-surface-container-low/40">
          {isListening && (
            <div className="flex justify-center animate-fade-in-up">
              <span className="bg-red-50 text-red-700 text-[10px] font-bold py-1 px-3 rounded-full border border-red-200 flex items-center gap-1.5 animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                Listening to voice input... Speak now
              </span>
            </div>
          )}
          {voiceReplies.map((reply, idx) => (
            <div 
              key={idx} 
              className={`flex ${reply.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
            >
              <div className={`max-w-[80%] p-3.5 rounded-2xl text-xs font-semibold leading-relaxed ${
                reply.sender === 'user' 
                  ? 'bg-primary text-white rounded-tr-none' 
                  : 'bg-white border border-outline-variant text-on-surface rounded-tl-none shadow-xs'
              }`}>
                {reply.text}
              </div>
            </div>
          ))}
        </div>

        {/* Preset quick queries */}
        <div className="p-3 border-t border-surface-container-high bg-white overflow-x-auto no-scrollbar flex gap-2 shrink-0">
          {[
            'What should I do today?',
            'Should I irrigate tomorrow?',
            'Open my wheat farm',
            'Open my rice farm',
            'Open my sugarcane farm',
            'Take me to disease diagnosis',
            'Show mandi prices',
            'Show government benefits'
          ].map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleVoiceCommand(preset)}
              className="px-3 py-1.5 rounded-full border border-primary/30 text-primary text-[10px] font-bold hover:bg-primary/5 shrink-0 bg-white"
            >
              🎤 "{preset}"
            </button>
          ))}
        </div>

        {/* Text Input Simulation */}
        <div className="p-3 border-t bg-white flex gap-2 shrink-0 items-center">
          <button
            onClick={() => {
              startSpeechRecognition(
                (transcript) => {
                  handleVoiceCommand(transcript);
                },
                (err) => console.error("Mic error:", err)
              );
            }}
            className={`h-10 w-10 rounded-xl flex items-center justify-center border text-white transition-all ${
              isListening ? 'bg-red-600 border-red-600 animate-pulse' : 'bg-primary border-primary hover:bg-secondary'
            }`}
            title="Speak Question"
          >
            <span className="material-symbols-outlined notranslate text-sm font-bold">
              {isListening ? 'settings_voice' : 'mic'}
            </span>
          </button>
          
          <input 
            type="text"
            id="voice-text-input"
            placeholder={isListening ? "Listening..." : "Type question or speak..."}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleVoiceCommand(e.target.value);
                e.target.value = '';
              }
            }}
            className="flex-1 bg-surface-container-low border border-outline-variant rounded-xl h-10 px-3 text-xs font-semibold"
          />
          
          <button 
            onClick={() => {
              const el = document.getElementById('voice-text-input');
              if (el && el.value) {
                handleVoiceCommand(el.value);
                el.value = '';
              }
            }}
            className="bg-primary hover:bg-secondary text-white px-4 h-10 rounded-xl text-xs font-bold"
          >
            Send
          </button>
        </div>

      </div>
    </div>
  );
}
