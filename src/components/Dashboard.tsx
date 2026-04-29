import React from 'react';
import { DashboardStats, PaymentOrder, Client } from '../types';
import { TrendingUp, Users, Wallet, Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  stats: DashboardStats;
  recentOrders: PaymentOrder[];
  clients: Client[];
}

export default function Dashboard({ stats, recentOrders, clients }: DashboardProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatK = (val: number) => {
    if (val < 1000) return formatCurrency(val);
    const kValue = val / 1000;
    const formatted = kValue % 1 === 0 
      ? kValue.toFixed(0) 
      : kValue.toFixed(1).replace('.', ',');
    return `R$ ${formatted}K`;
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Painel de Gestão</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Visão geral das suas movimentações financeiras.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-6 h-auto md:h-[650px]">
        {/* Bento Card 1: Profits (Prominent Modern Design) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="md:col-span-2 md:row-span-1 card-bento p-8 flex flex-col justify-between hover:glow-blue transition-all duration-500 group relative overflow-hidden bg-gradient-to-br from-brand-success/10 via-transparent to-brand-primary/5"
        >
          <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none rotate-12">
            <TrendingUp size={240} className="text-brand-success" />
          </div>
          
          <div className="relative z-10 flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <span className="p-3 bg-brand-success/20 text-brand-success rounded-2xl shadow-inner">
                <TrendingUp size={24} />
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em]">Lucro Consolidado</p>
            </div>
          </div>
          
          <div className="relative z-10 mt-8">
            <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
              {formatCurrency(stats.totalFees)}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="px-2 py-1 bg-brand-success/10 text-brand-success text-[10px] font-black rounded-lg border border-brand-success/20">
                +12.4%
              </span>
              <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Desempenho este mês</p>
            </div>
          </div>
        </motion.div>

        {/* Bento Card 2: Client Count (Reordered) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 md:row-span-1 card-bento p-8 flex items-center justify-between bg-white dark:bg-slate-900 overflow-hidden relative border border-slate-200 dark:border-slate-800 group hover:glow-blue transition-all"
        >
          <div className="z-10">
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Base de Dados</p>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {stats.activeClients} <span className="text-xl font-bold text-slate-400">Clientes Ativos</span>
            </h3>
            <div className="mt-6 flex items-center gap-4">
              <div className="flex -space-x-3">
                {clients.slice(0, 4).map((c, i) => (
                  <div key={c.id} className={`w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-brand-primary z-${40-(i*10)} group-hover:translate-x-1 transition-transform`}>
                    {c.name.charAt(0)}
                  </div>
                ))}
                {stats.activeClients > 4 && (
                  <div className="w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-brand-primary flex items-center justify-center text-[10px] font-black text-white z-0">
                    +{stats.activeClients - 4}
                  </div>
                )}
              </div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                Crescimento constante <br/>da rede
              </p>
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-slate-50/50 dark:bg-slate-800/10 flex items-center justify-center border-l border-slate-100 dark:border-slate-800/50">
             <Users size={48} className="text-slate-200 dark:text-slate-800 group-hover:text-brand-primary/20 transition-colors" />
          </div>
        </motion.div>

        {/* Bento Card 3: Recent Orders */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-3 md:row-span-2 card-bento overflow-hidden flex flex-col"
        >
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/20">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Calendar size={18} className="text-brand-primary" />
              Últimas Atividades
            </h3>
            <button className="text-xs text-brand-primary font-bold hover:underline">Ver Histórico</button>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 text-[9px] sm:text-[10px] uppercase tracking-wider font-bold">
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="px-4 sm:px-6 py-3">Cliente</th>
                  <th className="px-4 sm:px-6 py-3 hidden xs:table-cell">Data</th>
                  <th className="px-4 sm:px-6 py-3 text-right">Valor / Lucro</th>
                </tr>
              </thead>
              <tbody className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 divide-y divide-slate-50 dark:divide-slate-800">
                {recentOrders.map((order) => {
                  const client = clients.find(c => c.id === order.clientId);
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 sm:px-6 py-3 font-bold text-slate-800 dark:text-slate-200 truncate max-w-[100px] sm:max-w-none">
                        {client?.name || 'Manual'}
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-slate-400 dark:text-slate-500 text-[10px] hidden xs:table-cell">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-mono font-black text-slate-900 dark:text-white mobile:text-xs">
                            {formatK(order.amount)}
                          </span>
                          <span className="font-mono text-[9px] sm:text-[10px] text-brand-success font-black tracking-tighter">
                            +{formatK(order.fee)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Bento Card 4: Volume (Moved to side) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="md:col-span-1 md:row-span-1 card-bento p-6 flex flex-col justify-between hover:glow-blue transition-all duration-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
        >
          <div className="flex flex-col gap-1">
            <span className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg w-fit">
              <Wallet size={20} />
            </span>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-4">Volume Depositado</p>
          </div>
          <div className="mt-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{formatCurrency(stats.totalVolume)}</h2>
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase mt-1">Total Movimentado</p>
          </div>
        </motion.div>

        {/* Bento Card 5: Top Clients */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="md:col-span-1 md:row-span-1 card-bento p-6 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
        >
          <h3 className="font-black text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2 text-xs uppercase tracking-widest">
            <Users size={16} className="text-brand-primary" />
            Top Clientes
          </h3>
          <div className="flex flex-col gap-3">
            {clients.slice(0, 3).map(client => (
              <div key={client.id} className="flex items-center gap-2 group cursor-pointer hover:translate-x-1 transition-transform">
                <div className="w-7 h-7 rounded-full bg-brand-primary/10 flex items-center justify-center font-black text-brand-primary text-[10px]">
                  {client.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 truncate leading-none uppercase">{client.name}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
