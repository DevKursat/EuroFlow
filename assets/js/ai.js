class AIManager {
    constructor() {
        this.apiKey = localStorage.getItem('geminiApiKey') || '';
        this.primaryModel = 'gemini-2.0-flash';
        this.fallbackModel = 'gemini-1.5-flash-latest';
        this.currentModel = this.primaryModel;
        this.bindEvents();
        this.initApiKeyInput();
    }

    initApiKeyInput() {
        const apiKeyInput = document.getElementById('apiKeyInput');
        if (apiKeyInput) {
            apiKeyInput.value = this.apiKey;
            apiKeyInput.addEventListener('input', (e) => {
                this.apiKey = e.target.value.trim();
                localStorage.setItem('geminiApiKey', this.apiKey);
            });
        }
    }

    updateBadge() {
        const badge = document.getElementById('ai-model-badge');
        if (badge) {
            badge.innerText = `Active Model: ${this.currentModel}`;
            if (this.currentModel === this.fallbackModel) {
                badge.style.background = 'rgba(10, 132, 255, 0.2)'; // Blueish for fallback
                badge.style.borderColor = 'var(--accent-blue)';
                badge.style.color = '#8ab4f8';
            }
        }
    }

    async generateLetter(promptText) {
        if (!this.apiKey) {
            throw new Error("API Key is missing. Please enter your Gemini API key.");
        }
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.currentModel}:generateContent?key=${this.apiKey}`;

        const payload = {
            contents: [{
                parts: [{
                    text: `You are an expert, sincere, and human-centric career counselor. Write a highly professional, yet warm and authentic European Solidarity Corps (ESC) Motivation Letter for Kürşat Yılmaz.
                    He is from Istanbul, born August 1, 2005 (19 years old). He has been coding since he was 9.
                    His true motivation is to use his digital skills to help people, break out of his shell, travel, and experience new cultures, since financial limitations in his home country have made this difficult.
                    Target project context: "${promptText}".
                    Please provide:
                    1. A sincere, compelling, and non-robotic 3-4 paragraph motivation letter tailored to the project.
                    2. A step-by-step actionable checklist for Kürşat to improve his chances for this specific project.
                    Output cleanly in HTML format. Use <h3> for headings, <p> for paragraphs, and <ul>/<li> for the actionable steps. Do NOT use markdown code blocks.`
                }]
            }],
            generationConfig: {
                temperature: 0.7,
            }
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.status === 429 && this.currentModel === this.primaryModel) {
                // Quota exceeded on Pro, switch to Flash
                this.currentModel = this.fallbackModel;
                this.updateBadge();
                console.warn("Quota exceeded on Pro model. Falling back to Flash model.");
                // Retry with fallback
                return await this.generateLetter(promptText);
            }

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            if (data.candidates && data.candidates[0].content.parts[0].text) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error("Invalid response structure from Gemini API");
            }

        } catch (error) {
            console.error("AI Generation failed:", error);
            throw error;
        }
    }

    bindEvents() {
        const btn = document.getElementById('generateBtn');
        const input = document.getElementById('aiInput');
        const outputDiv = document.getElementById('aiOutput');
        const outputText = document.getElementById('generatedText');

        if (!btn || !input || !outputDiv || !outputText) return;

        btn.addEventListener('click', async () => {
            const contextText = input.value.trim();
            if (!contextText) {
                input.style.borderColor = 'red';
                setTimeout(() => input.style.borderColor = 'var(--accent-blue)', 1000);
                return;
            }

            const regenText = window.i18n ? window.i18n.get('eu.ai.btn.regen') : 'Regenerate Draft ✨';

            btn.innerHTML = '<span style="animation: pulse 1s infinite;">Yapay Zeka Düşünüyor... ⏳</span>';
            btn.style.opacity = '0.7';
            btn.disabled = true;

            try {
                const generatedHTML = await this.generateLetter(contextText);
                outputText.innerHTML = generatedHTML;

                outputDiv.style.display = 'block';
                setTimeout(() => outputDiv.style.opacity = '1', 50);
            } catch (error) {
                outputText.innerHTML = `<p style="color: #ff453a;">An error occurred while generating the letter. Please try again later. (${error.message})</p>`;
                outputDiv.style.display = 'block';
                setTimeout(() => outputDiv.style.opacity = '1', 50);
            } finally {
                btn.innerHTML = regenText;
                btn.style.opacity = '1';
                btn.disabled = false;
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on eu.html
    if (document.getElementById('ai-tools')) {
        window.aiManager = new AIManager();
    }
});