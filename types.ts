
export type ProviderID = 'google' | 'openai' | 'anthropic' | 'groq' | 'openrouter' | 'custom';

export enum AuthScheme {
  BEARER = 'bearer',
  X_API_KEY = 'x-api-key',
  GOOGLE_KEY = 'google-key',
}

export interface ProviderConfig {
  id: ProviderID;
  name: string;
  baseUrl: string;
  apiKey: string;
  authScheme: AuthScheme;
  extraHeaders?: Record<string, string>;
}

export interface PromptConfig {
  prompt: string;
  model: string;
  temperature: number;
}

export type FieldType = 'short_text' | 'paragraph' | 'multiple_choice' | 'checkboxes' | 'dropdown';

export interface FormField {
  id: string;
  title: string;
  description?: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface FormSchema {
  title: string;
  description?: string;
  fields: FormField[];
}

export interface UserSettings {
  activeProviderId: ProviderID;
  providers: Record<ProviderID, ProviderConfig>;
  model: string;
  temperature: number;
}

export interface AppState {
  settings: UserSettings;
  schema: FormSchema;
}
