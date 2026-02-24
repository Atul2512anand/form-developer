
import React from 'react';
import { FormSchema } from '../types';
import { Card, Button, Input, Textarea, Label } from './ui/Shared';
import { Info, Send, Eraser } from 'lucide-react';

interface FormRendererProps {
  schema: FormSchema;
}

const FormRenderer: React.FC<FormRendererProps> = ({ schema }) => {
  const [formData, setFormData] = React.useState<Record<string, any>>({});
  const [success, setSuccess] = React.useState(false);

  const handleChange = (id: string, value: any) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Preview form data:', formData);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-100 text-indigo-600 mx-auto">
          <Info className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-slate-900">Preview Success</h2>
          <p className="text-slate-500">This is a preview-only view. In a live form, this data would be submitted to your collection endpoint.</p>
        </div>
        <Button variant="outline" onClick={() => { setSuccess(false); setFormData({}); }}>
          Reset Preview
        </Button>
      </div>
    );
  }

  const fields = schema?.fields ?? [];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Card className="p-4 bg-amber-50 border-amber-200 text-amber-800 text-sm flex items-center gap-3">
        <Info className="w-5 h-5 shrink-0" />
        <p><strong>Note:</strong> This is a live preview of your designed form. Submissions are only logged to the browser console.</p>
      </Card>

      <Card className="p-8 border-t-8 border-t-indigo-600 shadow-xl">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">{schema?.title || "Untitled Form"}</h1>
          <p className="text-slate-600 text-lg whitespace-pre-wrap">{schema?.description || ""}</p>
          <div className="pt-4 border-t text-sm text-red-500">* Indicates required field</div>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.length === 0 && (
          <Card className="p-12 text-center text-slate-400 italic">
            No fields defined. Start by generating or adding fields in the Editor.
          </Card>
        )}
        
        {fields.map(field => (
          <Card key={field.id} className="p-8 hover:ring-1 hover:ring-indigo-100 transition-all">
            <div className="space-y-4">
              <Label className="text-lg font-semibold flex items-start gap-1">
                {field.title}
                {field.required && <span className="text-red-500">*</span>}
              </Label>
              
              {field.description && (
                <p className="text-sm text-slate-500">{field.description}</p>
              )}
              
              <div className="mt-2">
                {field.type === 'paragraph' ? (
                  <Textarea 
                    required={field.required}
                    placeholder={field.placeholder}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                  />
                ) : (field.type === 'dropdown') ? (
                  <select 
                    required={field.required}
                    className="flex h-12 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-base ring-offset-white focus:ring-2 focus:ring-indigo-400"
                    value={formData[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                  >
                    <option value="">Select an option</option>
                    {field.options?.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (field.type === 'multiple_choice') ? (
                  <div className="space-y-3">
                    {field.options?.map(opt => (
                      <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="radio" 
                          name={field.id}
                          required={field.required}
                          value={opt}
                          checked={formData[field.id] === opt}
                          onChange={(e) => handleChange(field.id, e.target.value)}
                          className="w-5 h-5 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-slate-700 group-hover:text-indigo-600 transition-colors">{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : (field.type === 'checkboxes') ? (
                  <div className="space-y-3">
                    {field.options?.map(opt => (
                      <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          value={opt}
                          checked={(formData[field.id] || []).includes(opt)}
                          onChange={(e) => {
                            const current = formData[field.id] || [];
                            const next = e.target.checked 
                              ? [...current, opt] 
                              : current.filter((c: string) => c !== opt);
                            handleChange(field.id, next);
                          }}
                          className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-slate-700 group-hover:text-indigo-600 transition-colors">{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <Input 
                    type="text"
                    required={field.required}
                    placeholder={field.placeholder}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className="h-12 text-base"
                  />
                )}
              </div>
            </div>
          </Card>
        ))}

        <div className="flex justify-between items-center pt-8">
          <Button variant="ghost" type="button" onClick={() => setFormData({})}>
            <Eraser className="w-4 h-4 mr-2" /> Clear Form
          </Button>
          <Button size="lg" className="px-10 h-14 text-lg rounded-xl shadow-xl shadow-indigo-100" disabled={fields.length === 0}>
            <Send className="w-5 h-5 mr-2" />
            Submit (Preview Only)
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FormRenderer;
