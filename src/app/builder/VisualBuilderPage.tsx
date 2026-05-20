import React, { useState, useRef, useCallback } from 'react';
import {
  Layout, Box, Type, Image, Video, Gallery, Button, Square, Columns, Minus, Divide,
  List, Heading, FileText, Play, ImageIcon, MousePointerClick, ChevronDown, ChevronRight,
  Accordion as AccordionIcon, Tabs as TabsIcon, HelpCircle, Star, CreditCard, FormInput,
  Sparkles, Save, Eye, Undo2, Redo2, Search, Settings, Monitor, Tablet, Smartphone,
  User, Plus, Copy, Trash2, GripVertical, X, MoreVertical, ChevronUp, Palette, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ========== TYPE DEFINITIONS ==========
type BlockType = 
  | 'section' | 'container' | 'columns' | 'spacer' | 'divider'
  | 'heading' | 'paragraph' | 'richtext' | 'list'
  | 'image' | 'video' | 'gallery'
  | 'button' | 'iconbutton'
  | 'accordion' | 'tabs' | 'faq' | 'testimonials' | 'pricing' | 'form'
  | 'hero' | 'features' | 'cta' | 'footer';

interface BlockData {
  id: string;
  type: BlockType;
  content?: any;
  style?: React.CSSProperties;
  children?: BlockData[];
  props?: Record<string, any>;
}

interface BlockTemplate {
  type: BlockType;
  label: string;
  icon: React.ReactNode;
  category: string;
  defaultContent?: any;
  defaultProps?: Record<string, any>;
}

type ViewportMode = 'desktop' | 'tablet' | 'mobile';

// ========== BLOCK LIBRARY ==========
const blockLibrary: BlockTemplate[] = [
  // Basic
  { type: 'section', label: 'Section', icon: <Layout size={18} />, category: 'Basic' },
  { type: 'container', label: 'Container', icon: <Box size={18} />, category: 'Basic' },
  { type: 'columns', label: 'Columns', icon: <Columns size={18} />, category: 'Basic' },
  { type: 'spacer', label: 'Spacer', icon: <Minus size={18} />, category: 'Basic' },
  { type: 'divider', label: 'Divider', icon: <Divide size={18} />, category: 'Basic' },
  
  // Typography
  { type: 'heading', label: 'Heading', icon: <Heading size={18} />, category: 'Typography', defaultContent: 'Heading Text' },
  { type: 'paragraph', label: 'Paragraph', icon: <Type size={18} />, category: 'Typography', defaultContent: 'Paragraph text goes here.' },
  { type: 'richtext', label: 'Rich Text', icon: <FileText size={18} />, category: 'Typography' },
  { type: 'list', label: 'List', icon: <List size={18} />, category: 'Typography' },
  
  // Media
  { type: 'image', label: 'Image', icon: <ImageIcon size={18} />, category: 'Media' },
  { type: 'video', label: 'Video', icon: <Play size={18} />, category: 'Media' },
  { type: 'gallery', label: 'Gallery', icon: <Gallery size={18} />, category: 'Media' },
  
  // Buttons
  { type: 'button', label: 'Button', icon: <MousePointerClick size={18} />, category: 'Buttons', defaultContent: 'Click Me' },
  { type: 'iconbutton', label: 'Icon Button', icon: <Square size={18} />, category: 'Buttons' },
  
  // Advanced
  { type: 'accordion', label: 'Accordion', icon: <AccordionIcon size={18} />, category: 'Advanced' },
  { type: 'tabs', label: 'Tabs', icon: <TabsIcon size={18} />, category: 'Advanced' },
  { type: 'faq', label: 'FAQ', icon: <HelpCircle size={18} />, category: 'Advanced' },
  { type: 'testimonials', label: 'Testimonials', icon: <Star size={18} />, category: 'Advanced' },
  { type: 'pricing', label: 'Pricing Cards', icon: <CreditCard size={18} />, category: 'Advanced' },
  { type: 'form', label: 'Forms', icon: <FormInput size={18} />, category: 'Advanced' },
  
  // Layout
  { type: 'hero', label: 'Hero Section', icon: <Sparkles size={18} />, category: 'Layout' },
  { type: 'features', label: 'Features Section', icon: <Layout size={18} />, category: 'Layout' },
  { type: 'cta', label: 'CTA Section', icon: <MousePointerClick size={18} />, category: 'Layout' },
  { type: 'footer', label: 'Footer Section', icon: <Box size={18} />, category: 'Layout' },
];

// ========== UTILITY FUNCTIONS ==========
const generateId = () => `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const createBlock = (template: BlockTemplate): BlockData => ({
  id: generateId(),
  type: template.type,
  content: template.defaultContent,
  props: template.defaultProps || {},
  children: [],
  style: {},
});

// ========== MAIN COMPONENT ==========
export const VisualBuilderPage = () => {
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState<BlockData[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [settingsTab, setSettingsTab] = useState<'content' | 'style' | 'layout' | 'advanced'>('content');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Basic', 'Typography', 'Layout']));
  const [isDragging, setIsDragging] = useState(false);
  const [draggedBlock, setDraggedBlock] = useState<BlockTemplate | null>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  // Get selected block
  const selectedBlock = selectedBlockId 
    ? findBlockById(blocks, selectedBlockId)
    : null;

  function findBlockById(blockList: BlockData[], id: string): BlockData | null {
    for (const block of blockList) {
      if (block.id === id) return block;
      if (block.children) {
        const found = findBlockById(block.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  // Handle drag start
  const handleDragStart = useCallback((template: BlockTemplate, e: React.DragEvent) => {
    setDraggedBlock(template);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDraggedBlock(null);
  }, []);

  // Add block
  const addBlock = useCallback((template: BlockTemplate) => {
    const newBlock = createBlock(template);
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    setSelectedBlockId(newBlock.id);
    
    // Update history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newBlocks);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [blocks, history, historyIndex]);

  // Delete block
  const deleteBlock = useCallback((id: string) => {
    const removeBlock = (blockList: BlockData[]): BlockData[] => {
      return blockList
        .filter(block => block.id !== id)
        .map(block => ({
          ...block,
          children: block.children ? removeBlock(block.children) : []
        }));
    };
    
    const newBlocks = removeBlock(blocks);
    setBlocks(newBlocks);
    setSelectedBlockId(null);
    
    // Update history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newBlocks);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [blocks, history, historyIndex]);

  // Duplicate block
  const duplicateBlock = useCallback((id: string) => {
    const block = findBlockById(blocks, id);
    if (!block) return;
    
    const duplicate = JSON.parse(JSON.stringify(block));
    duplicate.id = generateId();
    
    const newBlocks = [...blocks, duplicate];
    setBlocks(newBlocks);
    
    // Update history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newBlocks);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [blocks, history, historyIndex]);

  // Undo/Redo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setBlocks(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setBlocks(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  // Filter blocks by search
  const filteredBlocks = blockLibrary.filter(block =>
    block.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group blocks by category
  const groupedBlocks = filteredBlocks.reduce((acc, block) => {
    if (!acc[block.category]) {
      acc[block.category] = [];
    }
    acc[block.category].push(block);
    return acc;
  }, {} as Record<string, BlockTemplate[]>);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Viewport dimensions
  const viewportDimensions = {
    desktop: { width: '100%', maxWidth: 'none' },
    tablet: { width: '768px', maxWidth: '768px' },
    mobile: { width: '375px', maxWidth: '375px' },
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-background font-['Inter'] overflow-hidden">
      {/* TOP TOOLBAR */}
      <header className="sticky top-0 z-50 h-16 border-b border-border bg-card/95 backdrop-blur-md flex items-center justify-between px-4 gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Layout className="text-white" size={18} />
            </div>
            <span className="font-semibold font-['Manrope'] text-base">PageBuilder</span>
          </div>
          
          <div className="h-6 w-px bg-border" />
          
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Home / Pages</span>
            <span className="text-sm font-medium">Landing Page</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          <div className="flex items-center gap-1 mr-2">
            <button
              onClick={undo}
              disabled={historyIndex === 0}
              className="p-2 hover:bg-accent rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Undo"
            >
              <Undo2 size={18} />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex === history.length - 1}
              className="p-2 hover:bg-accent rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Redo"
            >
              <Redo2 size={18} />
            </button>
          </div>

          <div className="h-6 w-px bg-border" />

          {/* Responsive Switcher */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewport('desktop')}
              className={`p-2 rounded-md transition-all ${
                viewport === 'desktop' ? 'bg-card shadow-sm' : 'hover:bg-accent/50'
              }`}
              title="Desktop"
            >
              <Monitor size={16} />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`p-2 rounded-md transition-all ${
                viewport === 'tablet' ? 'bg-card shadow-sm' : 'hover:bg-accent/50'
              }`}
              title="Tablet"
            >
              <Tablet size={16} />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`p-2 rounded-md transition-all ${
                viewport === 'mobile' ? 'bg-card shadow-sm' : 'hover:bg-accent/50'
              }`}
              title="Mobile"
            >
              <Smartphone size={16} />
            </button>
          </div>

          <div className="h-6 w-px bg-border" />

          {/* Action Buttons */}
          <button className="px-4 py-2 text-sm font-medium hover:bg-accent rounded-lg transition-colors flex items-center gap-2">
            <Save size={16} />
            Save Draft
          </button>
          <button className="px-4 py-2 text-sm font-medium hover:bg-accent rounded-lg transition-colors flex items-center gap-2">
            <Eye size={16} />
            Preview
          </button>
          <button className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors shadow-sm">
            Publish
          </button>

          <div className="h-6 w-px bg-border ml-2" />

          {/* User Profile */}
          <button className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
            <User size={16} />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR - BLOCKS PANEL */}
        <aside className="w-72 border-r border-border bg-card flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Search blocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-accent/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {Object.entries(groupedBlocks).map(([category, categoryBlocks]) => (
              <div key={category} className="space-y-1">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide"
                >
                  {expandedCategories.has(category) ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                  {category}
                </button>

                <AnimatePresence>
                  {expandedCategories.has(category) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-1 overflow-hidden"
                    >
                      {categoryBlocks.map((block) => (
                        <motion.div
                          key={block.type}
                          draggable
                          onDragStart={(e) => handleDragStart(block, e as any)}
                          onDragEnd={handleDragEnd}
                          onClick={() => addBlock(block)}
                          className="group flex items-center gap-3 px-3 py-2.5 bg-card hover:bg-accent border border-border rounded-lg cursor-grab active:cursor-grabbing transition-all hover:shadow-sm"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="text-muted-foreground group-hover:text-primary transition-colors">
                            {block.icon}
                          </div>
                          <span className="text-sm font-medium flex-1">{block.label}</span>
                          <GripVertical size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </aside>

        {/* CENTER CANVAS */}
        <main className="flex-1 overflow-auto bg-background p-8">
          <div className="flex justify-center">
            <motion.div
              className="bg-white rounded-lg shadow-xl transition-all duration-300 min-h-[600px]"
              style={{
                width: viewportDimensions[viewport].width,
                maxWidth: viewportDimensions[viewport].maxWidth,
              }}
              layout
            >
              {blocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 px-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
                    <Layout size={32} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Start Building Your Page</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md">
                    Drag and drop blocks from the left panel or click on them to add to your page.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => addBlock(blockLibrary.find(b => b.type === 'hero')!)}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      Add Hero Section
                    </button>
                    <button
                      onClick={() => addBlock(blockLibrary.find(b => b.type === 'section')!)}
                      className="px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-accent/80 transition-colors"
                    >
                      Add Section
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  {blocks.map((block, index) => (
                    <React.Fragment key={block.id}>
                      <BlockRenderer
                        block={block}
                        isSelected={selectedBlockId === block.id}
                        isHovered={hoveredBlockId === block.id}
                        onSelect={setSelectedBlockId}
                        onHover={setHoveredBlockId}
                        onDelete={deleteBlock}
                        onDuplicate={duplicateBlock}
                      />
                      
                      {/* Add Block Button */}
                      <motion.div
                        className="flex justify-center py-1 opacity-0 hover:opacity-100 transition-opacity"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                      >
                        <button
                          onClick={() => addBlock(blockLibrary[0])}
                          className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 border-2 border-primary border-dashed flex items-center justify-center transition-all group"
                        >
                          <Plus size={16} className="text-primary" />
                        </button>
                      </motion.div>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </main>

        {/* RIGHT SETTINGS PANEL */}
        <aside className="w-80 border-l border-border bg-card flex flex-col overflow-hidden">
          {selectedBlock ? (
            <>
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">Block Settings</h3>
                  <button
                    onClick={() => setSelectedBlockId(null)}
                    className="p-1 hover:bg-accent rounded transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Settings size={14} />
                  <span className="capitalize">{selectedBlock.type}</span>
                </div>
              </div>

              {/* Settings Tabs */}
              <div className="border-b border-border">
                <div className="flex">
                  {(['content', 'style', 'layout', 'advanced'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSettingsTab(tab)}
                      className={`flex-1 px-4 py-3 text-xs font-medium uppercase tracking-wide transition-colors border-b-2 ${
                        settingsTab === tab
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Settings Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {settingsTab === 'content' && <ContentSettings block={selectedBlock} />}
                {settingsTab === 'style' && <StyleSettings block={selectedBlock} />}
                {settingsTab === 'layout' && <LayoutSettings block={selectedBlock} />}
                {settingsTab === 'advanced' && <AdvancedSettings block={selectedBlock} />}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mb-3">
                <Layers size={24} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-medium mb-1">No Block Selected</p>
              <p className="text-xs text-muted-foreground">
                Select a block from the canvas to edit its settings
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

// ========== BLOCK RENDERER ==========
interface BlockRendererProps {
  block: BlockData;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

function BlockRenderer({ block, isSelected, isHovered, onSelect, onHover, onDelete, onDuplicate }: BlockRendererProps) {
  const [showActions, setShowActions] = useState(false);

  const renderBlockContent = () => {
    switch (block.type) {
      case 'heading':
        return <h2 className="text-3xl font-bold text-foreground">{block.content || 'Heading'}</h2>;
      
      case 'paragraph':
        return <p className="text-base text-muted-foreground">{block.content || 'Paragraph text goes here.'}</p>;
      
      case 'button':
        return (
          <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
            {block.content || 'Button'}
          </button>
        );
      
      case 'image':
        return (
          <div className="w-full h-48 bg-accent rounded-lg flex items-center justify-center">
            <ImageIcon size={48} className="text-muted-foreground" />
          </div>
        );
      
      case 'hero':
        return (
          <div className="py-20 px-8 text-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Hero Section
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Create stunning hero sections with beautiful gradients and typography.
            </p>
            <div className="flex gap-3 justify-center">
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium">
                Get Started
              </button>
              <button className="px-6 py-3 bg-card text-foreground border border-border rounded-lg font-medium">
                Learn More
              </button>
            </div>
          </div>
        );
      
      case 'features':
        return (
          <div className="py-12 px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 bg-card border border-border rounded-lg">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Sparkles className="text-primary" size={24} />
                  </div>
                  <h3 className="font-semibold mb-2">Feature {i}</h3>
                  <p className="text-sm text-muted-foreground">Feature description goes here.</p>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'section':
      case 'container':
        return (
          <div className="min-h-[100px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Layout size={32} className="mx-auto mb-2 opacity-40" />
              <span className="text-sm capitalize">{block.type}</span>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="p-8 text-center text-muted-foreground">
            <span className="capitalize">{block.type}</span>
          </div>
        );
    }
  };

  return (
    <motion.div
      className={`relative rounded-lg transition-all ${
        isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
      } ${isHovered && !isSelected ? 'ring-1 ring-primary/50' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(block.id);
      }}
      onMouseEnter={() => onHover(block.id)}
      onMouseLeave={() => onHover(null)}
      layout
    >
      {renderBlockContent()}

      {/* Floating Actions */}
      <AnimatePresence>
        {(isSelected || isHovered) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-card border border-border rounded-lg shadow-lg px-2 py-1"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(block.id);
              }}
              className="p-1.5 hover:bg-accent rounded transition-colors"
              title="Duplicate"
            >
              <Copy size={14} />
            </button>
            <div className="w-px h-4 bg-border" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(block.id);
              }}
              className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded transition-colors"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ========== SETTINGS PANELS ==========
function ContentSettings({ block }: { block: BlockData }) {
  return (
    <div className="space-y-4">
      <SettingsSection title="Text Content">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Content</label>
          <textarea
            className="w-full px-3 py-2 bg-accent/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none"
            rows={3}
            placeholder="Enter content..."
            defaultValue={block.content}
          />
        </div>
      </SettingsSection>

      <SettingsSection title="Link">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">URL</label>
          <input
            type="text"
            className="w-full px-3 py-2 bg-accent/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
            placeholder="https://example.com"
          />
        </div>
      </SettingsSection>
    </div>
  );
}

function StyleSettings({ block }: { block: BlockData }) {
  return (
    <div className="space-y-4">
      <SettingsSection title="Typography">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-2">Font Size</label>
            <input
              type="range"
              min="12"
              max="72"
              defaultValue="16"
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-2">Font Weight</label>
            <select className="w-full px-3 py-2 bg-accent/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/20">
              <option>Regular</option>
              <option>Medium</option>
              <option>Semibold</option>
              <option>Bold</option>
            </select>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Colors">
        <div className="space-y-3">
          <ColorInput label="Text Color" defaultValue="#000000" />
          <ColorInput label="Background" defaultValue="#ffffff" />
        </div>
      </SettingsSection>

      <SettingsSection title="Borders & Shadows">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-2">Border Radius</label>
            <input
              type="range"
              min="0"
              max="24"
              defaultValue="8"
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-2">Shadow</label>
            <select className="w-full px-3 py-2 bg-accent/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/20">
              <option>None</option>
              <option>Small</option>
              <option>Medium</option>
              <option>Large</option>
            </select>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}

function LayoutSettings({ block }: { block: BlockData }) {
  return (
    <div className="space-y-4">
      <SettingsSection title="Dimensions">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-2">Width</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-accent/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
              placeholder="auto"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-2">Height</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-accent/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
              placeholder="auto"
            />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Spacing">
        <div className="space-y-3">
          <SpacingControl label="Margin" />
          <SpacingControl label="Padding" />
        </div>
      </SettingsSection>

      <SettingsSection title="Alignment">
        <div className="grid grid-cols-3 gap-2">
          {['Left', 'Center', 'Right'].map((align) => (
            <button
              key={align}
              className="px-3 py-2 bg-accent hover:bg-accent/80 border border-border rounded-lg text-xs font-medium transition-colors"
            >
              {align}
            </button>
          ))}
        </div>
      </SettingsSection>
    </div>
  );
}

function AdvancedSettings({ block }: { block: BlockData }) {
  return (
    <div className="space-y-4">
      <SettingsSection title="Animations">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Animation Type</label>
          <select className="w-full px-3 py-2 bg-accent/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/20">
            <option>None</option>
            <option>Fade In</option>
            <option>Slide Up</option>
            <option>Slide Down</option>
            <option>Scale In</option>
          </select>
        </div>
      </SettingsSection>

      <SettingsSection title="Visibility">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded" defaultChecked />
            <span>Visible on Desktop</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded" defaultChecked />
            <span>Visible on Tablet</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded" defaultChecked />
            <span>Visible on Mobile</span>
          </label>
        </div>
      </SettingsSection>

      <SettingsSection title="Custom CSS">
        <textarea
          className="w-full px-3 py-2 bg-accent/50 border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none"
          rows={4}
          placeholder=".custom-class { }"
        />
      </SettingsSection>
    </div>
  );
}

// ========== HELPER COMPONENTS ==========
interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

function SettingsSection({ title, children, defaultExpanded = true }: SettingsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-accent/30 hover:bg-accent/50 flex items-center justify-between transition-colors"
      >
        <span className="text-sm font-medium">{title}</span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronUp size={16} />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ColorInput({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground block mb-2">{label}</label>
      <div className="flex gap-2">
        <input
          type="color"
          defaultValue={defaultValue}
          className="w-12 h-9 rounded border border-border cursor-pointer"
        />
        <input
          type="text"
          defaultValue={defaultValue}
          className="flex-1 px-3 py-2 bg-accent/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
        />
      </div>
    </div>
  );
}

function SpacingControl({ label }: { label: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground block mb-2">{label}</label>
      <div className="grid grid-cols-4 gap-2">
        {['Top', 'Right', 'Bottom', 'Left'].map((side) => (
          <input
            key={side}
            type="text"
            placeholder="0"
            className="px-2 py-1.5 bg-accent/50 border border-border rounded text-xs text-center focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        ))}
      </div>
    </div>
  );
}

