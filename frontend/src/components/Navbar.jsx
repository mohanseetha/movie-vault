import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, UserCircle, LogOut, Film, Star } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import SearchBar from "./SearchBar";

function ProfileDropdown({ open, setOpen, onProfile, onLogout }) {
  const ref = useRef();
  const location = useLocation();

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [open, setOpen]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, setOpen]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute right-0 top-14 w-48 bg-surface/95 backdrop-blur-2xl rounded-xl shadow-2xl py-2 z-50 border border-accent/20 animate-in slide-in-from-top-2 duration-200"
    >
      <button
        className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-accent/10 transition text-white/90 hover:text-white"
        onClick={() => {
          setOpen(false);
          onProfile();
        }}
      >
        <UserCircle size={18} className="text-accent" />
        <span>Profile</span>
      </button>
      <Link
        to="/watchlist"
        className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-accent/10 transition text-white/90 hover:text-white"
        onClick={() => setOpen(false)}
      >
        <Star size={18} className="text-yellow-400" />
        <span>Watchlist</span>
      </Link>
      <button
        className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-red-500/10 transition text-white/90 hover:text-white"
        onClick={() => {
          setOpen(false);
          onLogout();
        }}
      >
        <LogOut size={18} className="text-red-400" />
        <span>Logout</span>
      </button>
    </div>
  );
}

function MobileMenu({ open, setOpen, user, onProfile, onLogout }) {
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, setOpen]);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div
        className="fixed inset-0 bg-black/60"
        onClick={() => setOpen(false)}
      />
      <div className="relative w-full bg-surface/95 rounded-b-2xl shadow-2xl p-4 animate-in slide-in-from-top-2 duration-200 overflow-y-auto max-h-[90vh] mx-auto mt-0">
        <div className="flex justify-between items-center mb-2">
          <Link
            to="/"
            className="flex items-center gap-2 text-accent font-bold text-xl"
            onClick={() => setOpen(false)}
          >
            <Film size={24} />
            MovieVault
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex justify-center items-center my-4">
          <SearchBar />
        </div>
        <div className="flex flex-col gap-2">
          {user ? (
            <>
              <button
                onClick={() => {
                  setOpen(false);
                  onProfile();
                }}
                className="px-4 py-2 rounded-lg hover:bg-accent/10 text-white/90 flex items-center gap-2"
              >
                <UserCircle size={18} className="text-accent" />
                Profile
              </button>
              <Link
                to="/watchlist"
                className="px-4 py-2 rounded-lg hover:bg-accent/10 text-white/90 flex items-center gap-2"
                onClick={() => setOpen(false)}
              >
                <Star size={18} className="text-yellow-400" />
                Watchlist
              </Link>
              <button
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="px-4 py-2 rounded-lg hover:bg-red-500/10 text-white/90 flex items-center gap-2"
              >
                <LogOut size={18} className="text-red-400" />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="px-5 py-2 rounded-lg bg-accent/70 text-white font-bold shadow transition text-center"
              onClick={() => setOpen(false)}
              style={{ minWidth: 100 }}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/auth");
    setMobileOpen(false);
    setProfileOpen(false);
  }, [logout, navigate]);

  const handleProfile = useCallback(() => {
    navigate("/profile");
    setMobileOpen(false);
    setProfileOpen(false);
  }, [navigate]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-surface/95 backdrop-blur-2xl border-b border-accent/20 shadow-lg"
            : "bg-background/80 backdrop-blur-md border-b border-surface/30"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              to="/"
              className="flex items-center gap-2 text-accent font-bold text-xl"
              aria-label="MovieVault Home"
            >
              <Film size={28} />
              MovieVault
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <SearchBar />
              {!user ? (
                <Link
                  to="/auth"
                  className="px-6 py-2 rounded-lg bg-accent/70 font-bold text-white shadow  transition"
                  style={{ minWidth: 100, textAlign: "center" }}
                >
                  Sign In
                </Link>
              ) : (
                <div className="relative">
                  <button
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center border-2 border-accent/30 hover:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/50 transition"
                    onClick={() => setProfileOpen((prev) => !prev)}
                    aria-label="Open profile menu"
                  >
                    {user?.username ? (
                      <span className="text-lg font-bold text-white">
                        {user.username[0].toUpperCase()}
                      </span>
                    ) : (
                      <UserCircle className="text-white" size={20} />
                    )}
                  </button>
                  <ProfileDropdown
                    open={profileOpen}
                    setOpen={setProfileOpen}
                    onProfile={handleProfile}
                    onLogout={handleLogout}
                  />
                </div>
              )}
            </div>
            <div className="md:hidden flex items-center gap-2">
              {!user && (
                <Link
                  to="/auth"
                  className="px-5 py-2 rounded-lg bg-accent/70 text-white font-bold shadow hover:bg-accent/80 transition"
                  style={{ minWidth: 100, textAlign: "center" }}
                >
                  Sign In
                </Link>
              )}
              <button
                onClick={() => setMobileOpen(true)}
                className="p-2 rounded-xl text-accent hover:text-accent-dark hover:bg-accent/10 transition"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>
      <MobileMenu
        open={mobileOpen}
        setOpen={setMobileOpen}
        user={user}
        onProfile={handleProfile}
        onLogout={handleLogout}
      />
      <div className="h-16"></div>
    </>
  );
}
