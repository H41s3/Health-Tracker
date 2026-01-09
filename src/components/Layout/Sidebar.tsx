import { LayoutDashboard, Calendar, TrendingUp, BookOpen, Bell, Settings, LogOut, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import BaymaxLogo from '../BaymaxLogo';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'cycle', label: 'Cycle Tracker', icon: Calendar },
  { id: 'metrics', label: 'Custom Metrics', icon: TrendingUp },
  { id: 'notes', label: 'Health Journal', icon: BookOpen },
  { id: 'reminders', label: 'Reminders', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ currentPage, onNavigate, isOpen = false, onClose }: SidebarProps) {
  const { signOut } = useAuth();

  const sidebarStyle = {
    background: 'rgba(11, 41, 66, 0.85)',
    backdropFilter: 'blur(24px) saturate(180%)',
    borderRight: '1px solid rgba(127, 219, 202, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
  };

  const headerBorderStyle = { borderBottom: '1px solid rgba(127, 219, 202, 0.1)' };
  const footerBorderStyle = { borderTop: '1px solid rgba(127, 219, 202, 0.1)' };

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col z-30"
        style={sidebarStyle}
      >
        <div className="p-6" style={headerBorderStyle}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
            className="flex items-center gap-3"
          >
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden"
              style={{ 
                background: 'linear-gradient(135deg, #7fdbca 0%, #82aaff 50%, #c792ea 100%)',
                boxShadow: '0 4px 20px rgba(127, 219, 202, 0.3)'
              }}
            >
              <BaymaxLogo className="w-10 h-10" />
            </div>
            <div>
              <h1 className="font-bold text-lg" style={{ color: '#d6deeb' }}>Health Tracker</h1>
              <p className="text-xs" style={{ color: '#7fdbca' }}>Baymax is here</p>
            </div>
          </motion.div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <motion.button
                key={item.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.05, ease: [0.4, 0, 0.2, 1] }}
                onClick={() => onNavigate(item.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                style={isActive ? {
                  background: 'linear-gradient(135deg, rgba(127, 219, 202, 0.2) 0%, rgba(130, 170, 255, 0.15) 100%)',
                  border: '1px solid rgba(127, 219, 202, 0.3)',
                  boxShadow: '0 0 20px rgba(127, 219, 202, 0.1)',
                  color: '#7fdbca'
                } : {
                  color: '#5f7e97',
                  border: '1px solid transparent'
                }}
                whileHover={{ 
                  scale: 1.02,
                  backgroundColor: 'rgba(127, 219, 202, 0.08)'
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon 
                  className="w-5 h-5 transition-colors duration-200" 
                  style={{ color: isActive ? '#7fdbca' : '#5f7e97' }}
                />
                <span 
                  className="font-medium transition-colors duration-200"
                  style={{ color: isActive ? '#d6deeb' : '#5f7e97' }}
                >
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-2 h-2 rounded-full"
                    style={{ 
                      background: 'linear-gradient(135deg, #7fdbca 0%, #82aaff 100%)',
                      boxShadow: '0 0 10px rgba(127, 219, 202, 0.5)'
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        <div className="p-4" style={footerBorderStyle}>
          <motion.button
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
            style={{ color: '#5f7e97' }}
            whileHover={{ 
              scale: 1.02,
              backgroundColor: 'rgba(255, 88, 116, 0.1)',
              color: '#ff5874'
            }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </motion.button>
        </div>
      </motion.aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside 
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="lg:hidden fixed left-0 top-0 h-screen w-64 flex flex-col z-50"
            style={sidebarStyle}
          >
            <div className="p-6 flex items-center justify-between" style={headerBorderStyle}>
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden"
                  style={{ 
                    background: 'linear-gradient(135deg, #7fdbca 0%, #82aaff 50%, #c792ea 100%)',
                    boxShadow: '0 4px 20px rgba(127, 219, 202, 0.3)'
                  }}
                >
                  <BaymaxLogo className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="font-bold text-lg" style={{ color: '#d6deeb' }}>Health Tracker</h1>
                  <p className="text-xs" style={{ color: '#7fdbca' }}>Baymax is here</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl transition-all duration-200 hover:bg-white/10"
              >
                <X className="w-5 h-5" style={{ color: '#5f7e97' }} />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <motion.button
                    key={item.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    onClick={() => onNavigate(item.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                    style={isActive ? {
                      background: 'linear-gradient(135deg, rgba(127, 219, 202, 0.2) 0%, rgba(130, 170, 255, 0.15) 100%)',
                      border: '1px solid rgba(127, 219, 202, 0.3)',
                      boxShadow: '0 0 20px rgba(127, 219, 202, 0.1)',
                      color: '#7fdbca'
                    } : {
                      color: '#5f7e97',
                      border: '1px solid transparent'
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon 
                      className="w-5 h-5" 
                      style={{ color: isActive ? '#7fdbca' : '#5f7e97' }}
                    />
                    <span 
                      className="font-medium"
                      style={{ color: isActive ? '#d6deeb' : '#5f7e97' }}
                    >
                      {item.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicatorMobile"
                        className="ml-auto w-2 h-2 rounded-full"
                        style={{ 
                          background: 'linear-gradient(135deg, #7fdbca 0%, #82aaff 100%)',
                          boxShadow: '0 0 10px rgba(127, 219, 202, 0.5)'
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </nav>

            <div className="p-4" style={footerBorderStyle}>
              <motion.button
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.3 }}
                onClick={signOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                style={{ color: '#5f7e97' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </motion.button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
