import React, { useState } from 'react';
import { Copy, KeyRound, Check, History } from 'lucide-react';
import { ToolHeading } from './ToolHeading';
import { parseNumber } from '../utils/formatters';
import { useHistory } from '../context/HistoryContext';

interface PasswordGeneratorProps {
  setToast: (msg: string) => void;
}

interface PasswordOptions {
  upper: boolean;
  lower: boolean;
  numbers: boolean;
  symbols: boolean;
}

function generateSecurePassword(length: number, options: PasswordOptions): string {
  const upperChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowerChars = 'abcdefghijkmnopqrstuvwxyz';
  const numberChars = '23456789';
  const symbolChars = '!@#$%^&*_-+=';

  const charset =
    [
      options.upper ? upperChars : '',
      options.lower ? lowerChars : '',
      options.numbers ? numberChars : '',
      options.symbols ? symbolChars : '',
    ].filter(Boolean).join('') || lowerChars;

  const validLength = Math.min(64, Math.max(6, length));
  const randomValues = new Uint32Array(validLength);

  if (window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(randomValues);
  } else {
    for (let i = 0; i < validLength; i++) {
      randomValues[i] = Math.floor(Math.random() * 10000000);
    }
  }

  return Array.from(randomValues, (n) => charset[n % charset.length]).join('');
}

export const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({ setToast }) => {
  const { addHistoryItem } = useHistory();
  const [length, setLength] = useState<string>('16');
  const [options, setOptions] = useState<PasswordOptions>({
    upper: true,
    lower: true,
    numbers: true,
    symbols: true,
  });
  const [password, setPassword] = useState<string>(() =>
    generateSecurePassword(16, { upper: true, lower: true, numbers: true, symbols: true })
  );

  const handleGenerate = () => {
    const len = parseNumber(length, 16);
    setPassword(generateSecurePassword(len, options));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setToast('Password copied to your clipboard.');
    } catch {
      setToast('Copy is unavailable in this browser.');
    }
  };

  return (
    <>
      <ToolHeading
        eyebrow="Password generator"
        title={
          <>
            Create a stronger
            <br />
            <em>key in seconds.</em>
          </>
        }
        copy="Generate a unique password locally in your browser. Nothing is uploaded or saved."
      />

      <div className="tool-layout">
        <div className="tool-card">
          <div className="password-display">
            <span>{password}</span>
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy password"
            >
              <Copy aria-hidden="true" />
            </button>
          </div>

          <div className="password-length">
            <label className="tool-label" htmlFor="password-length-slider">
              Password length <strong>{length}</strong>
            </label>
            <input
              id="password-length-slider"
              type="range"
              min="6"
              max="64"
              value={length}
              onChange={(e) => setLength(e.target.value)}
            />
          </div>

          <div className="password-options">
            {(
              [
                ['upper', 'Uppercase letters'],
                ['lower', 'Lowercase letters'],
                ['numbers', 'Numbers'],
                ['symbols', 'Symbols'],
              ] as const
            ).map(([optKey, label]) => (
              <label key={optKey} className="check-option">
                <input
                  type="checkbox"
                  checked={options[optKey]}
                  onChange={() =>
                    setOptions((prev) => ({ ...prev, [optKey]: !prev[optKey] }))
                  }
                />
                <span>{label}</span>
              </label>
            ))}
          </div>

          <button
            type="button"
            className="tool-button"
            onClick={handleGenerate}
            style={{ width: '100%', marginTop: '24px' }}
          >
            <KeyRound aria-hidden="true" /> Generate password
          </button>
        </div>

        <div className="tool-card tool-result-card password-tips">
          <span className="result-kicker">Good to know</span>
          <div className="tool-big-number">Strong</div>
          <p className="tool-result-copy">
            Your password is generated in this browser using a secure random source when available.
          </p>

          <div className="secure-note">
            <Check aria-hidden="true" /> No account. No uploads. No password storage.
          </div>

          <div style={{ marginTop: '20px' }}>
            <button
              type="button"
              className="result-action result-action-highlight"
              style={{ width: '100%' }}
              onClick={() => {
                const masked = password.length > 8
                  ? `${password.slice(0, 3)}••••••${password.slice(-3)}`
                  : '••••••••';
                addHistoryItem({
                  type: 'password',
                  title: 'Generated Password',
                  value: `${masked} (${password.length} chars)`,
                  subtitle: `Upper: ${options.upper ? 'Yes' : 'No'} · Numbers: ${options.numbers ? 'Yes' : 'No'} · Symbols: ${options.symbols ? 'Yes' : 'No'}`,
                });
                setToast('Password generation logged to history.');
              }}
            >
              <History aria-hidden="true" /> Save to History
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
