import { AppState, Product, Supply, DirectCost, IndirectCost, ExtraCost, PriceFormation, ChangeHistory } from '@/types';

const now = new Date().toISOString();

const supplies: Supply[] = [
  {
    id: 's-1',
    name: 'Leite Condensado',
    category: 'Material Base',
    supplier: 'Distribuidora A',
    code: 'LC-001',
    price: 20.0,
    unit: 'kg',
    purchasedQuantity: 5,
    quantityInStock: 5,
    minimumStock: 1,
    validity: '',
    lastPurchase: now,
    averagePrice: 4.0,
    priceHistory: [],
  },
  {
    id: 's-2',
    name: 'Creme de Leite',
    category: 'Material Base',
    supplier: 'Distribuidora B',
    code: 'CL-001',
    price: 8.5,
    unit: 'kg',
    purchasedQuantity: 10,
    quantityInStock: 10,
    minimumStock: 2,
    validity: '',
    lastPurchase: now,
    averagePrice: 0.85,
    priceHistory: [],
  },
];

const products: Product[] = [
  {
    id: 'p-1',
    name: 'Dindin Tradicional',
    category: 'Sabores',
    code: 'DIND-001',
    description: 'Receita base tradicional',
    supplier: '',
    createdAt: now,
    status: 'active',
    unit: 'un',
    quantityProduced: 20,
    weight: 0,
    volume: 0,
    notes: 'Ingredientes: leite condensado, creme de leite',
    favorited: false,
  },
];

const directCosts: DirectCost[] = [];
const indirectCosts: IndirectCost[] = [
  { id: 'i-1', type: 'energy', amount: 120, description: 'Energia', date: now, frequency: 'monthly' },
  { id: 'i-2', type: 'internet', amount: 80, description: 'Internet', date: now, frequency: 'monthly' },
];

const extraCosts: ExtraCost[] = [];

const priceFormations: PriceFormation[] = [];

const changes: ChangeHistory[] = [];

const initialState: AppState = {
  products,
  supplies,
  directCosts,
  indirectCosts,
  productionCosts: [],
  extraCosts,
  priceFormations,
  stockMovements: [],
  priceSimulations: [],
  sales: [],
  reports: [],
  settings: {
    currency: 'BRL',
    language: 'pt-br',
    theme: 'auto',
    company: { name: 'Dindin Gourmet' },
    defaultTaxPercentage: 0,
    defaultMarkup: 1.5,
    defaultMargin: 0.3,
    laborSalaryMonthly: 1700,
    laborWorkingDays: 24,
    laborWorkingHoursPerDay: 5,
    fixedCostMonthly: 975,
    variableCostMonthly: 165,
  },
  recentChanges: changes,
};

export default initialState;
