import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaSignature,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const initialSignup = {
  name: "",
  username: "",
  mail: "",
  password: "",
  confirmPassword: "",
};

export default function AuthForm({ defaultMode = "login" }) {
  const [mode, setMode] = useState(defaultMode);
  const { login, signup } = useAuth();
  const [form, setForm] = useState(initialSignup);
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(user, password);
      toast.success("Welcome back!");
      navigate("/");
    } catch {
      setError("Invalid credentials");
      toast.error("Login failed.");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      toast.error("Passwords do not match.");
      return;
    }
    try {
      await signup(form);
      toast.success("Signup successful!");
      navigate("/");
    } catch (err) {
      setError(err?.toString() || "Signup failed. Please try again.");
      toast.error("Signup failed.");
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    setForm(initialSignup);
    setUser("");
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-accent/3 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-text-soft">
            {mode === "login"
              ? "Sign in to your account to continue"
              : "Join us and start your journey"}
          </p>
        </div>

        <div className="bg-surface border border-surface/40 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-400/20 rounded-xl text-red-400 text-sm text-center font-medium">
              {error}
            </div>
          )}

          <form
            onSubmit={mode === "login" ? handleLogin : handleSignup}
            className="space-y-5"
          >
            {mode === "signup" && (
              <>
                <InputField
                  icon={<FaSignature size={18} />}
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  autoFocus
                  required
                />
                <InputField
                  icon={<FaUser size={18} />}
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Username"
                  required
                />
                <InputField
                  icon={<FaEnvelope size={18} />}
                  type="email"
                  name="mail"
                  value={form.mail}
                  onChange={handleChange}
                  placeholder="Email address"
                  required
                />
              </>
            )}

            {mode === "login" && (
              <InputField
                icon={<FaUser size={18} />}
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="Username or Email"
                autoFocus
                required
              />
            )}

            <InputField
              icon={<FaLock size={18} />}
              type={showPass ? "text" : "password"}
              name={mode === "login" ? undefined : "password"}
              value={mode === "login" ? password : form.password}
              onChange={
                mode === "login"
                  ? (e) => setPassword(e.target.value)
                  : handleChange
              }
              placeholder="Password"
              required
              rightIcon={
                <button
                  type="button"
                  tabIndex={-1}
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              }
            />

            {mode === "signup" && (
              <InputField
                icon={<FaLock size={18} />}
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                required
                rightIcon={
                  <button
                    type="button"
                    tabIndex={-1}
                    className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? (
                      <FaEyeSlash size={16} />
                    ) : (
                      <FaEye size={16} />
                    )}
                  </button>
                }
              />
            )}

            <button
              type="submit"
              className="w-full mt-8 py-4 px-6 bg-accent hover:bg-accent-dark text-white font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-surface shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              {mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-surface/30 text-center">
            <p className="text-text-soft text-sm mb-3">
              {mode === "login"
                ? "Don't have an account?"
                : "Already have an account?"}
            </p>
            <button
              type="button"
              className="text-accent hover:text-accent-dark font-semibold text-sm hover:underline transition-all duration-200"
              onClick={() => switchMode(mode === "login" ? "signup" : "login")}
            >
              {mode === "login" ? "Sign up for free" : "Sign in instead"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({ icon, rightIcon, className = "", ...props }) {
  return (
    <div className="group relative">
      <div className="relative flex items-center">
        <div className="absolute left-4 z-10 text-gray-400 group-focus-within:text-accent transition-colors duration-200">
          {icon}
        </div>

        <input
          className={`
            w-full h-14 pl-12 pr-4 
            bg-background/50 border border-surface/60 rounded-xl
            text-white placeholder-gray-400 
            focus:outline-none focus:border-accent/50 focus:bg-background/80
            transition-all duration-200
            ${rightIcon ? "pr-14" : "pr-4"}
            ${className}
          `}
          {...props}
        />

        {rightIcon && <div className="absolute right-2 z-10">{rightIcon}</div>}
      </div>
    </div>
  );
}
