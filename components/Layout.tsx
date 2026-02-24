
import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { Settings, Sparkles, Edit3, Eye, FormInput } from 'lucide-react';
import { cn } from './ui/Shared';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="sticky top-0 z-10 w-full border-b bg-white/80 backdrop-blur-md px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <FormInput className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 hidden sm:block">
              PromptForms
            </h1>
          </div>

          <nav className="flex items-center h-full">
            <Tabs.Root value={activeTab} onValueChange={onTabChange} className="h-full">
              <Tabs.List className="flex h-full space-x-1 sm:space-x-4">
                <TabTrigger value="prompt" icon={<Sparkles className="w-4 h-4" />} label="Generate" />
                <TabTrigger value="editor" icon={<Edit3 className="w-4 h-4" />} label="Editor" />
                <TabTrigger value="preview" icon={<Eye className="w-4 h-4" />} label="Preview" />
                <TabTrigger value="settings" icon={<Settings className="w-4 h-4" />} label="Settings" />
              </Tabs.List>
            </Tabs.Root>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-8">
        {children}
      </main>

      <footer className="border-t py-6 text-center text-sm text-slate-500 bg-white">
        &copy; {new Date().getFullYear()} PromptForms. Powered by Gemini.
      </footer>
    </div>
  );
};

const TabTrigger = ({ value, icon, label }: { value: string; icon: React.ReactNode; label: string }) => (
  <Tabs.Trigger
    value={value}
    className={cn(
      "inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium transition-all relative border-b-2 border-transparent",
      "data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 text-slate-500 hover:text-slate-900"
    )}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </Tabs.Trigger>
);

export default Layout;
