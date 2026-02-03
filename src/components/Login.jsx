import React, { useState, useRef, useEffect } from "react";

export default function Login({ onLogin }) {
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [showPin, setShowPin] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function submit(e) {
    e.preventDefault();
    if (pin.length < 4) {
      setErr("PIN must be at least 4 digits");
      return;
    }
    setErr("");
    setBusy(true);
    try {
      await onLogin(pin);
    } catch (e) {
      setErr(e.message || "Invalid PIN. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-wrapper">
      <style>{loginStyles}</style>
      <div className="login-card fade-in">
        <div className="login-header">
          <div className="brand-badge">Secure Path Solutions</div>
          <h2>Accounting <span className="accent">Portal</span></h2>
          <p className="muted">Authorized Personnel Only</p>
        </div>

        <form onSubmit={submit} className="login-form">
          <div className="field-group">
            <label>Security PIN</label>
            <div className="input-container">
              <input
                ref={inputRef}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} 
                type={showPin ? "text" : "password"}
                placeholder="••••"
                maxLength={6}
                required
                disabled={busy}
              />
              <button 
                type="button" 
                className="toggle-visibility"
                onClick={() => setShowPin(!showPin)}
              >
                {showPin ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {err && <div className="error-msg"> {err}</div>}

          <button className={`login-btn ${busy ? 'loading' : ''}`} disabled={busy}>
            {busy ? <span className="spinner"></span> : "Unlock Dashboard"}
          </button>
        </form>
        
        <div className="login-footer">
          <p>Session will expire after 2 hours of inactivity</p>
        </div>
      </div>
    </div>
  );
}

const loginStyles = `
  .login-wrapper {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #020617; /* Matches your main app bg */
    font-family: 'Inter', sans-serif;
  }

  .login-card {
    background: #1e293b;
    padding: 40px;
    border-radius: 24px;
    border: 1px solid #334155;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    text-align: center;
  }

  .brand-badge {
    background: rgba(56, 189, 248, 0.1);
    color: #38bdf8;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    display: inline-block;
    margin-bottom: 15px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  h2 { color: #fff; margin: 0; font-size: 24px; }
  .accent { color: #38bdf8; }
  .muted { color: #94a3b8; font-size: 14px; margin-top: 8px; }

  .login-form { margin-top: 30px; text-align: left; }
  
  .field-group label {
    display: block;
    color: #94a3b8;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 8px;
    text-transform: uppercase;
  }

  .input-container {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input-container input {
    width: 100%;
    background: #0f172a;
    border: 1px solid #334155;
    padding: 14px;
    border-radius: 12px;
    color: white;
    font-size: 18px;
    letter-spacing: 4px;
    transition: 0.3s;
  }

  .input-container input:focus {
    border-color: #38bdf8;
    outline: none;
    box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.1);
  }

  .toggle-visibility {
    position: absolute;
    right: 12px;
    background: transparent;
    border: none;
    color: #38bdf8;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
  }

  .error-msg {
    background: rgba(244, 63, 94, 0.1);
    color: #f43f5e;
    padding: 10px;
    border-radius: 8px;
    font-size: 13px;
    margin-top: 15px;
    border: 1px solid rgba(244, 63, 94, 0.2);
  }

  .login-btn {
    width: 100%;
    margin-top: 25px;
    background: #38bdf8;
    color: #000;
    border: none;
    padding: 14px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    transition: 0.3s;
  }

  .login-btn:hover:not(:disabled) {
    background: #7dd3fc;
    transform: translateY(-2px);
  }

  .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .login-footer { margin-top: 25px; border-top: 1px solid #334155; padding-top: 20px; }
  .login-footer p { color: #64748b; font-size: 11px; margin: 0; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .fade-in { animation: fadeIn 0.5s ease-out; }

  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #000;
    border-top: 2px solid transparent;
    border-radius: 50%;
    display: inline-block;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;