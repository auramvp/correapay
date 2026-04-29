import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { PaymentOrder, Client } from '../types';
import { CreditCard, Plus, Trash2, Search, Filter, X, Calculator, ArrowUpRight, Send, Building2, UploadCloud, FileText, Eye, Edit2, Download, Calendar, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OrdersProps {
  orders: PaymentOrder[];
  clients: Client[];
  onAdd: (order: Omit<PaymentOrder, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, order: Partial<Omit<PaymentOrder, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
}

export default function Orders({ orders, clients, onAdd, onUpdate, onDelete }: OrdersProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<PaymentOrder | null>(null);
  const [editingOrder, setEditingOrder] = useState<PaymentOrder | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // New Order Form state
  const [clientId, setClientId] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [feePercentage, setFeePercentage] = useState('5');
  const [useFixedFee, setUseFixedFee] = useState(false);
  const [fixedFeeStr, setFixedFeeStr] = useState('');
  const [shippingType, setShippingType] = useState<'PIX' | 'TED' | 'DOC'>('PIX');
  const [recipient, setRecipient] = useState('');
  const [bank, setBank] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const maskCurrency = (val: string) => {
    const value = val.replace(/\D/g, "");
    if (!value) return "";
    const floatValue = parseFloat(value) / 100;
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
    }).format(floatValue);
  };

  const parseCurrency = (val: string | number) => {
    if (typeof val === 'number') return val;
    return parseFloat(val.replace(/\./g, "").replace(",", ".")) || 0;
  };

  const resetForm = () => {
    setClientId('');
    setAmountStr('');
    setFixedFeeStr('');
    setRecipient('');
    setBank('');
    setReceiptFile(null);
    setEditingOrder(null);
  };

  // Populate form if editing
  useEffect(() => {
    if (editingOrder) {
      setClientId(editingOrder.clientId);
      setAmountStr(maskCurrency(editingOrder.amount.toFixed(2).replace(".", "")));
      
      const expectedPercentageFee = (editingOrder.amount * (parseFloat(feePercentage) || 0) / 100);
      if (Math.abs(expectedPercentageFee - editingOrder.fee) > 0.01) {
        setUseFixedFee(true);
        setFixedFeeStr(maskCurrency(editingOrder.fee.toFixed(2).replace(".", "")));
      } else {
        setUseFixedFee(false);
      }
      setShippingType(editingOrder.shippingType || 'PIX');
      setRecipient(editingOrder.destination?.recipient || '');
      setBank(editingOrder.destination?.bank || '');
      setReceiptFile(null);
    } else {
      resetForm();
    }
  }, [editingOrder]);

  const amount = parseCurrency(amountStr);
  const calculatedFee = useFixedFee ? parseCurrency(fixedFeeStr) : (amount * (parseFloat(feePercentage) || 0) / 100);
  const total = amount + calculatedFee;

  const playSuccessSound = () => {
    const audio = new Audio('/sound/picpay_coin.mp3');
    audio.volume = 1.0;
    audio.play().catch(e => console.log('Audio play blocked or failed:', e));
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#4dff00', '#ffffff'],
      zIndex: 100
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || amount <= 0) return;
    
    let finalReceiptUrl = editingOrder?.receiptUrl || undefined;

    if (receiptFile) {
      // Convert to Base64 for persistence in this demo/MVP
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(receiptFile);
      });
      finalReceiptUrl = await base64Promise;
    }
    
    const orderData = {
      clientId,
      amount,
      fee: calculatedFee,
      total,
      status: (editingOrder?.status || 'completed') as 'pending' | 'completed' | 'cancelled',
      shippingType,
      destination: recipient || bank ? { recipient, bank } : undefined,
      receiptUrl: finalReceiptUrl
    };

    if (editingOrder) {
      onUpdate(editingOrder.id, orderData);
      setIsModalOpen(false);
      setEditingOrder(null);
    } else {
      onAdd(orderData);
      // Trigger confetti for new orders
      triggerConfetti();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      // Clear form
      resetForm();
    }
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (order: PaymentOrder) => {
    setEditingOrder(order);
    setIsModalOpen(true);
  };

  const filteredOrders = orders.filter(o => {
    const client = clients.find(c => c.id === o.clientId);
    const matchesSearch = client?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         o.id.includes(searchTerm);
    
    let matchesDate = true;
    if (startDate) {
      const start = new Date(startDate).getTime();
      matchesDate = matchesDate && (o.createdAt >= start);
    }
    if (endDate) {
      const end = new Date(endDate).getTime() + 86400000; // include full end day
      matchesDate = matchesDate && (o.createdAt <= end);
    }

    return matchesSearch && matchesDate;
  });

  const getFirstTwoNames = (fullName: string) => {
    const names = fullName.trim().split(/\s+/);
    if (names.length <= 2) return fullName;
    return `${names[0]} ${names[1]}`;
  };

  const handleDeleteOrder = (id: string) => {
    onDelete(id);
    setViewingOrder(null);
    setShowConfirmDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Ordens de Pagamento</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Histórico completo de depósitos e taxas coletadas.</p>
        </div>
        <button 
          id="btn-new-order"
          onClick={handleOpenAddModal}
          className="bg-brand-primary hover:brightness-110 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-primary/10 active:scale-95 text-sm"
        >
          <Plus size={18} />
          Nova Operação
        </button>
      </div>

      <div className="card-bento overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col items-center gap-3 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex flex-col md:flex-row items-center gap-3 w-full">
            <div className="flex-1 flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 w-full">
              <Search size={18} className="text-slate-400 dark:text-slate-500" />
              <input 
                type="text" 
                placeholder="Localizar por cliente..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all text-xs font-bold w-full sm:w-auto justify-center uppercase tracking-wider ${showFilters ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' : 'text-slate-500 dark:text-slate-400'}`}
            >
              <Filter size={14} />
              Filtros {showFilters ? 'Ativos' : ''}
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="w-full overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 px-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={12} />
                      Data Inicial
                    </label>
                    <input 
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary outline-none text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={12} />
                      Data Final
                    </label>
                    <input 
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary outline-none text-xs"
                    />
                  </div>
                  {(startDate || endDate) && (
                    <button 
                      onClick={() => { setStartDate(''); setEndDate(''); }}
                      className="md:col-span-2 text-[10px] font-bold text-red-500 uppercase tracking-widest hover:underline text-center mt-2"
                    >
                      Limpar Filtros de Data
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          {/* Mobile List View */}
          <div className="md:hidden divide-y divide-slate-50 dark:divide-slate-800">
            {filteredOrders.length > 0 ? 
              filteredOrders.map((order) => {
                const client = clients.find(c => c.id === order.clientId);
                return (
                  <div key={order.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <div 
                      className="min-w-0 cursor-pointer group"
                      onClick={() => setViewingOrder(order)}
                    >
                      <p className="font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-brand-primary transition-colors">
                        {client ? getFirstTwoNames(client.name) : '---'}
                      </p>
                      <p className="text-sm font-black text-brand-primary font-mono">
                        {formatCurrency(order.amount)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setViewingOrder(order)}
                        className="px-3 py-1.5 bg-brand-primary/10 text-brand-primary rounded-lg text-xs font-bold transition-all"
                      >
                        Visualizar
                      </button>
                      <button 
                        onClick={() => handleOpenEditModal(order)}
                        className="p-1.5 text-slate-400 hover:text-amber-500 transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
             : 
              <div className="p-8 text-center text-slate-400 text-sm">
                Nenhuma ordem encontrada.
              </div>
            }
          </div>

          {/* Desktop Table View */}
          <table className="hidden md:table w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Cliente / Envio</th>
                <th className="px-6 py-3">Responsável</th>
                <th className="px-6 py-3">Valor</th>
                <th className="px-6 py-3">Taxa (Lucro)</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-sm">
              {filteredOrders.length > 0 ? 
                filteredOrders.map((order) => {
                  const client = clients.find(c => c.id === order.clientId);
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td 
                        className="px-6 py-4 cursor-pointer group"
                        onClick={() => setViewingOrder(order)}
                      >
                        <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-primary group-hover:underline transition-all">{client?.name || '---'}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-brand-primary/10 text-brand-primary px-1.5 py-0.5 rounded font-black">{order.shippingType || 'PIX'}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tracking-tighter uppercase">ID: {order.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">
                            {order.responsibleName?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-tight">
                            {order.responsibleName?.split('@')[0] || 'Sistema'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                        {formatCurrency(order.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-brand-success font-bold font-mono">
                            {formatCurrency(order.fee)}
                          </span>
                          <span className="text-[9px] text-brand-success/60 font-black uppercase tracking-tighter">Lucro</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white font-mono">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => setViewingOrder(order)}
                            title="Ver Detalhes"
                            className="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => handleOpenEditModal(order)}
                            title="Editar Ordem"
                            className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10 rounded-lg transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => onDelete(order.id)}
                            title="Excluir Ordem"
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
               : 
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Nenhuma ordem encontrada.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* New Order Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg p-8 relative z-10 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] overflow-y-auto scrollbar-hide"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8 text-slate-900 dark:text-white">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-900 dark:bg-brand-primary text-white rounded-xl">
                    <Calculator size={20} />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    {editingOrder ? 'Editar Operação' : 'Novo Depósito'}
                  </h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">Selecionar Cliente</label>
                    <select 
                      required
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary outline-none appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_1rem_center] bg-no-repeat transition-all text-sm"
                    >
                      <option value="">Escolha um cliente...</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">Valor do Depósito (R$)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-2.5 text-slate-400 font-mono text-sm">R$</span>
                      <input 
                        type="text" 
                        inputMode="numeric"
                        required
                        value={amountStr}
                        onChange={(e) => setAmountStr(maskCurrency(e.target.value))}
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary outline-none font-mono transition-all text-sm"
                        placeholder="0,00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">Tipo de Envio</label>
                    <div className="grid grid-cols-3 gap-2 h-10">
                      {['PIX', 'TED', 'DOC'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setShippingType(type as any)}
                          className={`rounded-lg text-[10px] font-black transition-all border ${
                            shippingType === type 
                              ? 'bg-brand-primary border-brand-primary text-white shadow-sm' 
                              : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Configuração de Taxas</label>
                    <div className="flex bg-slate-200 dark:bg-slate-800 rounded-lg p-0.5 gap-0.5">
                      <button 
                        type="button"
                        onClick={() => setUseFixedFee(false)}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${!useFixedFee ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-primary' : 'text-slate-500'}`}
                      >
                        %
                      </button>
                      <button 
                        type="button"
                        onClick={() => setUseFixedFee(true)}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${useFixedFee ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-primary' : 'text-slate-500'}`}
                      >
                        FIXO
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Valor da Taxa</span>
                    {useFixedFee ? (
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-[10px] text-slate-400 font-mono">R$</span>
                        <input 
                          type="text" 
                          inputMode="numeric"
                          className="w-24 pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-right text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-brand-primary"
                          value={fixedFeeStr}
                          onChange={(e) => setFixedFeeStr(maskCurrency(e.target.value))}
                        />
                      </div>
                    ) : (
                      <div className="relative">
                        <input 
                          type="number" 
                          className="w-20 pl-3 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-right text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-brand-primary"
                          value={feePercentage}
                          onChange={(e) => setFeePercentage(e.target.value)}
                        />
                        <span className="absolute right-3 top-2 text-[10px] text-slate-400 font-mono">%</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 overflow-hidden">
                    <div className="space-y-1 w-full sm:w-auto">
                      <p className="text-[10px] font-black text-brand-success uppercase tracking-widest bg-brand-success/10 px-2 py-0.5 rounded inline-block">Lucro Estimado</p>
                      <p className="text-lg sm:text-xl font-black text-brand-success font-mono tracking-tighter truncate">
                        +{formatCurrency(calculatedFee)}
                      </p>
                    </div>
                    <div className="text-left sm:text-right space-y-0.5 w-full sm:w-auto">
                      <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tighter truncate">{formatCurrency(total)}</p>
                      <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Total a Cobrar</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 size={14} className="text-brand-primary" />
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Informações de Destino (Opcional)</label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary outline-none transition-all text-xs"
                      placeholder="Nome do Destinatário"
                    />
                    <input 
                      type="text" 
                      value={bank}
                      onChange={(e) => setBank(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary outline-none transition-all text-xs"
                      placeholder="Banco de Destino"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <UploadCloud size={14} className="text-brand-primary" />
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Anexar Comprovante (Opcional)</label>
                  </div>
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all group overflow-hidden">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {receiptFile ? (
                        <div className="flex items-center gap-2 text-brand-success font-bold text-xs">
                          <FileText size={16} />
                          <span className="truncate max-w-[200px]">{receiptFile.name}</span>
                        </div>
                      ) : (
                        <>
                          <UploadCloud size={20} className="text-slate-400 group-hover:text-brand-primary transition-colors" />
                          <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-500 font-bold">Clique para fazer upload ou arraste</p>
                        </>
                      )}
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                      accept="image/*,.pdf"
                    />
                  </label>
                </div>

                  <button 
                    type="submit"
                    disabled={!clientId || amount <= 0}
                    className="w-full bg-brand-success disabled:bg-slate-300 dark:disabled:bg-slate-800 text-slate-900 py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-brand-success/20 active:scale-[0.98] mt-2 flex items-center justify-center gap-3 group"
                  >
                    {editingOrder ? 'Salvar Alterações' : 'Confirmar Depósito'}
                    <ArrowUpRight size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* View Order Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] bg-brand-success text-slate-900 px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 font-black uppercase tracking-tight glow-blue"
          >
            <div className="bg-black/10 p-2 rounded-full">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-xs opacity-80 leading-none mb-1">Operação Realizada</p>
              <p className="text-xl leading-none">Depósito Confirmado!</p>
            </div>
          </motion.div>
        )}

        {viewingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingOrder(null)}
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
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Detalhes da Ordem</h3>
                <button onClick={() => setViewingOrder(null)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">Total da Ordem</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white font-mono leading-none">{formatCurrency(viewingOrder.total)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-brand-success font-black uppercase tracking-widest leading-none">Lucro Bruto</p>
                    <p className="text-sm font-bold text-brand-success font-mono">+{formatCurrency(viewingOrder.fee)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm py-2 border-b border-slate-50 dark:border-slate-800">
                    <span className="text-slate-400">Cliente</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{clients.find(c => c.id === viewingOrder.clientId)?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm py-2 border-b border-slate-50 dark:border-slate-800">
                    <span className="text-slate-400">Data</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{new Date(viewingOrder.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm py-2 border-b border-slate-50 dark:border-slate-800">
                    <span className="text-slate-400">Tipo de Envio</span>
                    <span className="font-black text-brand-primary">{viewingOrder.shippingType || 'PIX'}</span>
                  </div>
                  {viewingOrder.destination && (
                    <div className="space-y-2 py-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Destino</span>
                       <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg text-xs space-y-1">
                          <p className="flex justify-between uppercase"><span>Favorecido:</span> <span className="font-bold">{viewingOrder.destination.recipient}</span></p>
                          <p className="flex justify-between uppercase"><span>Banco:</span> <span className="font-bold">{viewingOrder.destination.bank}</span></p>
                       </div>
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  {viewingOrder.receiptUrl ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-brand-success/10 border border-brand-success/20 rounded-xl flex items-center gap-3">
                        <FileText size={20} className="text-brand-success" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-brand-success dark:text-brand-success truncate">Comprovante anexado</p>
                          <p className="text-[9px] text-brand-success/60 uppercase">Documento validado</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => {
                            if (!viewingOrder.receiptUrl) return;
                            if (viewingOrder.receiptUrl.startsWith('mock_url_')) {
                              alert('Este é um registro antigo com um comprovante fictício. Novos comprovantes anexados funcionarão corretamente.');
                            } else {
                              window.open(viewingOrder.receiptUrl, '_blank');
                            }
                          }}
                          className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 py-2.5 rounded-xl text-xs font-bold transition-all"
                        >
                          <Eye size={14} />
                          Visualizar
                        </button>
                        <a 
                          href={viewingOrder.receiptUrl} 
                          onClick={(e) => {
                            if (viewingOrder.receiptUrl?.startsWith('mock_url_')) {
                              e.preventDefault();
                              alert('Este é um registro antigo com um comprovante fictício.');
                            }
                          }}
                          download={`comprovante_${viewingOrder.id}.pdf`}
                          className="flex items-center justify-center gap-2 bg-brand-primary text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-brand-primary/20"
                        >
                          <Download size={14} />
                          Baixar PDF
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl flex flex-col items-center gap-2 text-slate-400 italic text-xs">
                      <UploadCloud size={20} strokeWidth={1} />
                      Nenhum comprovante anexado a esta ordem.
                    </div>
                  )}
                </div>

                {/* Deletion Zone */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                  {showConfirmDelete === viewingOrder.id ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/20"
                    >
                      <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-3 text-center">Tem certeza que deseja excluir esta ordem? Esta ação é irreversível.</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => setShowConfirmDelete(null)}
                          className="py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={() => handleDeleteOrder(viewingOrder.id)}
                          className="py-2 bg-red-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-600/20"
                        >
                          Confirmar Exclusão
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <button 
                      onClick={() => setShowConfirmDelete(viewingOrder.id)}
                      className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 py-3 rounded-xl text-xs font-bold transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                    >
                      <Trash2 size={16} />
                      Excluir Ordem de Pagamento
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
