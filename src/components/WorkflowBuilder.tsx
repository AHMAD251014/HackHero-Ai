import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Plus, Trash2, Cpu, Database, Filter, MessageSquare, ChevronRight, Zap } from 'lucide-react';

interface Node {
  id: string;
  type: 'trigger' | 'ai' | 'code' | 'filter' | 'output';
  label: string;
  config: string;
}

export default function WorkflowBuilder() {
  const [nodes, setNodes] = useState<Node[]>([
    { id: '1', type: 'trigger', label: 'User Query', config: 'Accepts natural language input' },
    { id: '2', type: 'ai', label: 'Gemini 3 Pro', config: 'Analyze intent and extract entities' },
    { id: '3', type: 'output', label: 'Final Response', config: 'Format as markdown' }
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const addNode = (type: Node['type']) => {
    const labels = {
      trigger: 'New Trigger',
      ai: 'Intelligence Block',
      code: 'Logic Engine',
      filter: 'Data Guard',
      output: 'Result Portal'
    };
    const newNode: Node = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      label: labels[type],
      config: 'Configure block properties...'
    };
    setNodes([...nodes, newNode]);
  };

  const removeNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id));
  };

  const runWorkflow = () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 3000);
  };

  return (
    <div className="h-full flex flex-col p-4 lg:p-8 bg-[#0a0a0a] overflow-y-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-white italic">LOGIC ARCHITECT</h2>
          <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest mt-1">Design Multi-Modal Workflows</p>
        </div>
        <button 
          onClick={runWorkflow}
          disabled={isRunning}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-indigo-500 text-white rounded font-bold text-sm hover:bg-indigo-400 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(99,102,241,0.2)]"
        >
          {isRunning ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Zap size={16} /></motion.div>
          ) : <Play size={16} fill="currentColor" />}
          {isRunning ? 'EXECUTING...' : 'EXECUTE WORKFLOW'}
        </button>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-8">
        {/* Toolbox */}
        <aside className="w-full lg:w-64 space-y-4">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">Library Elements</div>
          <div className="flex lg:grid lg:grid-cols-1 gap-3 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 no-scrollbar">
            {[
              { type: 'trigger', icon: MessageSquare, label: 'Trigger', color: 'text-amber-400' },
              { type: 'ai', icon: Cpu, label: 'Gemini', color: 'text-indigo-400' },
              { type: 'code', icon: Database, label: 'Compute', color: 'text-emerald-400' },
              { type: 'filter', icon: Filter, label: 'Logic', color: 'text-rose-400' },
              { type: 'output', icon: ChevronRight, label: 'Output', color: 'text-sky-400' }
            ].map(tool => (
              <button 
                key={tool.type}
                onClick={() => addNode(tool.type as any)}
                className="flex-shrink-0 lg:w-full flex items-center gap-3 p-3 lg:p-4 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-600 transition-all group min-w-[140px] lg:min-w-0"
              >
                <tool.icon size={18} className={tool.color} />
                <span className="text-xs lg:text-sm font-medium">{tool.label}</span>
                <Plus size={14} className="ml-auto opacity-0 lg:group-hover:opacity-100 text-zinc-500" />
              </button>
            ))}
          </div>
        </aside>

        {/* Canvas */}
        <div className="flex-1 bg-zinc-900/30 border-2 border-dashed border-zinc-800 rounded-2xl relative overflow-hidden flex flex-col items-center py-10 lg:py-12 gap-6 overflow-y-auto min-h-[400px]">
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600 p-8 text-center">
              <Plus size={40} className="mb-4 opacity-20" />
              <p className="text-sm">Design your project logic by adding blocks from the toolbox.</p>
            </div>
          )}

          <AnimatePresence>
            {nodes.map((node, index) => (
              <motion.div 
                key={node.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative group w-full max-w-[320px] px-4 sm:px-0"
              >
                {index > 0 && (
                  <div className="absolute top-[-24px] left-1/2 -translate-x-1/2 h-6 border-l border-zinc-700 border-dashed" />
                )}
                
                <div className={`p-4 lg:p-5 rounded-xl border ${isRunning ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'border-zinc-800'} bg-zinc-900 transition-all duration-500`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded bg-zinc-950 ${
                        node.type === 'trigger' ? 'text-amber-400' :
                        node.type === 'ai' ? 'text-indigo-400' :
                        node.type === 'code' ? 'text-emerald-400' :
                        node.type === 'filter' ? 'text-rose-400' : 'text-sky-400'
                      }`}>
                        {node.type === 'trigger' ? <MessageSquare size={16} /> :
                         node.type === 'ai' ? <Cpu size={16} /> :
                         node.type === 'code' ? <Database size={16} /> :
                         node.type === 'filter' ? <Filter size={16} /> : <ChevronRight size={16} />}
                      </div>
                      <h4 className="font-bold text-xs lg:text-sm text-white uppercase tracking-tight">{node.label}</h4>
                    </div>
                    <button 
                      onClick={() => removeNode(node.id)}
                      className="p-1 hover:text-rose-500 text-zinc-600 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 bg-black/40 p-2 rounded border border-zinc-800/50 break-words">
                    CONFIG: {node.config}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
