
import React from 'react';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';
import { Card, Button, Textarea } from './ui/Shared';
import { generateFormSpec } from '../lib/llmClient';
import { UserSettings, FormSchema } from '../types';

interface PromptPanelProps {
  settings: UserSettings;
  onSchemaGenerated: (schema: FormSchema) => void;
}

const PromptPanel: React.FC<PromptPanelProps> = ({ settings, onSchemaGenerated }) => {
  const [prompt, setPrompt] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    const activeProvider = settings.providers[settings.activeProviderId];
    if (!activeProvider.apiKey) {
      setError("Missing API Key. Please go to the Settings tab to configure your provider.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const schema = await generateFormSpec(activeProvider, {
        prompt: prompt,
        model: settings.model,
        temperature: settings.temperature
      });
      onSchemaGenerated(schema);
      setPrompt('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate form. Check your settings.");
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "A contact form with name, email, and preferred contact method.",
    "A guest feedback survey for a boutique hotel stay.",
    "A registration form for a local community yoga workshop.",
    "A 5-question multiple choice quiz on solar system facts."
  ];

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-indigo-50 text-indigo-600 mb-2">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">What form are we building?</h2>
        <p className="text-slate-500 text-lg">Describe it in plain English, and the AI will draft the structure.</p>
      </div>

      <Card className="p-6 shadow-2xl border-slate-200 ring-1 ring-slate-200 overflow-hidden relative">
        <div className="space-y-4">
          <Textarea
            placeholder="e.g., Create a 10-question customer satisfaction survey for a coffee shop, including quality, speed, and ambiance..."
            className="min-h-[160px] text-lg p-4 resize-none border-none focus-visible:ring-0 shadow-none"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
            <div className="text-[10px] text-slate-400 font-mono">
              Provider: {settings.activeProviderId} | Model: {settings.model}
            </div>
            <Button 
              className="w-full sm:w-auto px-8 h-12 text-lg rounded-xl shadow-lg shadow-indigo-200"
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  Generate Draft
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm animate-in fade-in slide-in-from-top-2">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 text-center">Quick Templates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              className="p-4 text-left text-sm rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 transition-all text-slate-600 hover:text-indigo-700 shadow-sm"
              onClick={() => setPrompt(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromptPanel;
