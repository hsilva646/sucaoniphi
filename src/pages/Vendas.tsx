import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@/context/store';
import { useAppView } from '@/views/useAppView';
import { generateId, formatCurrency } from '@/utils/calculations';

const Vendas: React.FC = () => {
  const { products, sales, addSale, updateSale, deleteSale } = useStore();
  const { setView } = useAppView();
  const [form, setForm] = useState<Partial<import('@/types').Sale>>({ date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    if (!form.productId) return;
    const product = products.find((p) => p.id === form.productId);
    if (!product) return;
    if (product.price && product.price > 0) {
      setForm((prev) => ({ ...prev, price: product.price }));
    }
  }, [form.productId, products]);

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.price * sale.qty, 0);
  const totalQuantity = sales.reduce((sum, sale) => sum + sale.qty, 0);
  const averageTicket = sales.length > 0 ? totalRevenue / sales.length : 0;
  const salesByProduct = sales.reduce((acc, sale) => {
    const productName = products.find((p) => p.id === sale.productId)?.name || 'Produto desconhecido';
    acc[productName] = (acc[productName] || 0) + sale.qty;
    return acc;
  }, {} as Record<string, number>);
  const topProducts = Object.entries(salesByProduct)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const save = () => {
    if (!form.productId) {
      alert('Selecione um produto antes de salvar a venda.');
      return;
    }
    if (!form.price || form.price <= 0) {
      alert('Informe um preço válido para a venda.');
      return;
    }

    const s: import('@/types').Sale = {
      id: form.id || generateId(),
      date: form.date || '',
      productId: form.productId,
      qty: form.qty || 1,
      price: form.price,
      payment: form.payment || 'cash',
      client: form.client || '',
    };

    if (form.id) {
      updateSale(form.id, s);
    } else {
      addSale(s);
    }

    setForm({ date: new Date().toISOString().split('T')[0] });
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const exportSalesCSV = () => {
    const rows = [
      ['id', 'date', 'productId', 'productName', 'qty', 'price', 'payment', 'client'].join(','),
      ...sales.map((s) => [
        s.id,
        s.date,
        s.productId,
        (products.find((p) => p.id === s.productId)?.name || '').replace(/"/g, '""'),
        String(s.qty),
        String(s.price),
        s.payment,
        (s.client || '').replace(/"/g, '""'),
      ].map((v) => `"${v}"`).join(',')),
    ];
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-export-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length <= 1) return [];
    const headers = lines[0].split(',').map((h) => h.replace(/(^\"|\"$)/g, '').trim());
    const data = lines.slice(1).map((line) => {
      const cols = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((c) => c.replace(/(^\"|\"$)/g, ''));
      const obj: any = {};
      headers.forEach((h, i) => (obj[h] = cols[i] || ''));
      return obj;
    });
    return data;
  };

  const importSalesCSV = (file?: File) => {
    const f = file || (fileInputRef.current && fileInputRef.current.files && fileInputRef.current.files[0]);
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = String(e.target?.result || '');
      try {
        const parsed = parseCSV(text);
        const imported = parsed.map((r: any) => ({
          id: r.id || generateId(),
          date: r.date || new Date().toISOString().split('T')[0],
          productId: r.productId,
          qty: parseFloat(r.qty) || 1,
          price: parseFloat(r.price) || 0,
          payment: r.payment || 'cash',
          client: r.client || '',
        } as import('@/types').Sale));
        // merge with existing, keeping existing first
        const merged = [...imported, ...sales];
        // use setSales from store
        const { setSales } = (useStore as any).getState ? (useStore as any).getState() : { setSales: null };
        if (typeof setSales === 'function') setSales(merged);
        else alert('Não foi possível importar: função de store não encontrada.');
      } catch (err) {
        console.error(err);
        alert('Erro ao importar CSV');
      }
    };
    reader.readAsText(f, 'utf-8');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vendas</h1>
          <p className="text-sm text-gray-500">Registre vendas e acompanhe indicadores em Relatórios.</p>
        </div>
        <button
          onClick={() => setView('relatorios')}
          className="px-4 py-2 rounded bg-yellow-500 text-black font-bold"
        >
          Ver Relatórios
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Total de vendas</p>
          <p className="mt-2 text-2xl font-semibold">{sales.length}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Receita total</p>
          <p className="mt-2 text-2xl font-semibold">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Quantidade vendida</p>
          <p className="mt-2 text-2xl font-semibold">{totalQuantity}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Ticket médio</p>
          <p className="mt-2 text-2xl font-semibold">{formatCurrency(averageTicket)}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <select
          value={form.productId || ''}
          onChange={(e) => setForm({ ...form, productId: e.target.value })}
          className="border p-2"
        >
          <option value="">-- selecione produto --</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <input
          type="number"
          className="border p-2"
          value={form.qty || 1}
          onChange={(e) => setForm({ ...form, qty: parseFloat(e.target.value) })}
        />
        <input
          type="number"
          className="border p-2"
          value={form.price || 0}
          onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        <button onClick={save} className="px-4 py-2 rounded bg-emerald-500 text-white">
          {form.id ? 'Atualizar Venda' : 'Salvar Venda'}
        </button>
        {form.id && (
          <button
            onClick={() => setForm({ date: new Date().toISOString().split('T')[0] })}
            className="px-4 py-2 rounded bg-red-500 text-white"
            type="button"
          >
            Cancelar
          </button>
        )}
        <button onClick={() => setView('relatorios')} className="px-4 py-2 rounded bg-slate-200 text-slate-900">Ir para Relatórios</button>
        <button onClick={exportSalesCSV} className="px-4 py-2 rounded bg-slate-100 text-slate-900">Exportar CSV</button>
        <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 rounded bg-slate-100 text-slate-900">Importar CSV</button>
        <input ref={fileInputRef} type="file" accept="text/csv" onChange={(e) => importSalesCSV(e.target.files?.[0])} style={{ display: 'none' }} />
        <button onClick={() => {
          // export full app data as JSON
          const exportJson = (useStore as any).getState().exportData();
          const blob = new Blob([exportJson], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `backup-${new Date().toISOString().slice(0,10)}.json`;
          a.click();
          URL.revokeObjectURL(url);
        }} className="px-4 py-2 rounded bg-slate-100 text-slate-900">Exportar App (JSON)</button>
        <button onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'application/json';
          input.onchange = (ev: any) => {
            const f = ev.target.files[0];
            if (!f) return;
            const r = new FileReader();
            r.onload = () => {
              try {
                const parsed = JSON.parse(String(r.result));
                const data = parsed.data || parsed;
                (useStore as any).getState().importData(data);
                alert('Importação concluída.');
              } catch (err) {
                console.error(err);
                alert('Erro ao importar JSON');
              }
            };
            r.readAsText(f, 'utf-8');
          };
          input.click();
        }} className="px-4 py-2 rounded bg-slate-100 text-slate-900">Importar App (JSON)</button>
      </div>

      <div className="mt-6 space-y-3">
        {sales.length === 0 && (
          <div className="rounded-xl border bg-white p-4 text-sm text-gray-500">
            Nenhuma venda registrada ainda. Faça a primeira venda para preencher os relatórios.
          </div>
        )}

        {sales.map((s) => (
          <div key={s.id} className="rounded-xl border bg-white p-3 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
            <div>
              <p className="font-semibold">{products.find((p) => p.id === s.productId)?.name || '—'}</p>
              <p className="text-sm text-gray-500">{s.qty} × {formatCurrency(s.price)}</p>
              <p className="text-xs text-gray-400">{s.date} • {s.payment} • {s.client || 'Cliente não informado'}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right text-lg font-semibold">{formatCurrency(s.qty * s.price)}</div>
              <button
                onClick={() => setForm({ ...s })}
                className="px-3 py-1 rounded bg-slate-200 text-slate-900"
                type="button"
              >
                Editar
              </button>
              <button
                onClick={() => {
                  // confirmação antes de excluir
                  // eslint-disable-next-line no-restricted-globals
                  if (confirm('Confirma exclusão desta venda?')) deleteSale(s.id);
                }}
                className="px-3 py-1 rounded bg-red-100 text-red-700"
                type="button"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {topProducts.length > 0 && (
        <div className="mt-6 rounded-xl border bg-white p-4">
          <h2 className="font-semibold">Produtos mais vendidos</h2>
          <ul className="mt-2 space-y-2 text-sm text-gray-700">
            {topProducts.map(([name, qty]) => (
              <li key={name} className="flex justify-between">
                <span>{name}</span>
                <span className="font-semibold">{qty}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Vendas;
