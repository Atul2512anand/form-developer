
import React from 'react';
import Layout from './components/Layout';
import SettingsPanel from './components/SettingsPanel';
import PromptPanel from './components/PromptPanel';
import FormEditor from './components/FormEditor';
import FormRenderer from './components/FormRenderer';
import { UserSettings, FormSchema, ProviderID } from './types';
import { DEFAULT_SCHEMA, DEFAULT_SETTINGS, DEFAULTPROVIDERS } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('prompt');
  
  // Load initial state from localStorage
  const [settings, setSettings] = React.useState<UserSettings>(() => {
    const saved = localStorage.getItem('pf_v2_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with defaults to ensure all providers and fields exist (migration safety)
        const mergedProviders = { ...DEFAULT_SETTINGS.providers };
        if (parsed.providers) {
          Object.keys(parsed.providers).forEach((key) => {
            const pid = key as ProviderID;
            mergedProviders[pid] = {
              ...DEFAULTPROVIDERS[pid],
              ...parsed.providers[pid]
            };
          });
        }
        
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          providers: mergedProviders
        };
      } catch (e) {
        console.error("Settings load failed:", e);
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [schema, setSchema] = React.useState<FormSchema>(() => {
    const saved = localStorage.getItem('pf_schema');
    return saved ? JSON.parse(saved) : DEFAULT_SCHEMA;
  });

  // Persistence effects
  React.useEffect(() => {
    localStorage.setItem('pf_v2_settings', JSON.stringify(settings));
  }, [settings]);

  React.useEffect(() => {
    localStorage.setItem('pf_schema', JSON.stringify(schema));
  }, [schema]);

  const handleSchemaGenerated = (newSchema: FormSchema) => {
    setSchema(newSchema);
    setActiveTab('editor');
  };

  const handleSchemaUpdate = (updatedSchema: FormSchema) => {
    setSchema(updatedSchema);
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="mb-8 p-4 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm shadow-xl flex items-start gap-4">
        <div className="p-2 bg-indigo-600 rounded-lg shrink-0">
          <span className="font-bold">BYOK</span>
        </div>
        <div className="space-y-1">
          <p className="font-semibold">AI Form Designer (Frontend-Only)</p>
          <ol className="list-decimal list-inside opacity-70 text-xs">
            <li>Configure your API Provider and Key in <strong>Settings</strong>.</li>
            <li>Describe your form in <strong>Prompt</strong> tab.</li>
            <li>Refine fields in <strong>Editor</strong> and export for Google Forms.</li>
          </ol>
        </div>
      </div>

      {activeTab === 'prompt' && (
        <PromptPanel 
          settings={settings} 
          onSchemaGenerated={handleSchemaGenerated} 
        />
      )}
      
      {activeTab === 'editor' && (
        <FormEditor 
          schema={schema} 
          onSave={handleSchemaUpdate} 
        />
      )}
      
      {activeTab === 'preview' && (
        <FormRenderer 
          schema={schema} 
        />
      )}
      
      {activeTab === 'settings' && (
        <SettingsPanel 
          settings={settings} 
          onSave={setSettings} 
        />
      )}
    </Layout>
  );
};

export default App;
