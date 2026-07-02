import React, { useState } from 'react';
import { useStore } from '@/context/store';
import { useAppView } from '@/views/useAppView';
import { formatCurrency } from '@/utils/calculations';

const Relatorios: React.FC = () => {
  const { sales, products } = useStore();
  const { setView } = useAppView();
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  const filteredSales = sales.filter((sale) => {
    const d = new Date(sale.date).toISOString().split('T')[0];
    if (fromDate && d < fromDate) return false;
    if (toDate && d > toDate) return false;
    return true;
  });

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.price * sale.qty, 0);
  const totalItems = filteredSales.reduce((sum, sale) => sum + sale.qty, 0);
  const totalSales = filteredSales.length;
  const averageTicket = totalSales ? totalRevenue / totalSales : 0;
  const salesByProduct = filteredSales.reduce((acc, sale) => {
    const productName = products.find((p) => p.id === sale.productId)?.name || 'Produto desconhecido';
    acc[productName] = (acc[productName] || 0) + sale.qty;
    return acc;
  }, {} as Record<string, number>);
  const topProducts = Object.entries(salesByProduct)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const recentSales = [...filteredSales].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <p className="text-sm text-gray-500">Visão de faturamento e desempenho das vendas.</p>
        </div>
        <button
          onClick={() => setView('vendas')}
          className="px-4 py-2 rounded bg-yellow-500 text-black font-bold"
        >
          Registrar nova venda
        </button>
      </div>

      <div className="mt-4 flex gap-3 items-end">
        <div>
          <label className="block text-xs text-gray-500">De</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border p-2 rounded" />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Até</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border p-2 rounded" />
        </div>
        <div>
          <button onClick={() => { setFromDate(''); setToDate(''); }} className="px-3 py-2 rounded bg-slate-200">Limpar</button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Total de vendas</p>
          <p className="mt-2 text-2xl font-semibold">{totalSales}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Receita total</p>
          <p className="mt-2 text-2xl font-semibold">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Itens vendidos</p>
          <p className="mt-2 text-2xl font-semibold">{totalItems}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Ticket médio</p>
          <p className="mt-2 text-2xl font-semibold">{formatCurrency(averageTicket)}</p>
        </div>
      </div>

      {filteredSales.length === 0 ? (
        <div className="mt-6 rounded-xl border bg-white p-4 text-sm text-gray-500">
          Nenhuma venda registrada no período selecionado.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="rounded-xl border bg-white p-4">
            <h2 className="font-semibold">Top produtos</h2>
            <ul className="mt-4 space-y-3 text-sm text-gray-700">
              {topProducts.map(([name, qty]) => (
                <li key={name} className="flex justify-between">
                  <span>{name}</span>
                  <span className="font-semibold">{qty}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border bg-white p-4">
            <h2 className="font-semibold">Vendas recentes</h2>
            <div className="mt-4 space-y-3 text-sm text-gray-700">
              {recentSales.map((sale) => (
                <div key={sale.id} className="rounded-lg border p-3">
                  <div className="flex justify-between gap-4">
                    <span>{products.find((p) => p.id === sale.productId)?.name || '—'}</span>
                    <span className="font-semibold">{formatCurrency(sale.qty * sale.price)}</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {sale.date} • {sale.qty} un • {sale.payment}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Relatorios;
