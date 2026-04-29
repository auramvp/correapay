import React from 'react';
import { LayoutDashboard, Users, CircleDollarSign, Sun, Moon, ChevronLeft, ChevronRight, Landmark, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onLogout?: () => void;
  userRole?: string;
}

export default function Layout({ children, activeTab, onTabChange, isDarkMode, toggleTheme, onLogout, userRole }: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'orders', label: 'Ordens', icon: CircleDollarSign },
    { id: 'correa', label: 'Correa', icon: Landmark, adminOnly: true },
  ].filter(item => !item.adminOnly || userRole === 'admin');

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col md:flex-row transition-all duration-300 relative overflow-x-hidden">
      {/* Background Decorative Light */}
      <div className="fixed -top-24 -right-24 w-96 h-96 bg-brand-primary/10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none z-0" />
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 py-8 items-center sticky top-0 h-screen transition-all duration-300 relative ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1 text-slate-500 hover:text-brand-primary shadow-sm z-50 transition-all"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className={`flex items-center gap-3 mb-12 transition-all duration-300 ${isCollapsed ? 'px-0 justify-center' : 'px-6 w-full'}`}>
          <div className="relative w-10 h-10 flex-shrink-0">
            {/* Custom 'C' Logo with Green Top and Blue Bottom */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-[#7efc00] rounded-t-full" />
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-brand-primary rounded-b-full" />
            <div className="absolute inset-2 bg-white dark:bg-slate-900 rounded-full" />
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-4 h-2 bg-white dark:bg-slate-900" />
          </div>
          {!isCollapsed && (
            <span className="font-extrabold text-xl tracking-tighter uppercase whitespace-nowrap">
              <span className="text-brand-primary">CORREA</span>
              <span className="text-brand-primary/60 font-medium lowercase ml-0.5">pay</span>
            </span>
          )}
        </div>

        <nav className={`flex flex-col gap-2 flex-1 w-full ${isCollapsed ? 'items-center px-2' : 'px-4'}`}>
          {navItems.map((item) => (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => onTabChange(item.id)}
              title={isCollapsed ? item.label : ''}
              className={`flex items-center rounded-xl transition-all duration-200 group ${
                isCollapsed ? 'p-3 justify-center' : 'px-4 py-3 gap-3 w-full'
              } ${
                activeTab === item.id
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-slate-400 hover:text-brand-primary hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <item.icon size={isCollapsed ? 24 : 20} className={activeTab === item.id ? 'text-brand-primary' : ''} />
              {!isCollapsed && <span className="font-bold text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className={`mt-auto flex flex-col gap-4 w-full ${isCollapsed ? 'items-center' : 'px-4'}`}>
          <div className="flex gap-2 w-full">
            <button 
              onClick={toggleTheme}
              title={isDarkMode ? 'Tema Claro' : 'Tema Escuro'}
              className={`flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-brand-primary transition-all flex-1 ${
                isCollapsed ? 'p-3' : 'py-3'
              }`}
            >
              {isDarkMode ? <Sun size={isCollapsed ? 22 : 20} /> : <Moon size={isCollapsed ? 22 : 20} />}
              {!isCollapsed && <span className="font-bold text-sm ml-3">Tema</span>}
            </button>
            <button 
              onClick={onLogout}
              title="Sair"
              className={`flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all ${
                isCollapsed ? 'p-3' : 'px-4 py-3'
              }`}
            >
              <LogOut size={20} />
            </button>
          </div>
          
          <div className={`flex items-center gap-3 h-10 ${isCollapsed ? 'justify-center' : 'px-2'}`}>
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Versão</p>
                <p className="text-[10px] font-bold text-slate-500">V1.0.2</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 pt-[calc(1rem+env(safe-area-inset-top))] bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 flex-shrink-0">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-[#7efc00] rounded-t-full" />
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-brand-primary rounded-b-full" />
            <div className="absolute inset-1.5 bg-white dark:bg-slate-900 rounded-full" />
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-3 h-1.5 bg-white dark:bg-slate-900" />
          </div>
          <span className="font-extrabold tracking-tighter uppercase text-slate-800 dark:text-slate-100">
            <span className="text-brand-primary">CORREA</span>
            <span className="text-brand-primary/60 font-medium lowercase ml-0.5">pay</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="p-2 text-slate-500 dark:text-slate-400"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            onClick={onLogout}
            className="p-2 text-slate-500 dark:text-red-500"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full overflow-x-hidden">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-[calc(0.5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-[320px]">
        <nav className="glass-pill rounded-full p-1.5 flex justify-around items-center glow-blue">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative flex flex-col items-center gap-1 p-2 rounded-full transition-all flex-1 ${
                  isActive 
                    ? 'text-brand-primary' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute inset-0 bg-brand-primary/10 rounded-full"
                    transition={{ type: 'spring', bounce: 0.35, duration: 0.6 }}
                  />
                )}
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
                <span className="text-[10px] font-black uppercase tracking-tighter relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
      {/* Padding for bottom nav on mobile */}
      <div className="md:hidden h-16 w-full" />
    </div>
  );
}
