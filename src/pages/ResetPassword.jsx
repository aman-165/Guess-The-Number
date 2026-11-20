import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import AuthRecoveryBrandPanel from "../components/AuthRecoveryBrandPanel";

function EyeIcon({ visible }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {visible ? <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></> : <><path d="m3 3 18 18M10.6 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a16 16 0 0 1-3.1 3.8M6.2 6.3C3.5 8.1 2 12 2 12s3.6 7 10 7a10 10 0 0 0 4-.8" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>}
    </svg>
  );
}

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const checkSession = async () => {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (!mounted) return;
        if (sessionError) throw sessionError;
        if (data.session) setRecoveryReady(true);
        else setError("This recovery link is invalid or has expired. Request a new link to continue.");
      } catch (sessionError) {
        if (mounted) setError(sessionError.message || "We couldn't verify your recovery link.");
      } finally {
        if (mounted) setChecking(false);
      }
    };

    checkSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (session && event === "PASSWORD_RECOVERY") {
        setRecoveryReady(true);
        setError("");
        setChecking(false);
      }
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;
    setError("");
    if (password.length < 6) {
      setError("Use at least 6 characters for your new password.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Your passwords don't match. Check both fields and try again.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setUpdated(true);
      setPassword("");
      setConfirmPassword("");
    } catch (updateError) {
      setError(updateError.message || "We couldn't update your password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page auth-recovery-page auth-recovery-page--reset">
      <AuthRecoveryBrandPanel mode="reset" />
      <div className="auth-form-side">
        <div className="auth-card auth-recovery-card">
          <div className="auth-mobile-mark"><span>NG</span> NUMBER GUESSER</div>
          <div className="auth-recovery-symbol auth-recovery-symbol--lock">✦</div>
          <div className="auth-card__heading">
            <span className="auth-kicker">SECURE YOUR ACCOUNT</span>
            <h1>Set a new <span>password.</span></h1>
            <p>Choose a strong password you haven't used for this account before.</p>
          </div>

          {checking ? (
            <div className="auth-recovery-state" role="status"><span className="auth-recovery-spinner" />Verifying your secure recovery link...</div>
          ) : updated ? (
            <div className="auth-recovery-success" role="status" aria-live="polite">
              <span className="auth-recovery-success__check">✓</span>
              <div><b>Password updated</b><p>Your password has been changed successfully. You can now sign in with your new password.</p></div>
              <Link className="auth-submit auth-recovery-login-button" to="/login"><span>Continue to sign in</span><span aria-hidden="true">↗</span></Link>
            </div>
          ) : recoveryReady ? (
            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="auth-field">
                <span>New password</span>
                <div className="auth-password-wrap">
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} placeholder="At least 6 characters" autoComplete="new-password" minLength={6} required />
                  <button className="auth-password-toggle" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}><EyeIcon visible={showPassword} /></button>
                </div>
              </label>
              <label className="auth-field">
                <span>Confirm new password</span>
                <div className="auth-password-wrap">
                  <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); setError(""); }} placeholder="Enter your new password again" autoComplete="new-password" minLength={6} required />
                  <button className="auth-password-toggle" type="button" onClick={() => setShowConfirm((value) => !value)} aria-label={showConfirm ? "Hide confirmation password" : "Show confirmation password"} aria-pressed={showConfirm}><EyeIcon visible={showConfirm} /></button>
                </div>
              </label>
              <p className="auth-recovery-privacy">Use 6 or more characters. A longer, unique password is even better.</p>
              <button className="auth-submit" type="submit" disabled={loading}><span>{loading ? "Updating password..." : "Save new password"}</span><span aria-hidden="true">↗</span></button>
            </form>
          ) : (
            <div className="auth-recovery-expired" role="alert">
              <b>Recovery link unavailable</b>
              <p>{error || "This recovery link is no longer valid."}</p>
              <Link className="auth-submit auth-recovery-login-button" to="/forgot-password"><span>Request a new recovery link</span><span aria-hidden="true">↗</span></Link>
            </div>
          )}

          {error && recoveryReady && !checking && <p className="auth-feedback auth-feedback--error" role="alert">{error}</p>}
          {!updated && <div className="auth-switch auth-recovery-back"><Link to="/login">← Back to sign in</Link></div>}
          <div className="auth-card__bottom"><span>●</span> YOUR PROGRESS. YOUR NEXT LEVEL.</div>
        </div>
      </div>
    </section>
  );
}
