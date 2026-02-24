import { ProviderConfig, PromptConfig, FormSchema, AuthScheme } from '../types';
import { SYSTEM_PROMPT } from '../constants';

export async function generateFormSpec(
  provider: ProviderConfig,
  config: PromptConfig
): Promise<FormSchema> {
  if (!provider.apiKey) {
    throw new Error(`Please enter your API key for ${provider.name} in Settings.`);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...provider.extraHeaders,
  };

  // Auth Scheme Handling
  if (provider.authScheme === AuthScheme.BEARER) {
    headers['Authorization'] = `Bearer ${provider.apiKey}`;
  } else if (provider.authScheme === AuthScheme.X_API_KEY) {
    headers['x-api-key'] = provider.apiKey;
  } else if (provider.authScheme === AuthScheme.GOOGLE_KEY) {
    headers['x-goog-api-key'] = provider.apiKey;
  }

  let body: any;
  // Clean base URL - trim trailing slashes
  let url = provider.baseUrl.replace(/\/+$/, '');

  // Provider-specific request formatting
  if (provider.id === 'google') {
    // Force v1beta in case it's cached as v1
    url = url.replace('/v1/models', '/v1beta/models');

    url = `${url}/${config.model}:generateContent`;
    body = {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: config.prompt }] }],
      generationConfig: {
        temperature: config.temperature,
        responseMimeType: "application/json",
      },
    };
  } else if (provider.id === 'anthropic') {
    // Anthropic Messages API
    body = {
      model: config.model,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: config.prompt }],
      temperature: config.temperature,
    };
  } else {
    // OpenAI-compatible (OpenAI, OpenRouter, Groq, Custom)
    if (url.endsWith('/v1')) {
      url = `${url}/chat/completions`;
    }

    body = {
      model: config.model,
      temperature: config.temperature,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: config.prompt },
      ],
      response_format: { type: 'json_object' }
    };

    // OpenRouter specific headers
    if (provider.id === 'openrouter') {
      headers['HTTP-Referer'] = window.location.origin;
      headers['X-Title'] = 'PromptForms AI Builder';
    }
  }

  console.log('--- LLM REQUEST ---');
  console.log('URL:', url);
  console.log('Provider:', provider.id);
  console.log('Model:', config.model);
  console.log('Body:', body);

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  } catch (err: any) {
    console.error("Fetch failure:", err);
    throw new Error(`Failed to fetch from ${url}. This might be a network error, invalid URL, or CORS issue. Check the browser console for details.`);
  }

  const text = await res.text();
  console.log('--- LLM RESPONSE RAW ---');
  console.log(text);

  if (!res.ok) {
    let errorMessage = `API Error ${res.status}`;
    try {
      const errorJson = JSON.parse(text);
      errorMessage += `: ${errorJson.error?.message || errorJson.message || text.slice(0, 100)}`;

      // Auto-diagnose 404s for Google by fetching the actual model list
      if (provider.id === 'google' && res.status === 404) {
        try {
          const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${provider.apiKey}`);
          const listData = await listRes.json();
          if (listData.models) {
            const availableModels = listData.models
              .map((m: any) => m.name.replace('models/', ''))
              .filter((name: string) => name.includes('flash') || name.includes('pro'))
              .join(', ');
            errorMessage += `\n\nDIAGNOSTIC - Your API key supports these models: ${availableModels}. Please change your Settings to use one of these exact names!`;
          }
        } catch (e) {
          console.error("Failed to fetch diagnostic model list", e);
        }
      }
    } catch {
      errorMessage += `: ${text.slice(0, 200)}`;
    }
    throw new Error(errorMessage);
  }

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Expected JSON response but got raw text: ${text.slice(0, 200)}`);
  }

  let content = '';

  // Response Format Parsing
  if (data.choices?.[0]?.message?.content) {
    // OpenAI / Groq / OpenRouter
    content = data.choices[0].message.content;
  } else if (data.content?.[0]?.text) {
    // Anthropic
    content = data.content[0].text;
  } else if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
    // Gemini
    content = data.candidates[0].content.parts[0].text;
  }

  if (!content) {
    throw new Error('The API returned a successful response but no text content was found. Check your model selection.');
  }

  try {
    const jsonStr = content.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
    const parsed = JSON.parse(jsonStr);

    // Handle both a single object and an array of objects
    const spec = Array.isArray(parsed) ? parsed[0] : parsed;

    if (!spec || !spec.fields) {
      throw new Error('Parsed schema is missing fields. Check the model output.');
    }

    return spec as FormSchema;
  } catch (e) {
    console.error("Failed to parse LLM response:", content);
    throw new Error('The AI response was not valid FormSchema JSON. Please try again with a more specific prompt.');
  }
}