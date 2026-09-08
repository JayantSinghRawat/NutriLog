import React, { useState } from 'react';
import { X, User, Lock, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, login } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, name);
  };

  const handleDemo = async () => {
    await login('jayant@example.com', 'Jayant');
  };

  return (
    <div className="modal-overlay" onClick={() => setIsAuthModalOpen(false)}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} />
            <h3 className="modal-title">Sign In to DailyLog</h3>
          </div>
          <button className="modal-close-btn" onClick={() => setIsAuthModalOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'var(--surface-input)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
              }}
            >
              <Smartphone size={18} style={{ flexShrink: 0 }} />
              <span>
                <strong>Persistent Session:</strong> Once signed in, you will stay logged in permanently on this phone or browser until you explicitly click Log Out.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Jayant"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="e.g. user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleDemo}
              style={{ marginRight: 'auto' }}
            >
              Quick Demo Login
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsAuthModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
