
import React from 'react';
import { FormSchema, FormField, FieldType } from '../types';
import { Card, Input, Label, Button, Textarea } from './ui/Shared';
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown, Save, FileDown, Copy, ExternalLink } from 'lucide-react';
import { FIELD_TYPES } from '../constants';

interface FormEditorProps {
  schema: FormSchema;
  onSave: (schema: FormSchema) => void;
}

const FormEditor: React.FC<FormEditorProps> = ({ schema, onSave }) => {
  const [localSchema, setLocalSchema] = React.useState<FormSchema>(schema);

  React.useEffect(() => {
    setLocalSchema(schema);
  }, [schema]);

  const updateField = (id: string, updates: Partial<FormField>) => {
    const fields = localSchema?.fields ?? [];
    setLocalSchema(prev => ({
      ...prev,
      fields: fields.map(f => f.id === id ? { ...f, ...updates } : f)
    }));
  };

  const addField = () => {
    const fields = localSchema?.fields ?? [];
    const newField: FormField = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Question',
      type: 'short_text',
      required: false
    };
    setLocalSchema(prev => ({ ...prev, fields: [...fields, newField] }));
  };

  const removeField = (id: string) => {
    const fields = localSchema?.fields ?? [];
    setLocalSchema(prev => ({ ...prev, fields: fields.filter(f => f.id !== id) }));
  };

  const moveField = (idx: number, direction: 'up' | 'down') => {
    const fields = [...(localSchema?.fields ?? [])];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= fields.length) return;
    [fields[idx], fields[targetIdx]] = [fields[targetIdx], fields[idx]];
    setLocalSchema({ ...localSchema, fields });
  };

  const handleExportCsv = () => {
    const fields = localSchema?.fields ?? [];
    const headers = ['Question Title', 'Question Type', 'Options', 'Required'];
    const rows = fields.map(f => [
      f.title,
      f.type,
      (f.options || []).join('; '),
      f.required ? 'TRUE' : 'FALSE',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${(localSchema?.title ?? 'form').replace(/\s+/g, '-').toLowerCase()}-questions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyPrompt = () => {
    const fields = localSchema?.fields ?? [];
    const lines = [
      `Create a Google Form titled "${localSchema?.title ?? 'Untitled Form'}".`,
      localSchema?.description ? `Description: ${localSchema.description}` : '',
      '',
      'Fields:'
    ];
    fields.forEach((f, i) => {
      let line = `${i + 1}. ${f.title} – type: ${f.type}`;
      if (f.options?.length) {
        line += `; options: ${f.options.join(', ')}`;
      }
      if (f.required) line += '; required.';
      lines.push(line);
    });
    
    const prompt = lines.join('\n');
    navigator.clipboard.writeText(prompt)
      .then(() => alert('Copied! In Google Forms, click "Help me create a form" (Gemini) and paste this prompt.'))
      .catch(() => alert('Copy failed. Check console for the text.'));
  };

  const fields = localSchema?.fields ?? [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-6 space-y-4 border-l-4 border-l-indigo-600">
          <Input 
            className="text-2xl font-bold border-none px-0 h-auto focus-visible:ring-0" 
            value={localSchema?.title || ''} 
            onChange={(e) => setLocalSchema({ ...localSchema, title: e.target.value })}
            placeholder="Form Title"
          />
          <Textarea 
            className="text-slate-600 border-none px-0 min-h-0 h-auto focus-visible:ring-0" 
            value={localSchema?.description || ''} 
            onChange={(e) => setLocalSchema({ ...localSchema, description: e.target.value })}
            placeholder="Form Description"
          />
        </Card>

        {fields.map((field, idx) => (
          <Card key={field.id} className="p-6 group relative">
            <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="w-4 h-4 text-slate-300" />
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <Label className="text-xs text-slate-400">Question Title</Label>
                  <Input 
                    className="font-medium h-9" 
                    value={field.title} 
                    onChange={(e) => updateField(field.id, { title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">Type</Label>
                  <select 
                    className="h-9 w-40 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm"
                    value={field.type}
                    onChange={(e) => updateField(field.id, { type: e.target.value as FieldType })}
                  >
                    {FIELD_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {(field.type === 'multiple_choice' || field.type === 'checkboxes' || field.type === 'dropdown') && (
                <div className="space-y-2 pl-4 border-l-2 border-slate-100">
                  <Label className="text-xs text-slate-400">Options (Comma separated)</Label>
                  <Input 
                    placeholder="Option 1, Option 2, ..."
                    value={field.options?.join(', ') || ''}
                    onChange={(e) => updateField(field.id, { options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-4 mt-2 border-t">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => moveField(idx, 'up')}
                    disabled={idx === 0}
                    className="text-slate-400 hover:text-slate-600 disabled:opacity-20"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => moveField(idx, 'down')}
                    disabled={idx === fields.length - 1}
                    className="text-slate-400 hover:text-slate-600 disabled:opacity-20"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-500 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={field.required}
                      onChange={(e) => updateField(field.id, { required: e.target.checked })}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Required
                  </label>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => removeField(field.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}

        <Button variant="outline" className="w-full h-12 border-dashed" onClick={addField}>
          <Plus className="w-4 h-4 mr-2" /> Add Field
        </Button>
      </div>

      <div className="space-y-4">
        <Card className="p-6 bg-slate-900 text-white space-y-6 sticky top-24">
          <div className="space-y-1">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Save className="w-5 h-5 text-indigo-400" />
              Actions
            </h3>
            <p className="text-slate-400 text-xs">Save schema to local storage or export for other tools.</p>
          </div>

          <div className="space-y-3">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white" onClick={() => onSave(localSchema)}>
              Save to Browser
            </Button>
            
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Exporters</p>
              
              <Button variant="outline" className="w-full justify-start text-xs border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800" onClick={handleCopyPrompt}>
                <Copy className="w-3 h-3 mr-2" /> Copy Prompt for Google Forms
              </Button>

              <Button variant="outline" className="w-full justify-start text-xs border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800" onClick={handleExportCsv}>
                <FileDown className="w-3 h-3 mr-2" /> Download as CSV
              </Button>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-indigo-950 border border-indigo-900/50 text-[11px] text-indigo-200">
            <div className="flex gap-2 mb-1 font-bold text-indigo-300">
              <ExternalLink className="w-3 h-3" />
              Pro Tip:
            </div>
            Copy the prompt and paste it into Google Forms' "Help me create a form" feature to instantly generate this form in your account.
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FormEditor;
