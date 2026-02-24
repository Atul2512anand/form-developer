
import React from 'react';
import { UserSettings, ProviderID, ProviderConfig, AuthScheme } from '../types';
import { Card, Input, Label, Button } from './ui/Shared';
import { Cpu, ShieldCheck, Thermometer, Info } from 'lucide-react';
import { DEFAULTPROVIDERS, DEFAULTMODELS } from '../constants';

interface SettingsPanelProps {
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSave }) => {
  const [localSettings, setLocalSettings] = React.useState(settings);
  
  // Defensive check for activeProvider
  const activeProvider = localSettings.providers[localSettings.activeProviderId] || DEFAULTPROVIDERS[localSettings.activeProviderId];

  const handleProviderChange = (providerId: ProviderID) => {
    const models = DEFAULTMODELS[providerId] || [];
    const defaultModel = models[0] || '';
    setLocalSettings(prev => ({
      ...prev,
      activeProviderId: providerId,
      model: defaultModel
    }));
  };

  const updateActiveProvider = (updates: Partial<ProviderConfig>) => {
    setLocalSettings(prev => ({
      ...prev,
      providers: {
        ...prev.providers,
        [prev.activeProviderId]: {
          ...prev.providers[prev.activeProviderId],
          ...updates
        }
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localSettings);
    alert('Settings saved! All keys are stored locally in your browser.');
  };

  const currentModels = DEFAULTMODELS[localSettings.activeProviderId] || [];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">AI Designer Settings</h2>
        <p className="text-slate-500">Configure your LLM provider. This app is client-side only; your keys are never stored on a server.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4 border-b pb-4">
            <Cpu className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold">Model Provider</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Active Provider</Label>
              <select
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                value={localSettings.activeProviderId}
                onChange={(e) => handleProviderChange(e.target.value as ProviderID)}
              >
                {Object.entries(localSettings.providers).map(([id, p]) => (
                  <option key={id} value={id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label>API Key</Label>
              <Input
                type="password"
                placeholder="Paste your API key here..."
                value={activeProvider.apiKey || ''}
                onChange={(e) => updateActiveProvider({ apiKey: e.target.value })}
              />
              <p className="text-[10px] text-slate-500">Stored only in your browser's localStorage.</p>
            </div>

            <div className="grid gap-2">
              <Label>Base URL</Label>
              <Input
                placeholder="https://api.openai.com/v1"
                value={activeProvider.baseUrl || ''}
                onChange={(e) => updateActiveProvider({ baseUrl: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label>Auth Scheme</Label>
              <select
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                value={activeProvider.authScheme}
                onChange={(e) => updateActiveProvider({ authScheme: e.target.value as AuthScheme })}
              >
                <option value={AuthScheme.BEARER}>Bearer Token (Authorization: Bearer ...)</option>
                <option value={AuthScheme.X_API_KEY}>X-API-KEY Header</option>
                <option value={AuthScheme.GOOGLE_KEY}>X-GOOG-API-KEY Header (Gemini)</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label>Model Name</Label>
              <div className="flex gap-2">
                <select
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={currentModels.includes(localSettings.model) ? localSettings.model : ''}
                  onChange={(e) => setLocalSettings({ ...localSettings, model: e.target.value })}
                >
                  <option value="">-- Custom Model --</option>
                  {currentModels.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <Input
                  className="flex-1"
                  placeholder="e.g., gpt-4o"
                  value={currentModels.includes(localSettings.model) ? '' : localSettings.model}
                  onChange={(e) => setLocalSettings({ ...localSettings, model: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4" /> Temperature
                </Label>
                <span className="text-xs font-mono">{localSettings.temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                className="w-full accent-indigo-600"
                value={localSettings.temperature}
                onChange={(e) => setLocalSettings({ ...localSettings, temperature: parseFloat(e.target.value) })}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-indigo-50 border-none shadow-none">
          <div className="flex gap-3">
            <ShieldCheck className="w-6 h-6 text-indigo-600 shrink-0" />
            <div className="space-y-1 text-sm text-indigo-900">
              <p className="font-semibold">Privacy & Security</p>
              <p className="opacity-80">This application makes direct requests to your provider's API. Your API keys never leave your browser and are not shared with us.</p>
            </div>
          </div>
        </Card>

        <Button type="submit" size="lg" className="w-full sm:w-auto">Save All Settings</Button>
      </form>
    </div>
  );
};

export default SettingsPanel;
