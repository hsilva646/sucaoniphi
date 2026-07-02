import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { AppViewProvider, useAppView } from '@/views/useAppView';
import Dashboard from '@/pages/Dashboard';
import Configuracoes from '@/pages/Configuracoes';
import Insumos from '@/pages/Insumos';
import Products from '@/pages/Products';
import Receitas from '@/pages/Receitas';
import Preco from '@/pages/Preco';
import Vendas from '@/pages/Vendas';
import Relatorios from '@/pages/Relatorios';
import seedData from '@/data/seedData';
import { AppState } from '@/types';
import { useStore } from '@/context/store';
import { initializeDatabase, getAll, putAll } from '@/utils/db';

const AppContent: React.FC = () => {
  const { view } = useAppView();
  const store = useStore();
  const [salesLoaded, setSalesLoaded] = useState(false);

  useEffect(() => {
    // Import seed data on first run if store is empty
    if (store.products.length === 0 && store.supplies.length === 0) {
      store.importData(seedData as AppState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    initializeDatabase().catch((error) => {
      console.error('Failed to initialize database', error);
    });
  }, []);

  useEffect(() => {
    const loadSales = async () => {
      try {
        const data = await getAll<import('@/types').Sale>('sales');
        if (data && data.length > 0) {
          store.setSales(data);
        }
      } catch (error) {
        console.error('Failed to load sales from database', error);
      } finally {
        setSalesLoaded(true);
      }
    };

    loadSales();
  }, [store]);

  useEffect(() => {
    if (!salesLoaded) return;

    const saveSales = async () => {
      try {
        await putAll('sales', store.sales);
      } catch (error) {
        console.error('Failed to save sales to database', error);
      }
    };

    saveSales();
  }, [store.sales, salesLoaded]);

  return (
    <Layout>
      {view === 'dashboard' && <Dashboard />}
      {view === 'configuracoes' && <Configuracoes />}
      {view === 'insumos' && <Insumos />}
      {view === 'produtos' && <Products />}
      {view === 'receitas' && <Receitas />}
      {view === 'preco' && <Preco />}
      {view === 'vendas' && <Vendas />}
      {view === 'relatorios' && <Relatorios />}
    </Layout>
  );
};

function App() {
  return (
    <AppViewProvider>
      <AppContent />
    </AppViewProvider>
  );
}

export default App;
