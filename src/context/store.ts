import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AppState,
  Product,
  Supply,
  DirectCost,
  IndirectCost,
  ExtraCost,
  PriceFormation,
  Settings,
  ChangeHistory,
  PriceSimulation,
  Sale,
} from '@/types';

interface Store extends AppState {
  // Produtos
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleFavorite: (id: string) => void;
  duplicateProduct: (id: string) => void;

  // Insumos
  addSupply: (supply: Supply) => void;
  updateSupply: (id: string, updates: Partial<Supply>) => void;
  deleteSupply: (id: string) => void;
  updateSupplyStock: (id: string, quantity: number, reason: string) => void;

  // Custos
  addDirectCost: (cost: DirectCost) => void;
  updateDirectCost: (id: string, updates: Partial<DirectCost>) => void;
  deleteDirectCost: (id: string) => void;

  addIndirectCost: (cost: IndirectCost) => void;
  updateIndirectCost: (id: string, updates: Partial<IndirectCost>) => void;
  deleteIndirectCost: (id: string) => void;

  addExtraCost: (cost: ExtraCost) => void;
  updateExtraCost: (id: string, updates: Partial<ExtraCost>) => void;
  deleteExtraCost: (id: string) => void;

  // Formação de Preço
  updatePriceFormation: (id: string, updates: Partial<PriceFormation>) => void;

  // Simulador
  addSimulation: (simulation: PriceSimulation) => void;

  // Vendas
  setSales: (sales: Sale[]) => void;
  addSale: (sale: Sale) => void;
  updateSale: (id: string, updates: Partial<Sale>) => void;
  deleteSale: (id: string) => void;

  // Configurações
  updateSettings: (settings: Partial<Settings>) => void;

  // Histórico
  addChangeHistory: (change: ChangeHistory) => void;
  undo: () => void;

  // Importação/Exportação
  importData: (data: AppState) => void;
  exportData: () => string;
  clearAll: () => void;
}

