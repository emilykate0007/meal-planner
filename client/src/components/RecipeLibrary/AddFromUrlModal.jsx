import { useState } from 'react';
import './AddFromUrlModal.css';

export default function AddFromUrlModal({ isOpen, onClose, onSuccess }) {
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [saveApiKey, setSaveApiKey] = useState(!!localStorage.getItem('openai_api_key'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Save API key if requested
      if (saveApiKey) {
        localStorage.setItem('openai_api_key', apiKey);
      } else {
        localStorage.removeItem('openai_api_key');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/recipes/from-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, openaiApiKey: apiKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to parse recipe');
      }

      onSuccess(data.recipe);
      setUrl('');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-url-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Recipe from URL</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="add-url-form">
          <div className="form-group">
            <label htmlFor="recipe-url">Recipe URL</label>
            <input
              id="recipe-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/recipe"
              required
              disabled={loading}
            />
            <p className="form-hint">Paste the URL of any recipe website</p>
          </div>

          <div className="form-group">
            <label htmlFor="openai-key">OpenAI API Key</label>
            <input
              id="openai-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              required
              disabled={loading}
            />
            <p className="form-hint">
              Get your API key from{' '}
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
                OpenAI Platform
              </a>
            </p>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={saveApiKey}
                onChange={(e) => setSaveApiKey(e.target.checked)}
                disabled={loading}
              />
              <span>Save API key in browser (stored locally, never sent to server)</span>
            </label>
          </div>

          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !url || !apiKey}
            >
              {loading ? 'Parsing Recipe...' : 'Add Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
