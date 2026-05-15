import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Bell } from "./Icons";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_NOTIFICATIONS = [
  { id: 1, icon: "📢", title: "New Announcement", text: "Midterm exam schedule posted", time: "2m ago", unread: true },
  { id: 2, icon: "📝", title: "Assignment Due", text: "Chapter 5 Problems due tomorrow", time: "1h ago", unread: true },
  { id: 3, icon: "⭐", title: "Grade Posted", text: "Shakespeare Essay: 95%", time: "3h ago", unread: false },
  { id: 4, icon: "🤖", title: "AI Suggestion", text: "You should review Newton's Laws", time: "5h ago", unread: false },
];

export default function Navbar({ user, setUser, theme, onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    setUser(null);
    navigate("/");
  };

  const markAllRead = () => setNotifications(n => n.map(x => ({ ...x, unread: false })));

  const links = [
    { path: "/", label: "Home" },
    { path: "/features", label: "Features" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/contact", label: "Contact" },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`sticky top-0 z-50 transition-all duration-300 px-4 sm:px-8 py-3 ${
        scrolled
          ? "bg-black/60 dark:bg-[#06060a]/70 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-3 group relative">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center text-xl shadow-md shadow-indigo-500/20 relative"
          >
            <span className="relative z-10">🎓</span>
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              ITM <span className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">Classroom</span>
            </span>
            <span className="text-[0.62rem] tracking-widest uppercase font-mono text-slate-500 font-bold -mt-1">
              Next-Gen Ed
            </span>
          </div>
        </NavLink>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-1 bg-white/5 dark:bg-white/[0.03] border border-white/10 rounded-full px-3 py-1.5 backdrop-blur-md">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === "/"}
              className={({ isActive }) =>
                `relative px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? "text-white font-semibold"
                    : "text-slate-400 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative z-10">{link.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      className="absolute inset-0 bg-gradient-to-r from-blue-600/40 to-purple-600/40 border border-white/10 rounded-full"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleTheme}
            className="p-2.5 rounded-full bg-white/5 dark:bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center text-sm"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </motion.button>

          {user ? (
            <div className="flex items-center gap-3">
              {/* Notification Panel */}
              <div className="relative" ref={notifRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setNotifOpen((o) => !o);
                    if (unreadCount > 0) markAllRead();
                  }}
                  className="p-2.5 rounded-full bg-white/5 dark:bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer relative flex items-center justify-center"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-pink-500 ring-2 ring-[#06060a] animate-pulse" />
                  )}
                </motion.button>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#0c0c14]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-4 z-50"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                        <span className="font-bold text-sm text-white">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 max-h-[340px] overflow-y-auto pr-1">
                        {notifications.map((n) => (
                          <motion.div
                            key={n.id}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors ${
                              n.unread ? "bg-white/5 border border-white/5" : "hover:bg-white/[0.02]"
                            }`}
                          >
                            <span className="p-2 rounded-lg bg-white/5 text-base flex-shrink-0">
                              {n.icon}
                            </span>
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="text-xs font-semibold text-white truncate">
                                {n.title}
                              </span>
                              <span className="text-[0.75rem] text-slate-400 line-clamp-2 mt-0.5">
                                {n.text}
                              </span>
                              <span className="text-[0.65rem] text-slate-500 font-mono mt-1">
                                {n.time}
                              </span>
                            </div>
                            {n.unread && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1 flex-shrink-0" />
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Avatar Chip */}
              <div className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                  {user.avatar}
                </span>
                <span className="text-xs font-semibold text-slate-200 max-w-[80px] truncate">
                  {user.name.split(" ")[0]}
                </span>
              </div>

              {/* CTA Classroom button */}
              <NavLink
                to="/app"
                className="relative group overflow-hidden rounded-full p-[1px] font-bold text-xs"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 group-hover:scale-105" />
                <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#06060a] transition-colors group-hover:bg-transparent text-white relative z-10">
                  <span>Classroom</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </span>
              </NavLink>

              {/* Logout button */}
              <button
                onClick={logout}
                className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-colors cursor-pointer text-xs font-bold hidden lg:flex items-center justify-center px-3 py-2"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className="relative group overflow-hidden rounded-full p-[1px] font-bold text-xs"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-300 group-hover:scale-105 animate-gradient-shift" />
              <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#06060a] transition-colors group-hover:bg-transparent text-white relative z-10">
                <span>Launch App</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </span>
            </NavLink>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Links Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden overflow-hidden border-t border-white/10 mt-3 pt-3 flex flex-col gap-2 bg-[#06060a]/95 backdrop-blur-3xl rounded-b-2xl px-2"
          >
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/"}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-white font-semibold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                <span>{link.label}</span>
                <span className="text-xs font-mono text-slate-600">→</span>
              </NavLink>
            ))}
            {user && (
              <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1 px-4 pb-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold text-white shadow-inner">
                    {user.avatar}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">{user.name}</span>
                    <span className="text-[0.65rem] text-slate-500 capitalize">{user.role}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20"
                >
                  Sign Out
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}