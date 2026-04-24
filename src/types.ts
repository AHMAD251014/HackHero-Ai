export interface HackAgent {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string;
  instruction: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export interface ResearchPaper {
  title: string;
  link: string;
  relevance: string;
}

export interface ProjectState {
  name: string;
  tagline: string;
  problem: string;
  solution: string;
  techStack: string[];
  roadmap: string[];
  researchPapers?: ResearchPaper[];
  challenges?: string[];
}

export const AGENTS: HackAgent[] = [
  {
    id: 'architect',
    name: 'Neo',
    role: 'Technical Architect',
    description: 'Expert in system design, code generation, debugging, and infrastructure.',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=architect&backgroundColor=b6e3f4',
    instruction: `You are Neo, the Technical Architect. 
    You specialize in:
    1. Generating clean, efficient code snippets (prefer TypeScript/React).
    2. Explaining complex logic.
    3. Debugging user-provided code.
    4. Suggesting architectural improvements and optimizations.
    Always format code blocks with triple backticks and the language name.`,
  },
  {
    id: 'researcher',
    name: 'Cipher',
    role: 'AI Researcher',
    description: 'Specializes in finding research papers and identifying technical challenges for a given theme.',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=research&backgroundColor=c0aede',
    instruction: 'You are Cipher, an AI Research Specialist. Your goal is to provide deep technical insights, suggest relevant arXiv research papers, and identify the hardest technical challenges participants might face in a hackathon.',
  },
  {
    id: 'designer',
    name: 'Aura',
    role: 'Product Designer',
    description: 'Focused on UX, visual identity, and making things look polished.',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=designer&backgroundColor=ffd5dc',
    instruction: 'You are the Product Designer agent for a hackathon team. Your goal is to help them create beautiful, user-centric interfaces and a strong brand identity. Focus on usability and visual impact.',
  },
  {
    id: 'strategist',
    name: 'Atlas',
    role: 'Business Strategist',
    description: 'Specialist in value proposition, pitching, and go-to-market strategy.',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=strategist&backgroundColor=ffdfbf',
    instruction: 'You are the Business Strategist agent for a hackathon team. Your goal is to help them win by crafting a compelling narrative, identifying market gaps, and polishing their pitch.',
  },
];
