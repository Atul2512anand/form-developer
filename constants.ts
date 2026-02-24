
import { ProviderID, AuthScheme, ProviderConfig, FieldType } from './types';

export const DEFAULT_SCHEMA: any = {
  title: "New Form",
  description: "Generate a form using the Prompt tab!",
  fields: []
};

export const DEFAULTPROVIDERS: Record<ProviderID, ProviderConfig> = {
  google: {
    id: 'google',
    name: 'Google Gemini (Direct)',
    // NOTE: Direct browser calls to Gemini REST API usually fail due to CORS.
    // Use OpenRouter with a Gemini model for better browser compatibility.
    baseUrl: 'https://generativelanguage.googleapis.com/v1/models',
    authScheme: AuthScheme.GOOGLE_KEY,
    apiKey: '',
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    authScheme: AuthScheme.BEARER,
    apiKey: '',
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1/messages',
    authScheme: AuthScheme.X_API_KEY,
    apiKey: '',
  },
  groq: {
    id: 'groq',
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1/chat/completions',
    authScheme: AuthScheme.BEARER,
    apiKey: '',
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
    authScheme: AuthScheme.BEARER,
    apiKey: '',
  },
  custom: {
    id: 'custom',
    name: 'Custom Provider',
    baseUrl: '',
    authScheme: AuthScheme.BEARER,
    apiKey: '',
  },
};

export const DEFAULTMODELS: Record<ProviderID, string[]> = {
  google: [
    'gemini-flash-latest',
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
  ],
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
  anthropic: ['claude-3-5-sonnet-latest', 'claude-3-opus-latest'],
  groq: ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile'],
  openrouter: ['google/gemini-2.0-flash-001', 'openai/gpt-4o-mini', 'anthropic/claude-3.5-sonnet'],
  custom: [],
};

export const DEFAULT_SETTINGS = {
  activeProviderId: 'google' as ProviderID,
  providers: DEFAULTPROVIDERS,
  model: 'gemini-flash-latest',
  temperature: 0.7,
};

export const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'short_text', label: 'Short Text' },
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'checkboxes', label: 'Checkboxes' },
  { value: 'dropdown', label: 'Dropdown' },
];

export const SYSTEM_PROMPT = `
You are an expert form designer. Your task is to output ONLY valid JSON matching the FormSchema exactly.

IMPORTANT: The "title" field for each question will be used as the header in a spreadsheet.
- Keep titles SHORT and SIMPLE (e.g., "Full Name", "Email", "Rating", "Comments").
- Avoid long sentences or special characters in titles.
- Titles must be unique.

Schema:
interface FormField {
  id: string;
  title: string;
  description?: string;
  type: 'short_text' | 'paragraph' | 'multiple_choice' | 'checkboxes' | 'dropdown';
  required: boolean;
  options?: string[];
}

interface FormSchema {
  title: string;
  description?: string;
  fields: FormField[];
}

Rules:
1. Provide a unique ID for every field.
2. For multiple_choice, checkboxes, and dropdown, provide a clear 'options' array.
3. Use simple, human-readable titles.
4. Output ONLY valid JSON. No backticks, no markdown, no explanations.
`;
