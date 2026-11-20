
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../lib/supabaseClient";

// export default function Login() {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });

//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage("");
//     setLoading(true);

//     try {
//       const { error } = await supabase.auth.signInWithPassword({
//         email: formData.email.trim(),
//         password: formData.password,
//       });

//       if (error) {
//         setMessage(error.message);
//         return;
//       }

//       setMessage("Login successful!");

//       navigate("/");

//     } catch (error) {
//       setMessage("Something went wrong. Please try again.");
//       console.error(error);

//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="login-container">
//       <div className="login-card">

//         <h1>Welcome Back!</h1>

//         <p>Login to your Guess The Number account.</p>

//         <form onSubmit={handleSubmit}>

//           <input
//             type="email"
//             name="email"
//             placeholder="Email Address"
//             value={formData.email}
//             onChange={handleChange}
//             required
//           />

//           <input
//             type="password"
//             name="password"
//             placeholder="Password"
//             value={formData.password}
//             onChange={handleChange}
//             required
//           />

//           <button type="submit" disabled={loading}>
//             {loading ? "Logging in..." : "Login"}
//           </button>

//         </form>

//         {message && <p>{message}</p>}


// <div className="login-links">

//   <p>
//     <a href="/forgot-password">
//       Forgot Password?
//     </a>
//   </p>

//   <p>
//     Don't have an account?{" "}
//     <a href="/signup">
//       Create Account
//     </a>
//   </p>

// </div>


//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
          <path d="m3 3 18 18M10.6 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a16 16 0 0 1-3.1 3.8M6.2 6.3C3.5 8.1 2 12 2 12s3.6 7 10 7a10 10 0 0 0 4-.8" />
          <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
        </>
      )}
    </svg>
  );
}

function AuthBrandPanel() {
  return (
    <aside className="auth-showcase" aria-label="Number Guesser game features">
      <div className="auth-showcase__glow auth-showcase__glow--one" />
      <div className="auth-showcase__glow auth-showcase__glow--two" />
      <div className="auth-showcase__eyebrow"><span /> THE NEXT GUESS IS YOURS</div>
      <div className="auth-showcase__title">
        THINK FAST.<br />
        <span>GUESS SMART.</span>
      </div>
      <p className="auth-showcase__copy">
        Challenge your mind, beat the code and climb the leaderboard.
        Every digit brings you closer to victory.
      </p>
      <div className="auth-preview" aria-hidden="true">
        <div className="auth-preview__top"><span>DAILY CODE</span><span>● LIVE</span></div>
        <div className="auth-preview__tiles">
          <span className="is-green">7</span><span className="is-yellow">2</span>
          <span className="is-muted">9</span><span className="is-green">4</span><span className="is-muted">1</span>
        </div>
        <div className="auth-preview__legend">
          <span><i className="green" /> Correct</span>
          <span><i className="yellow" /> Misplaced</span>
          <span><i className="muted" /> Not in code</span>
        </div>
      </div>
      <div className="auth-showcase__footer"><span>5 DIGITS</span><b>·</b><span>5 ATTEMPTS</span><b>·</b><span>ONE WIN</span></div>
    </aside>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((current) => ({ ...current, [e.target.name]: e.target.value }));
    if (message) setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setMessage("");
    setMessageType("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (error) {
        setMessage(error.message);
        setMessageType("error");
        return;
      }

      setMessage("Login successful! Welcome back.");
      setMessageType("success");
      navigate("/");
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
      setMessageType("error");
      console.error("Login Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page auth-page--login">
      <AuthBrandPanel />
      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-mobile-mark"><span>NG</span> NUMBER GUESSER</div>
          <div className="auth-card__heading">
            <span className="auth-kicker">PLAYER ACCESS</span>
            <h1>Welcome <span>back.</span></h1>
            <p>Sign in to continue your winning streak.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-field">
              <span>Email address</span>
              <input
                type="email" name="email" placeholder="you@example.com"
                value={formData.email} onChange={handleChange}
                autoComplete="email" autoCapitalize="none" required
              />
            </label>

            <label className="auth-field">
              <span>Password</span>
              <div className="auth-password-wrap">
                <input
                  type={showPassword ? "text" : "password"} name="password"
                  placeholder="Enter your password" value={formData.password}
                  onChange={handleChange} autoComplete="current-password" required
                />
                <button className="auth-password-toggle" type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}>
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
            </label>

            <div className="auth-form__meta">
              <span>Secure player Login</span>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <button className="auth-submit" type="submit" disabled={loading}>
              <span>{loading ? "Signing you in..." : "Login to your account"}</span>
              <span aria-hidden="true">↗</span>
            </button>
          </form>

          {message && (
            <p className={`auth-feedback auth-feedback--${messageType}`}
              role={messageType === "error" ? "alert" : "status"}>{message}</p>
          )}

          <div className="auth-switch">
            New to the game? <Link to="/signup">Create your player account <span>→</span></Link>
          </div>
          <div className="auth-card__bottom"><span>●</span> YOUR PROGRESS. YOUR NEXT LEVEL.</div>
        </div>
      </div>
    </section>
  );
}