const initialState: AppState = {
  products: [],
  supplies: [],
  directCosts: [],
  indirectCosts: [],
  productionCosts: [],
  extraCosts: [],
  priceFormations: [],
  stockMovements: [],
  priceSimulations: [],
  sales: [],
  reports: [],
  recentChanges: [],
  settings: {
    currency: 'BRL',
    language: 'pt-br',
    theme: 'auto',
    company: {
      name: 'Minha Empresa',
    },
    defaultTaxPercentage: 18,
    defaultMarkup: 1.5,
    defaultMargin: 0.35,
    laborSalaryMonthly: 1700,
    laborWorkingDays: 24,
    laborWorkingHoursPerDay: 5,
    fixedCostMonthly: 975,
    variableCostMonthly: 165,
  },
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Produtos
      addProduct: (product) =>
        set((state) => ({
          products: [...state.products, product],
          recentChanges: [
            {
              id: Date.now().toString(),
              entityType: 'Product',
              entityId: product.id,
              action: 'create',
              oldValues: null,
              newValues: product,
              timestamp: new Date().toISOString(),
            },
            ...state.recentChanges,
          ],
        })),

      updateProduct: (id, updates) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
          recentChanges: [
            {
              id: Date.now().toString(),
              entityType: 'Product',
              entityId: id,
              action: 'update',
              oldValues: state.products.find((p) => p.id === id),
              newValues: { ...state.products.find((p) => p.id === id), ...updates },
              timestamp: new Date().toISOString(),
            },
            ...state.recentChanges,
          ],
        })),

      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
          recentChanges: [
            {
              id: Date.now().toString(),
              entityType: 'Product',
              entityId: id,
              action: 'delete',
              oldValues: state.products.find((p) => p.id === id),
              newValues: null,
              timestamp: new Date().toISOString(),
            },
            ...state.recentChanges,
          ],
        })),

      toggleFavorite: (id) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, favorited: !p.favorited } : p
          ),
        })),

      duplicateProduct: (id) =>
        set((state) => {
          const product = state.products.find((p) => p.id === id);
          if (!product) return state;
          const newProduct: Product = {
            ...product,
            id: `${product.id}-${Date.now()}`,
            name: `${product.name} (Cópia)`,
            createdAt: new Date().toISOString(),
          };
          return {
            products: [...state.products, newProduct],
            recentChanges: [
              {
                id: Date.now().toString(),
                entityType: 'Product',
                entityId: newProduct.id,
                action: 'create',
                oldValues: null,
                newValues: newProduct,
                timestamp: new Date().toISOString(),
              },
              ...state.recentChanges,
            ],
          };
        }),

      // Insumos
      addSupply: (supply) =>
        set((state) => ({
          supplies: [...state.supplies, supply],
        })),

      updateSupply: (id, updates) =>
        set((state) => ({
          supplies: state.supplies.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),

      deleteSupply: (id) =>
        set((state) => ({
          supplies: state.supplies.filter((s) => s.id !== id),
        })),

      updateSupplyStock: (id, quantity, reason) =>
        set((state) => {
          const supply = state.supplies.find((s) => s.id === id);
          if (!supply) return state;
          const newBalance = supply.quantityInStock + quantity;
          return {
            supplies: state.supplies.map((s) =>
              s.id === id
                ? { ...s, quantityInStock: newBalance }
                : s
            ),
            stockMovements: [
              {
                id: Date.now().toString(),
                supplyId: id,
                type: quantity > 0 ? 'in' : 'out',
                quantity: Math.abs(quantity),
                date: new Date().toISOString(),
                reason,
                balance: newBalance,
              },
              ...state.stockMovements,
            ],
          };
        }),

      // Custos Diretos
      addDirectCost: (cost) =>
        set((state) => ({
          directCosts: [...state.directCosts, cost],
        })),

      updateDirectCost: (id, updates) =>
        set((state) => ({
          directCosts: state.directCosts.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      deleteDirectCost: (id) =>
        set((state) => ({
          directCosts: state.directCosts.filter((c) => c.id !== id),
        })),

      // Custos Indiretos
      addIndirectCost: (cost) =>
        set((state) => ({
          indirectCosts: [...state.indirectCosts, cost],
        })),

      updateIndirectCost: (id, updates) =>
        set((state) => ({
          indirectCosts: state.indirectCosts.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      deleteIndirectCost: (id) =>
        set((state) => ({
          indirectCosts: state.indirectCosts.filter((c) => c.id !== id),
        })),

      // Custos Extras
      addExtraCost: (cost) =>
        set((state) => ({
          extraCosts: [...state.extraCosts, cost],
        })),

      updateExtraCost: (id, updates) =>
        set((state) => ({
          extraCosts: state.extraCosts.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      deleteExtraCost: (id) =>
        set((state) => ({
          extraCosts: state.extraCosts.filter((c) => c.id !== id),
        })),

      // Formação de Preço
      updatePriceFormation: (id, updates) =>
        set((state) => ({
          priceFormations: state.priceFormations.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

          // Simulador
      addSimulation: (simulation) =>
        set((state) => ({
          priceSimulations: [simulation, ...state.priceSimulations],
        })),

      // Vendas
      setSales: (sales) =>
        set(() => ({
          sales,
        })),

      addSale: (sale) =>
        set((state) => ({
          sales: [sale, ...state.sales],
        })),

      updateSale: (id, updates) =>
        set((state) => ({
          sales: state.sales.map((sale) =>
            sale.id === id ? { ...sale, ...updates } : sale
          ),
        })),

      deleteSale: (id) =>
        set((state) => ({
          sales: state.sales.filter((sale) => sale.id !== id),
        })),

      // Configurações
      updateSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings },
        })),

      // Histórico
      addChangeHistory: (change) =>
        set((state) => ({
          recentChanges: [change, ...state.recentChanges.slice(0, 99)],
        })),

      undo: () => {
        const state = get();
        const lastChange = state.recentChanges[0];
        if (!lastChange) return;

        if (lastChange.action === 'create') {
          set((s) => ({
            products: s.products.filter((p) => p.id !== lastChange.entityId),
            recentChanges: s.recentChanges.slice(1),
          }));
        }
      },

      // Importação/Exportação
      importData: (data) => set(data),

      exportData: () => {
        const state = get();
        return JSON.stringify(
          {
            version: '1.0.0',
            exportedAt: new Date().toISOString(),
            data: state,
          },
          null,
          2
        );
      },

      clearAll: () => set(initialState),
    }),
    {
      name: 'cost-management-store',
      version: 1,
    }
  )
);

// Expor a store para depuração/importação via página (útil para testes locais)
declare global {
  interface Window { __APP_STORE?: typeof useStore }
}
if (typeof window !== 'undefined') {
  window.__APP_STORE = useStore;
}
