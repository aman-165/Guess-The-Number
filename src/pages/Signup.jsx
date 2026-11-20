import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function EyeIcon({ visible }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {visible ? (
        <>
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="m3 3 18 18M10.6 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7s-3.6 7-10 7a10 10 0 0 1-4-.8" />
          <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
        </>
      )}
    </svg>
  );
}

function PasswordField({ name, label, value, onChange, visible, onToggle, autoComplete }) {
  return (
    <label className="auth-field">
      <span>{label}</span>
      <div className="auth-password-wrap">
        <input type={visible ? "text" : "password"} name={name}
          placeholder={`Enter ${label.toLowerCase()}`} value={value}
          onChange={onChange} autoComplete={autoComplete} required />
        <button className="auth-password-toggle" type="button"
          onClick={onToggle} aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}>
          <EyeIcon visible={visible} />
        </button>
      </div>
    </label>
  );
}

function AuthBrandPanel() {
  return (
    <aside className="auth-showcase" aria-label="Number Guesser game features">
      <div className="auth-showcase__glow auth-showcase__glow--one" />
      <div className="auth-showcase__glow auth-showcase__glow--two" />
      <div className="auth-showcase__eyebrow"><span /> JOIN THE PLAYER COMMUNITY</div>
      <div className="auth-showcase__title">
        YOUR GAME.<br />
        <span>YOUR LEGACY.</span>
      </div>
      <p className="auth-showcase__copy">
        Create your player identity, challenge friends and prove
        you have what it takes to crack the code.
      </p>
      <div className="auth-preview" aria-hidden="true">
        <div className="auth-preview__top"><span>PLAYER STATUS</span><span>★ NEW PLAYER</span></div>
        <div className="auth-preview__profile"><span className="auth-preview__avatar">NG</span><span><b>YOUR NEXT CHAPTER</b><small>Starts with one smart guess.</small></span></div>
        <div className="auth-preview__progress"><i /></div>
        <div className="auth-preview__footer"><span>PLAY</span><b>·</b><span>COMPETE</span><b>·</b><span>LEVEL UP</span></div>
      </div>
      <div className="auth-showcase__footer"><span>THINK</span><b>·</b><span>GUESS</span><b>·</b><span>CONQUER</span></div>
    </aside>
  );
}

export default function Signup() {
  const [formData, setFormData] = useState({
    full_name: "", username: "", email: "", password: "", confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((current) => ({ ...current, [e.target.name]: e.target.value }));
    if (message) setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setMessage("");
    setMessageType("");

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      return;
    }
    if (formData.password.length < 6) {
      setMessage("Password must be at least 8 characters including A–Z, a–z, 0–9 & symbol.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name.trim(),
            username: formData.username.trim(),
          },
        },
      });

      if (error) {
        setMessage(error.message);
        setMessageType("error");
        return;
      }

      // Detect an email that may already be registered
      if (
        data.user &&
        Array.isArray(data.user.identities) &&
        data.user.identities.length === 0
      ) {
        setMessage(
          "This email may already be registered. Please log in or use Forgot Password."
        );
        setMessageType("error");
        return;
      }

      if (data.session) {
        setMessage("Account created successfully! Welcome!");
        setMessageType("success");
      } else {
        setMessage("Account created! Please check your email to verify your account.");
        setMessageType("success");
      }

      setFormData({ full_name: "", username: "", email: "", password: "", confirmPassword: "" });
      setShowPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
      setMessageType("error");
      console.error("Signup Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page auth-page--signup">
      <AuthBrandPanel />
      <div className="auth-form-side">
        <div className="auth-card auth-card--signup">
          <div className="auth-mobile-mark"><span>NG</span> NUMBER GUESSER</div>
          <div className="auth-card__heading">
            <span className="auth-kicker">CREATE PLAYER ID</span>
            <h1>Join the <span>game.</span></h1>
            <p>Build your profile and make your first move.</p>
          </div>

          <form className="auth-form auth-form--signup" onSubmit={handleSubmit}>
            <div className="auth-form__row">
              <label className="auth-field">
                <span>Full name</span>
                <input type="text" name="full_name" placeholder="Your name"
                  value={formData.full_name} onChange={handleChange}
                  autoComplete="name" required />
              </label>
              <label className="auth-field">
                <span>Username</span>
                <input type="text" name="username" placeholder="Player tag"
                  value={formData.username} onChange={handleChange}
                  autoComplete="username" required />
              </label>
            </div>

            <label className="auth-field">
              <span>Email address</span>
              <input type="email" name="email" placeholder="you@example.com"
                value={formData.email} onChange={handleChange}
                autoComplete="email" autoCapitalize="none" required />
            </label>

            <div className="auth-form__row">
              <PasswordField name="password" label="Password" value={formData.password}
                onChange={handleChange} visible={showPassword}
                onToggle={() => setShowPassword((value) => !value)}
                autoComplete="new-password" />
              <PasswordField name="confirmPassword" label="Confirm password"
                value={formData.confirmPassword} onChange={handleChange}
                visible={showConfirmPassword}
                onToggle={() => setShowConfirmPassword((value) => !value)}
                autoComplete="new-password" />
            </div>
            <p className="auth-password-hint">Use at least 8 characters for your password.</p>

            <button className="auth-submit" type="submit" disabled={loading}>
              <span>{loading ? "Creating your account..." : "Create player account"}</span>
              <span aria-hidden="true">↗</span>
            </button>
          </form>

          {message && (
            <p className={`auth-feedback auth-feedback--${messageType}`}
              role={messageType === "error" ? "alert" : "status"}>{message}</p>
          )}

          <div className="auth-switch">
            Already have an account? <Link to="/login">Login <span>→</span></Link>
          </div>
          <div className="auth-card__bottom"><span>●</span> YOUR NEXT LEVEL STARTS HERE.</div>
        </div>
      </div>
    </section>
  );
}
