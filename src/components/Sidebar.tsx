import React from 'react';
import { useAppView } from '@/views/useAppView';
import { Home, Settings, Box, Clipboard, Tag, BarChart2, DollarSign } from 'lucide-react';

const items = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'configuracoes', label: 'Configurações', icon: Settings },
  { id: 'insumos', label: 'Insumos', icon: Box },
  { id: 'produtos', label: 'Produtos', icon: Tag },
  { id: 'receitas', label: 'Receitas', icon: Tag },
  { id: 'preco', label: 'Formação de Preço', icon: DollarSign },
  { id: 'vendas', label: 'Vendas', icon: Clipboard },
  { id: 'relatorios', label: 'Relatórios', icon: BarChart2 },
];

export const Sidebar: React.FC = () => {
  const { view, setView } = useAppView();

  return (
    <aside className="w-full md:w-64 border-r border-slate-800 bg-slate-900 text-white p-4">
      <div className="mb-6 px-2">
        <h2 className="text-xl font-extrabold">Dindin Gourmet</h2>
        <p className="text-sm text-slate-300">Mini ERP</p>
      </div>
      <nav className="flex flex-col gap-1">
        {items.map((it) => {
          const Icon = it.icon;
          const active = view === it.id;
          return (
            <button
              key={it.id}
              onClick={() => setView(it.id)}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-slate-800 ${active ? 'bg-slate-700 font-semibold' : 'text-slate-300'}`}
            >
              <Icon className="h-4 w-4 text-slate-200" />
              {it.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
