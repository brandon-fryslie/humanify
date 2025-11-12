// Default context size for showing surrounding code to LLM
// OpenAI's gpt-4o-mini has 128K token context (~512K chars)
// We use 100K chars (~25K tokens) to leave room for prompt/response
export const DEFAULT_CONTEXT_WINDOW_SIZE = 100_000;
