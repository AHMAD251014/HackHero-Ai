/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Terminal, 
  Sparkles, 
  Cpu, 
  Search,
  BookOpen,
  Zap,
  Send, 
  Plus, 
  Trash2, 
  FileText, 
  Layout,
  ChevronRight,
  Bot,
  BrainCircuit,
  MessageSquare,
  Code2,
  Bug,
  LineChart
} from 'lucide-react';
import { AGENTS, HackAgent, ChatMessage, ProjectState } from './types.ts';
import { askAgent, askAgentStream, brainstormIdeas, generatePitch } from './services/gemini.ts';
import WorkflowBuilder from './components/WorkflowBuilder.tsx';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<HackAgent>(AGENTS[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'forge' | 'workflow' | 'pitch'>('chat');
  
  // Forge State
  const [themeInput, setThemeInput] = useState('');
  const [ideas, setIdeas] = useState<any[]>([]);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);

  // Pitch/Project State
  const [project, setProject] = useState<ProjectState>({
    name: '',
    tagline: '',
    problem: '',
    solution: '',
    techStack: [],
    roadmap: [],
    researchPapers: [],
    challenges: []
  });
  const [generatedPitchText, setGeneratedPitchText] = useState('');
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    const historyForAi = [...messages, userMessage];
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const aiPlaceholder: ChatMessage = {
      role: 'model',
      content: '',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, aiPlaceholder]);

    try {
      setIsStreaming(true);
      await askAgentStream(selectedAgent, historyForAi, input, (fullText) => {
        setIsTyping(false);
        setMessages(prev => {
          const newMessages = [...prev];
          const lastIdx = newMessages.length - 1;
          if (newMessages[lastIdx].role === 'model') {
            newMessages[lastIdx] = { ...newMessages[lastIdx], content: fullText };
          }
          return newMessages;
        });
      });
      setIsStreaming(false);
    } catch (error) {
      console.error(error);
      setIsTyping(false);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastIdx = newMessages.length - 1;
        if (newMessages[lastIdx].role === 'model' && !newMessages[lastIdx].content) {
          newMessages[lastIdx] = { ...newMessages[lastIdx], content: "Connection interrupted. Please try again." };
        }
        return newMessages;
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleBrainstorm = async () => {
    if (!themeInput.trim()) return;
    setIsGeneratingIdeas(true);
    try {
      const results = await brainstormIdeas(themeInput);
      setIdeas(results);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const handleGeneratePitch = async () => {
    setIsGeneratingPitch(true);
    try {
      const result = await generatePitch(project);
      setGeneratedPitchText(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  const selectIdea = (idea: any) => {
    setProject({
      ...project,
      name: idea.title,
      solution: idea.description,
      techStack: [idea.tech],
      researchPapers: idea.research,
      challenges: idea.challenges
    });
    setActiveTab('pitch');
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-zinc-100 font-sans overflow-hidden relative">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Agents & Meta */}
      <aside className={`
        fixed inset-y-0 left-0 w-80 border-r border-zinc-800 bg-[#0c0c0c] flex flex-col z-50 
        transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 border-b border-zinc-800 bg-gradient-to-b from-indigo-500/5 to-transparent flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-emerald-400 rounded-sm shadow-[0_0_15px_rgba(99,102,241,0.3)]"></div>
              <h1 className="text-xl font-bold tracking-tight text-white italic">HACKHERO AI</h1>
            </div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Team Workspace • Ver 4.2.0</p>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-zinc-500 hover:text-white"
          >
            <ChevronRight className="rotate-180" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-8 space-y-6">
          <div>
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-4 mb-4 block">Specialized Unit</span>
            <div className="space-y-2">
              {AGENTS.map(agent => (
                <button
                  key={agent.id}
                  onClick={() => {
                    setSelectedAgent(agent);
                    if (window.innerWidth < 1024) setIsSidebarOpen(false);
                  }}
                  className={`w-full text-left p-4 rounded-lg transition-all border ${
                    selectedAgent.id === agent.id 
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-white' 
                    : 'bg-transparent border-transparent text-zinc-500 hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src={agent.avatar} className="w-10 h-10 rounded bg-zinc-800 border border-zinc-700" alt={agent.name} />
                    <div>
                      <div className="text-xs font-bold leading-none mb-1">{agent.name}</div>
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">{agent.role}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="px-4">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5">
              <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Neural Stats</h2>
              <div className="space-y-4">
                {[
                  { label: "Token Purity", val: "99.8%", color: "bg-indigo-500", w: "90%" },
                  { label: "Logic Flow", val: "High", color: "bg-emerald-400", w: "85%" }
                ].map(stat => (
                  <div key={stat.label}>
                    <div className="flex justify-between text-[10px] mb-2 font-mono">
                      <span className="text-zinc-500">{stat.label}</span>
                      <span className="text-zinc-300">{stat.val}</span>
                    </div>
                    <div className="h-0.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full ${stat.color}`} style={{ width: stat.w }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-zinc-800 bg-black/40">
           <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono tracking-tighter">
            <span>AX-992-DELTA</span>
            <div className="flex gap-2">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               <span>SYNC_ACTIVE</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 flex flex-col relative z-10 bg-[#0a0a0a] min-w-0">
        {/* Navigation Tabs */}
        <nav className="h-16 border-b border-zinc-800 flex items-center justify-between px-4 lg:px-10 bg-[#0b0b0b] sticky top-0 z-30">
          <div className="flex items-center gap-4 lg:gap-10 overflow-x-auto no-scrollbar mask-fade-right flex-1 scroll-smooth">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-zinc-400 hover:text-white flex-shrink-0"
            >
              <Bot size={20} />
            </button>
            <div className="flex gap-6 lg:gap-10">
              {[
                { id: 'chat', label: 'RESEARCH', icon: Bot },
                { id: 'forge', label: 'IDEA FORGE', icon: Sparkles },
                { id: 'workflow', label: 'LOGIC', icon: BrainCircuit },
                { id: 'pitch', label: 'DECK', icon: Layout }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative h-16 flex items-center gap-2 transition-all flex-shrink-0 ${
                    activeTab === tab.id ? 'text-indigo-400' : 'text-zinc-600 hover:text-zinc-300'
                  }`}
                >
                  <tab.icon size={16} />
                  <span className="text-[10px] font-bold tracking-widest leading-none whitespace-nowrap">{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div layoutId="nav-glow" className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 ml-4">
            <span className="text-[10px] font-mono text-zinc-600 whitespace-nowrap">HACK_ENTRY #422</span>
            <div className="flex -space-x-1.5 overflow-hidden">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-6 h-6 rounded border border-[#0a0a0a] bg-zinc-800 flex items-center justify-center text-[8px] font-bold text-zinc-400 flex-shrink-0">T{i}</div>
              ))}
            </div>
          </div>
        </nav>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {activeTab === 'chat' && (
              <motion.div 
                key="chat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-full flex flex-col"
              >
                <div className="flex-1 overflow-y-auto p-6 lg:p-12 space-y-8 lg:space-y-12 max-w-4xl mx-auto w-full">
                  {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center py-10 lg:py-20">
                      <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-sm flex items-center justify-center mb-8 rotate-45">
                        <Bot size={32} className="text-indigo-500 -rotate-45" />
                      </div>
                      <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4 italic tracking-tight">WAITING FOR COMMAND</h2>
                      <p className="text-zinc-500 text-sm max-w-md mx-auto leading-relaxed">
                        {selectedAgent.name} is ready to optimize your hackathon submission. State your requirement or paste a code snippet for analysis.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 w-full">
                        {[
                          { l: "Optimize Architecture", i: Code2, prompt: "Review my current high-level architecture and suggest improvements for scale." },
                          { l: "Debug Code Snippet", i: Bug, prompt: "I have a React component that isn't re-rendering correctly. Can you help me debug it?" },
                          { l: "Market Research", i: LineChart, prompt: "What are the common pitfalls in the current FinTech AI landscape?" },
                          { l: "Research Papers", i: BookOpen, prompt: "Can you list 3 research papers on LLM quantization for edge devices?" }
                        ].map(q => (
                          <button 
                            key={q.l}
                            onClick={() => setInput(q.prompt)}
                            className="bg-zinc-900/50 border border-zinc-800 p-4 rounded text-left transition-all hover:bg-zinc-800 hover:border-zinc-600"
                          >
                            <q.i size={16} className="text-indigo-400 mb-2" />
                            <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-200">{q.l}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((msg, idx) => {
                    const isLastMessage = idx === messages.length - 1;
                    const isEmptyPlaceholder = msg.role === 'model' && !msg.content && isLastMessage;
                    
                    if (isEmptyPlaceholder && isTyping) return null;

                    return (
                      <div key={idx} className={`flex gap-4 lg:gap-8 group ${msg.role === 'user' ? 'opacity-80' : ''}`}>
                        <div className="flex-shrink-0 pt-1">
                          <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded border flex items-center justify-center ${
                            msg.role === 'user' ? 'bg-zinc-900 border-zinc-800 text-zinc-500' : 'bg-indigo-500 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                          }`}>
                            {msg.role === 'user' ? <MessageSquare size={14} /> : <Zap size={14} />}
                          </div>
                        </div>
                        <div className="flex-1 space-y-2 min-w-0">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{msg.role === 'user' ? 'PROMPT' : 'OUTPUT'}</span>
                            <span className="text-[10px] font-mono text-zinc-700">{msg.timestamp.toLocaleTimeString()}</span>
                          </div>
                          <div className={`markdown-body break-words ${msg.role === 'model' ? 'bg-indigo-600/5 border border-indigo-500/10 p-4 lg:p-6 rounded-xl' : ''} ${isLastMessage && isStreaming ? 'streaming-cursor' : ''}`}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {isTyping && (
                    <div className="flex gap-4 lg:gap-8 animate-pulse">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 bg-zinc-800 rounded border border-zinc-700"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-2 w-20 bg-zinc-800 rounded"></div>
                        <div className="h-4 w-full bg-zinc-900 rounded"></div>
                        <div className="h-4 w-3/4 bg-zinc-900 rounded"></div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Fixed Bottom */}
                <div className="px-4 pb-6 lg:px-12 lg:pb-12 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pt-4">
                  <div className="max-w-4xl mx-auto w-full relative">
                    <input 
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder={`Message ${selectedAgent.name}...`}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white p-4 lg:p-6 pr-16 lg:pr-20 outline-none rounded-lg focus:border-indigo-500 transition-all font-mono text-xs lg:text-sm placeholder:text-zinc-700"
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={!input.trim() || isTyping}
                      className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-white text-black rounded flex items-center justify-center hover:bg-zinc-200 transition-all disabled:opacity-20 flex-shrink-0"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'forge' && (
              <motion.div 
                key="forge"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full p-6 lg:p-12 overflow-y-auto"
              >
                <div className="max-w-6xl mx-auto flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12">
                  <div className="lg:col-span-5 space-y-8">
                     <div>
                        <h2 className="text-2xl lg:text-3xl font-bold text-white italic tracking-tight mb-2 uppercase">IDEA FORGE</h2>
                        <p className="text-zinc-500 text-sm">Synthesize market gaps and research mapping.</p>
                     </div>
                     
                     <div className="bg-zinc-900/50 border border-zinc-800 p-6 lg:p-8 rounded-xl space-y-6">
                        <div>
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-4">Target Theme</label>
                          <textarea 
                            value={themeInput}
                            onChange={(e) => setThemeInput(e.target.value)}
                            placeholder="e.g., AI-powered urban planning with vision transformers..."
                            className="w-full bg-black border border-zinc-800 rounded p-4 text-sm h-32 focus:border-indigo-500 outline-none resize-none"
                          />
                        </div>
                        <button 
                          onClick={handleBrainstorm}
                          disabled={isGeneratingIdeas || !themeInput.trim()}
                          className="w-full py-4 bg-white text-black font-bold text-sm rounded hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isGeneratingIdeas ? <Zap className="animate-spin" size={18} /> : <Sparkles size={18} />}
                          START SYNTHESIS
                        </button>
                     </div>
                  </div>

                  <div className="lg:col-span-7 space-y-8">
                    <AnimatePresence mode="popLayout">
                      {ideas.map((idea, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-zinc-900/10 border border-zinc-800 p-6 lg:p-8 rounded-xl group relative overflow-hidden"
                        >
                          <header className="flex justify-between items-start mb-6 gap-4">
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold text-indigo-400 font-mono tracking-widest uppercase mb-1 block">Option {idx + 1}</span>
                              <h3 className="text-lg lg:text-xl font-bold text-white truncate">{idea.title}</h3>
                            </div>
                            <button 
                              onClick={() => selectIdea(idea)}
                              className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 text-white text-[10px] font-bold rounded uppercase hover:bg-zinc-700 transition-all flex items-center gap-2 flex-shrink-0"
                            >
                              IMPORT <ChevronRight size={14} />
                            </button>
                          </header>

                          <p className="text-zinc-400 text-sm leading-relaxed mb-8">{idea.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div>
                                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Challenges</h4>
                                <ul className="space-y-3">
                                  {idea.challenges.map((c: string, i: number) => (
                                    <li key={i} className="flex gap-2 text-xs text-zinc-400 leading-snug">
                                      <span className="text-indigo-500 flex-shrink-0">→</span> {c}
                                    </li>
                                  ))}
                                </ul>
                             </div>
                             <div>
                                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Research</h4>
                                <div className="space-y-3">
                                  {idea.research.map((r: any, i: number) => (
                                    <div key={i} className="bg-zinc-950 p-3 rounded border border-zinc-800/50">
                                      <div className="text-[11px] font-bold text-white leading-tight mb-1">{r.title}</div>
                                      <div className="text-[9px] text-zinc-600 italic leading-none">{r.relevance}</div>
                                    </div>
                                  ))}
                                </div>
                             </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'workflow' && (
              <motion.div 
                key="workflow"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <WorkflowBuilder />
              </motion.div>
            )}

            {activeTab === 'pitch' && (
              <motion.div 
                key="pitch"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full p-6 lg:p-12 overflow-y-auto"
              >
                <div className="max-w-6xl mx-auto space-y-8 lg:space-y-12">
                   <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
                      <div>
                        <h2 className="text-2xl lg:text-3xl font-bold text-white italic tracking-tight mb-2 uppercase">Project Deck</h2>
                        <p className="text-zinc-500 text-sm">Refine your narrative for judge evaluation.</p>
                      </div>
                      <button 
                        onClick={handleGeneratePitch}
                        disabled={isGeneratingPitch || !project.name}
                        className="w-full md:w-auto px-8 py-3 bg-white text-black font-bold text-sm rounded hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-20"
                      >
                         {isGeneratingPitch ? "SYNTHESIZING..." : "COMPILE FINAL SCRIPT"}
                      </button>
                   </div>

                   <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 pb-20">
                      <div className="lg:col-span-4 space-y-8 order-2 lg:order-1">
                         <div className="bg-zinc-900 border border-zinc-800 p-6 lg:p-8 rounded-xl space-y-6">
                            {[
                              { l: "PROJECT_ID", v: project.name, k: 'name' },
                              { l: "VALUE_SLOGAN", v: project.tagline, k: 'tagline' },
                              { l: "GAP_ANALYSIS", v: project.problem, k: 'problem' },
                              { l: "PROPOSED_TECH", v: project.solution, k: 'solution' }
                            ].map(field => (
                              <div key={field.l}>
                                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-2">{field.l}</label>
                                <textarea 
                                  value={field.v}
                                  onChange={e => setProject({...project, [field.k]: e.target.value})}
                                  className="w-full bg-black border border-zinc-800 rounded p-3 text-xs h-24 focus:border-indigo-500 outline-none resize-none"
                                />
                              </div>
                            ))}
                         </div>
                      </div>

                      <div className="lg:col-span-8 order-1 lg:order-2">
                         <div className="bg-black border-2 border-dashed border-zinc-800 p-6 lg:p-12 rounded-2xl min-h-[400px] lg:min-h-[600px] relative">
                            {generatedPitchText ? (
                              <div className="space-y-6">
                                <header className="pb-6 border-b border-zinc-800 flex justify-between items-center mb-8">
                                   <div className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase">TRANSCRIPT // READY</div>
                                   <button 
                                      onClick={() => setGeneratedPitchText('')}
                                      className="text-zinc-700 hover:text-white transition-colors"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                </header>
                                <div className="prose prose-invert max-w-none text-zinc-300 leading-relaxed font-mono text-[13px] lg:text-sm">
                                  {generatedPitchText.split('\n').map((l, i) => (
                                    <p key={i} className="mb-4">{l}</p>
                                  ))}
                                </div>
                              </div>
                            ) : isGeneratingPitch ? (
                              <div className="space-y-10 animate-pulse">
                                {[1,2,3,4].map(i => (
                                  <div key={i} className="space-y-4">
                                     <div className="h-2 w-1/4 bg-zinc-900 rounded"></div>
                                     <div className="h-4 w-full bg-zinc-900 rounded"></div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="h-full flex flex-col items-center justify-center text-zinc-700 py-20">
                                <FileText size={48} className="mb-4 opacity-10" />
                                <p className="text-sm font-mono uppercase tracking-widest px-4 text-center">Awaiting synthesis command...</p>
                              </div>
                            )}
                         </div>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Experimental Features / Floating Actions - Desktop Only */}
      <footer className="hidden lg:flex absolute bottom-6 right-8 left-88 z-30 pointer-events-none justify-between items-center">
         <div className="flex gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-sm flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-tight">REAL-TIME INFERENCE</span>
            </div>
             <div className="bg-indigo-500/10 border border-indigo-500/30 px-3 py-1.5 rounded-sm flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-tight">MULTI-MODAL VISION</span>
            </div>
         </div>
         <p className="text-[10px] text-zinc-700 font-mono tracking-tighter">© 2026 HACKHERO_SYSTEMS // AISTUDIO_CORE</p>
      </footer>
    </div>

  );
}
