import React, { useState, useEffect } from 'react';
import { Client } from '../types';
import { UserPlus, Search, Trash2, Phone, CreditCard, X, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ClientsProps {
  clients: Client[];
  onAdd: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, client: Partial<Omit<Client, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
}

export default function Clients({ clients, onAdd, onUpdate, onDelete }: ClientsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [gender, setGender] = useState<'M' | 'F' | 'Other'>('M');
  const [birthDate, setBirthDate] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  
  // Address fields
  const [street, setStreet] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');

  // Effect to populate form when editing
  useEffect(() => {
    if (editingClient) {
      setName(editingClient.name);
      setCpf(editingClient.cpf || '');
      setGender(editingClient.gender);
      setBirthDate(editingClient.birthDate);
      setWhatsapp(editingClient.whatsapp);
      setEmail(editingClient.email);
      setStreet(editingClient.address?.street || '');
      setNeighborhood(editingClient.address?.neighborhood || '');
      setCity(editingClient.address?.city || '');
      setZip(editingClient.address?.zip || '');
    } else {
      setName('');
      setCpf('');
      setGender('M');
      setBirthDate('');
      setWhatsapp('');
      setEmail('');
      setStreet('');
      setNeighborhood('');
      setCity('');
      setZip('');
    }
  }, [editingClient]);

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .substring(0, 15);
    }
    return numbers.substring(0, 11);
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 9);
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .substring(0, 14);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !whatsapp || !email || !birthDate || !cpf) return;
    
    const clientData = { 
      name, 
      cpf,
      gender, 
      birthDate, 
      whatsapp, 
      email,
      address: street ? {
        street,
        neighborhood,
        city,
        zip
      } : undefined
    };

    if (editingClient) {
      onUpdate(editingClient.id, clientData);
    } else {
      onAdd(clientData);
    }

    // Reset form
    setEditingClient(null);
    setIsModalOpen(false);
  };

  const handleOpenAddModal = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.whatsapp.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cpf?.includes(searchTerm)
  );

  const handleDeleteClient = (id: string) => {
    onDelete(id);
    setViewingClient(null);
    setShowConfirmDelete(null);
  };

  const getFirstTwoNames = (fullName: string) => {
    const names = fullName.trim().split(/\s+/);
    if (names.length <= 2) return fullName;
    return `${names[0]} ${names[1]}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Clientes Cadastrados</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Gerencie quem utiliza seus serviços bancários.</p>
        </div>
        <button 
          id="btn-add-client"
          onClick={handleOpenAddModal}
          className="bg-brand-primary hover:brightness-110 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-primary/20 active:scale-95 text-sm"
        >
          <UserPlus size={18} />
          Cadastrar Novo
        </button>
      </div>

      <div className="card-bento overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-800/30">
          <Search size={18} className="text-slate-400 dark:text-slate-500" />
          <input 
            type="text" 
            placeholder="Pesquisar por nome, zap ou email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm"
          />
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          {/* Mobile List View */}
          <div className="md:hidden divide-y divide-slate-50 dark:divide-slate-800">
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <div key={client.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div 
                    className="min-w-0 cursor-pointer group"
                    onClick={() => setViewingClient(client)}
                  >
                    <p className="font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-brand-primary transition-colors">
                      {getFirstTwoNames(client.name)}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono tracking-wider">
                      CPF: {client.cpf || '---'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setViewingClient(client)}
                      className="px-3 py-1.5 bg-brand-primary/10 text-brand-primary rounded-lg text-xs font-bold transition-all"
                    >
                      Visualizar
                    </button>
                    <button 
                      onClick={() => handleOpenEditModal(client)}
                      className="p-1.5 text-slate-400 hover:text-amber-500 transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm">
                Nenhum cliente encontrado.
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <table className="hidden md:table w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3">CPF</th>
                <th className="px-6 py-3">WhatsApp / Email</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-sm">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-brand-primary/10 text-brand-primary rounded-lg flex items-center justify-center font-extrabold flex-shrink-0">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div 
                          className="min-w-0 cursor-pointer group"
                          onClick={() => setViewingClient(client)}
                        >
                          <p className="font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-brand-primary group-hover:underline transition-all">
                            {client.name}
                          </p>
                          <p className="text-[10px] text-slate-400 uppercase font-mono">{client.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {client.cpf || '---'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <Phone size={12} className="text-brand-success" />
                          <span className="text-xs font-medium">{client.whatsapp}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-500">
                          <span className="text-[10px] lowercase">{client.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setViewingClient(client)}
                          className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                          title="Ver Detalhes"
                        >
                          <Search size={16} />
                        </button>
                        <button 
                          onClick={() => handleOpenEditModal(client)}
                          className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10 rounded-lg transition-all"
                          title="Editar Cliente"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => onDelete(client.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          title="Excluir Cliente"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Client Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl p-8 relative z-10 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] overflow-y-auto scrollbar-hide"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight text-center w-full">
                  {editingClient ? 'Editar Cliente' : 'Cadastro de Cliente'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="absolute right-8 top-8 text-slate-400 hover:text-slate-600 p-1">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info Column */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-brand-primary uppercase tracking-widest border-l-4 border-brand-primary pl-3">Dados Pessoais</h3>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-widest">Nome Completo</label>
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary outline-none transition-all text-sm"
                        placeholder="Nome completo do cliente"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-widest">CPF</label>
                      <input 
                        type="text" 
                        required
                        value={cpf}
                        onChange={(e) => setCpf(formatCPF(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary outline-none transition-all text-sm font-mono"
                        placeholder="000.000.000-00"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-widest">Sexo</label>
                        <select 
                          value={gender}
                          onChange={(e) => setGender(e.target.value as any)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary outline-none transition-all text-sm appearance-none"
                        >
                          <option value="M">Masculino</option>
                          <option value="F">Feminino</option>
                          <option value="Other">Outro</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-widest">Nascimento</label>
                        <input 
                          type="date" 
                          required
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary outline-none transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-widest">WhatsApp</label>
                      <div className="relative">
                        <Phone size={14} className="absolute left-4 top-3 text-slate-400" />
                        <input 
                          type="tel" 
                          required
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(formatWhatsApp(e.target.value))}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary outline-none transition-all text-sm"
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-widest">E-mail</label>
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary outline-none transition-all text-sm"
                        placeholder="exemplo@email.com"
                      />
                    </div>
                  </div>

                  {/* Address Column */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest border-l-4 border-slate-200 dark:border-slate-800 pl-3">Endereço (Opcional)</h3>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-widest">Rua / Logradouro</label>
                      <input 
                        type="text" 
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary outline-none transition-all text-sm"
                        placeholder="Nome da rua e número"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-widest">Bairro</label>
                        <input 
                          type="text" 
                          value={neighborhood}
                          onChange={(e) => setNeighborhood(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary outline-none transition-all text-sm"
                          placeholder="Ex: Centro"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-widest">CEP</label>
                        <input 
                          type="text" 
                          value={zip}
                          onChange={(e) => setZip(formatCEP(e.target.value))}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary outline-none transition-all text-sm"
                          placeholder="00000-000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-widest">Cidade</label>
                      <input 
                        type="text" 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary outline-none transition-all text-sm"
                        placeholder="Ex: São Paulo"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    type="submit"
                    className="w-full bg-brand-primary hover:brightness-110 text-white py-4 rounded-xl font-bold transition-all shadow-xl shadow-brand-primary/20 active:scale-[0.98]"
                  >
                    {editingClient ? 'Salvar Alterações' : 'Finalizar Cadastro do Cliente'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Client Modal */}
      <AnimatePresence>
        {viewingClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingClient(null)}
              className="absolute inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-8 relative z-10 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] overflow-y-auto scrollbar-hide"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Detalhes do Cliente</h3>
                <button onClick={() => setViewingClient(null)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
                  <div className="w-14 h-14 bg-brand-primary text-white rounded-xl flex items-center justify-center text-2xl font-black">
                    {viewingClient.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-black text-slate-900 dark:text-white text-lg leading-tight">{viewingClient.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">ID: {viewingClient.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">CPF</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">{viewingClient.cpf || '---'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">WhatsApp</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">{viewingClient.whatsapp}</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Sexo</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{viewingClient.gender === 'M' ? 'Masculino' : viewingClient.gender === 'F' ? 'Feminino' : 'Outro'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Nascimento</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{new Date(viewingClient.birthDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-3">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">E-mail</p>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 lowercase">{viewingClient.email}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Endereço</p>
                    {viewingClient.address ? (
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {viewingClient.address.street}, {viewingClient.address.neighborhood}<br />
                        {viewingClient.address.city} - CEP: {viewingClient.address.zip}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Nenhum endereço cadastrado</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <button 
                    onClick={() => { setViewingClient(null); handleOpenEditModal(viewingClient); }}
                    className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 py-3 rounded-xl text-xs font-bold transition-all"
                  >
                    <Edit2 size={14} />
                    Editar
                  </button>
                  {showConfirmDelete === viewingClient.id ? (
                    <div className="col-span-2 mt-4 bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/20">
                      <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-3 text-center uppercase tracking-tighter">Confirmar exclusão deste cliente?</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => setShowConfirmDelete(null)}
                          className="py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={() => handleDeleteClient(viewingClient.id)}
                          className="py-2 bg-red-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-600/20"
                        >
                          Sim, Excluir
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setShowConfirmDelete(viewingClient.id)}
                      className="flex items-center justify-center gap-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 py-3 rounded-xl text-xs font-bold transition-all"
                    >
                      <Trash2 size={14} />
                      Excluir
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
