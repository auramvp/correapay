import React, { useState } from 'react';
import { Landmark, Mail, Lock, Shield, ArrowRight, AlertCircle, Loader2, UserPlus, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [view, setView] = useState<'login' | 'first-access' | 'forgot-password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (view === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        onLogin();
      } else if (view === 'first-access') {
        if (password !== confirmPassword) {
          throw new Error('As senhas não coincidem.');
        }
        if (password.length < 6) {
          throw new Error('A senha deve ter pelo menos 6 caracteres.');
        }
        await createUserWithEmailAndPassword(auth, email, password);
        await auth.signOut(); // Force them to log in again as per request
        setSuccess('Conta criada com sucesso! Agora você pode entrar.');
        setView('login');
        setPassword('');
        setConfirmPassword('');
      } else if (view === 'forgot-password') {
        if (!email) throw new Error('Por favor, informe seu e-mail.');
        await sendPasswordResetEmail(auth, email);
        setSuccess('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
        setView('login');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const errorCode = err.code || '';
      
      if (err.message === 'As senhas não coincidem.') {
        setError(err.message);
      } else if (
        errorCode === 'auth/user-not-found' || 
        errorCode === 'auth/wrong-password' || 
        errorCode === 'auth/invalid-credential' ||
        err.message.includes('invalid-credential')
      ) {
        setError('Acesso negado. Credenciais inválidas ou usuário não cadastrado.');
      } else if (errorCode === 'auth/email-already-in-use') {
        setError('Este e-mail já possui uma conta ativa.');
      } else if (errorCode === 'auth/too-many-requests') {
        setError('Muitas tentativas. Tente novamente mais tarde.');
      } else if (errorCode === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else if (errorCode === 'auth/invalid-email') {
        setError('O e-mail informado é inválido.');
      } else {
        setError('Ocorreu um erro ao processar sua solicitação. Verifique sua conexão.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 md:p-8 selection:bg-brand-primary selection:text-white overflow-y-auto">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-brand-primary/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md py-8"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            {/* Custom Stylized Logo 'C' - Adjusted Size and Closure */}
            <div className="relative w-11 h-11 flex items-center justify-center">
              {/* Green Top Semi-circle */}
              <div 
                className="absolute inset-0 rounded-full border-[7px] border-transparent border-t-[#7efc00] border-l-[#7efc00]" 
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)', transform: 'rotate(-5deg)' }}
              />
              {/* Blue Bottom Semi-circle */}
              <div 
                className="absolute inset-0 rounded-full border-[7px] border-transparent border-b-[#0033ff] border-l-[#0033ff]" 
                style={{ clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)', transform: 'rotate(-5deg)' }}
              />
              {/* Cover for the 'C' opening to make it more closed but still a 'C' */}
              <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-4 h-2 bg-slate-50 dark:bg-slate-950 z-10" />
            </div>
            <div className="flex items-baseline ml-1">
              <span className="text-4xl font-black text-[#0033ff] tracking-tighter uppercase">CORREA</span>
              <span className="text-3xl font-normal text-[#9db2ff] dark:text-[#a5b4fc] tracking-tight ml-1">pay</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border border-slate-200 dark:border-slate-800 p-8 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent opacity-50" />
          
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              {view === 'login' ? 'Bem-vindo de volta' : view === 'first-access' ? 'Primeiro Acesso' : 'Recuperar Senha'}
            </h2>
            <p className="text-xs text-slate-500 font-medium tracking-tight">
              {view === 'login' 
                ? 'Insira suas credenciais para acessar o painel Correa.' 
                : view === 'first-access'
                ? 'Defina sua senha para ativar sua conta no sistema.'
                : 'Insira seu e-mail para receber as instruções de recuperação.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Credencial de Acesso</label>
              <div className="relative group">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${error ? 'text-red-400' : 'text-slate-300 group-focus-within:text-brand-primary'}`} size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary outline-none transition-all font-bold text-sm"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {view !== 'forgot-password' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    {view === 'first-access' ? 'Crie sua Senha' : 'Chave de Segurança'}
                  </label>
                  {view === 'login' && (
                    <button 
                      type="button" 
                      onClick={() => setView('forgot-password')}
                      className="text-[10px] font-black text-brand-primary hover:text-brand-primary/80 uppercase tracking-widest transition-colors"
                    >
                      Esqueci a senha
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${error ? 'text-red-400' : 'text-slate-300 group-focus-within:text-brand-primary'}`} size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary outline-none transition-all font-bold text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-primary transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {view === 'first-access' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Confirme sua Senha</label>
                <div className="relative group">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${error ? 'text-red-400' : 'text-slate-300 group-focus-within:text-brand-primary'}`} size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary outline-none transition-all font-bold text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-primary transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 p-4 rounded-2xl flex items-center gap-3"
                >
                  <AlertCircle size={18} className="text-red-500 shrink-0" />
                  <p className="text-[10px] sm:text-xs font-bold text-red-600 dark:text-red-400 leading-tight">
                    {error}
                  </p>
                </motion.div>
              )}
              {success && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 p-4 rounded-2xl flex items-center gap-3"
                >
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                  <p className="text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 leading-tight">
                    {success}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4 pt-2">
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 dark:bg-brand-primary text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 dark:shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 overflow-hidden text-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span className="text-[10px]">Processando...</span>
                  </>
                ) : (
                  <>
                    {view === 'login' ? 'Entra' : view === 'first-access' ? 'Ativar Conta' : 'Enviar Instruções'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {view === 'login' ? (
                <button 
                  type="button"
                  onClick={() => {
                    setView('first-access');
                    setError(null);
                    setSuccess(null);
                  }}
                  className="w-full text-xs font-black text-slate-400 hover:text-brand-primary uppercase tracking-widest transition-colors py-2"
                >
                  Primeiro acesso?
                </button>
              ) : (
                <button 
                  type="button" 
                  onClick={() => {
                    setView('login');
                    setError(null);
                    setSuccess(null);
                  }}
                  className="w-full text-xs font-black text-slate-400 hover:text-brand-primary uppercase tracking-widest transition-colors py-2"
                >
                  Voltar para o login
                </button>
              )}
            </div>
          </form>
        </div>

        <p className="text-center mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Todos os direitos reservados 2026 CorreaPay
        </p>
      </motion.div>
    </div>
  );
}
