import React, { useState } from 'react';
import { Landmark, Plus, Trash2, Mail, Shield, User, Search, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthorizedUser } from '../types';

interface CorreaProps {
  users: AuthorizedUser[];
  onAdd: (user: Omit<AuthorizedUser, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, data: Partial<AuthorizedUser>) => void;
  onDelete: (id: string) => void;
}

export default function Correa({ users, onAdd, onUpdate, onDelete }: CorreaProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'editor' | 'viewer'>('editor');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    onAdd({
      name,
      email,
      role,
      status: 'active'
    });

    // Reset
    setName('');
    setEmail('');
    setRole('editor');
    setIsModalOpen(false);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Correa</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Configurações de acesso e autorização de usuários.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-primary text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Adicionar Usuário
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statistics Header for Access */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-2xl">
              <Shield size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{users.length}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Usuários Ativos</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-500 leading-none">{users.filter(u => u.role === 'admin').length}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Administradores</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl">
              <Landmark size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">Seguro</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Ambiente Correa</p>
            </div>
          </div>
        </div>

        {/* User List Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary outline-none transition-all shadow-sm font-bold text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 dark:text-slate-500 text-[10px] uppercase font-black tracking-widest leading-none">
                  <tr>
                    <th className="px-6 py-5">Usuário</th>
                    <th className="px-6 py-5">Nível</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                    <tr key={user.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center font-black text-brand-primary uppercase text-sm">
                            {user.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                          user.role === 'admin' 
                            ? 'bg-brand-primary/10 text-brand-primary' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-tight text-emerald-500">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Ativo
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setConfirmDeleteId(user.id)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 dark:bg-slate-800 rounded-xl"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-300">
                            <Mail size={40} />
                          </div>
                          <p className="text-sm font-bold text-slate-400 italic">Nenhum usuário encontrado</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-[40px] relative overflow-hidden group shadow-2xl shadow-slate-900/40">
            <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none rotate-12">
              <Landmark size={180} />
            </div>
            <div className="relative z-10">
              <div className="p-3 bg-white/10 rounded-2xl w-fit mb-6">
                <Landmark size={24} className="text-[#7efc00]" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-2">Ambiente Correa</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Gerencie as permissões de acesso ao seu ecossistema financeiro. Apenas e-mails autorizados podem visualizar dados sensíveis e realizar movimentações.
              </p>
              <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-[#7efc00] uppercase tracking-[0.2em] mb-1">Status do Registro</p>
                  <p className="text-xs font-bold">100% Criptografado</p>
                </div>
                <div className="p-2 bg-[#7efc00]/10 text-[#7efc00] rounded-full">
                  <Shield size={16} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Níveis de Permissão</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-lg mt-0.5">
                  <Shield size={14} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-tight text-slate-800 dark:text-slate-200">Admin</p>
                  <p className="text-[10px] text-slate-400 font-medium">Controle total sobre clientes, ordens e usuários.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg mt-0.5">
                  <User size={14} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-tight text-slate-800 dark:text-slate-200">Editor</p>
                  <p className="text-[10px] text-slate-400 font-medium">Pode gerenciar ordens e clientes, mas não usuários.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-2xl">
                      <Plus size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Adicionar Usuário</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Correa Authorization</p>
                    </div>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Nome Completo</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-primary transition-colors" size={18} />
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary outline-none transition-all font-bold text-sm"
                        placeholder="Nome do colaborador"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">E-mail do Usuário</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-primary transition-colors" size={18} />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary outline-none transition-all font-bold text-sm"
                        placeholder="email@empresa.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Nível de Acesso</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        type="button"
                        onClick={() => setRole('admin')}
                        className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          role === 'admin' 
                            ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border border-transparent'
                        }`}
                      >
                        Administrador
                      </button>
                      <button 
                        type="button"
                        onClick={() => setRole('editor')}
                        className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          role === 'editor' 
                            ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border border-transparent'
                        }`}
                      >
                        Colaborador
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-brand-primary text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-primary/20 hover:brightness-110 active:scale-[0.98] transition-all mt-4"
                  >
                    Adicionar Usuário
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirm Modal */}
        {confirmDeleteId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
              onClick={() => setConfirmDeleteId(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Revogar Acesso?</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mb-8">
                Este usuário perderá instantaneamente todos os privilégios de acesso ao sistema Correa.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setConfirmDeleteId(null)}
                  className="py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    onDelete(confirmDeleteId);
                    setConfirmDeleteId(null);
                  }}
                  className="py-3.5 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-600/20"
                >
                  Confirmar Revogação
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
