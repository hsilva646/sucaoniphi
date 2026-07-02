// Tipos para Produtos
export interface Product {
  id: string;
  name: string;
  category: string;
  code: string;
  description: string;
  supplier: string;
  createdAt: string;
  status: 'active' | 'inactive' | 'discontinued';
  unit: string;
  quantityProduced: number;
  weight: number;
  volume: number;
  photo?: string;
  notes: string;
  favorited: boolean;
  price?: number;
}

// Custos Diretos
export interface DirectCost {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  supplier: string;
  category: string;
  batch: string;
  validity: string;
  note: string;
}

// Custos Indiretos
export interface IndirectCost {
  id: string;
  type: 'energy' | 'internet' | 'rent' | 'water' | 'phone' | 'marketing' | 'accounting' | 'software' | 'machines' | 'depreciation' | 'cleaning' | 'other';
  amount: number;
  description: string;
  date: string;
  frequency: 'monthly' | 'quarterly' | 'annual' | 'one-time';
}

// Custos de Produção
export interface ProductionCost {
  id: string;
  productionTimeHours: number;
  productionTimeMinutes: number;
  numberOfEmployees: number;
  salary: number;
  charges: number;
  hourlyRate: number;
  laborCost: number;
  preparationTime: number;
  freezingTime: number;
  packagingTime: number;
  transportTime: number;
  deliveryTime: number;
}

// Custos Extras
export interface ExtraCost {
  id: string;
  type: 'freight' | 'commission' | 'marketplace' | 'card_fee' | 'pix' | 'taxes' | 'loss' | 'breakage' | 'waste' | 'warranty' | 'maintenance' | 'advertising';
  amount: number;
  description: string;
  date: string;
}

// Formação de Preço
export interface PriceFormation {
  id: string;
  productId: string;
  totalCost: number;
  markup: number;
  desiredMargin: number;
  realMargin: number;
  grossProfit: number;
  netProfit: number;
  suggestedPrice: number;
  promotionalPrice: number;
  wholesalePrice: number;
  retailPrice: number;
  deliveryPrice: number;
  marketplacePrice: number;
  minimumPrice: number;
  idealPrice: number;
  maximumPrice: number;
}

// Insumo
export interface Supply {
   id: string;
  name: string;
  category: string;
  supplier: string;
  code: string;

  // Valor total pago na compra do insumo
  price: number;

  // Quantidade comprada na compra original
  purchasedQuantity: number;

  // Unidade da compra: kg, g, L, ml, un
  unit: string;

  // Estoque atual serve apenas para controle, não para custo da receita
  quantityInStock: number;

  minimumStock: number;
  validity: string;
  lastPurchase: string;

  // Custo unitário calculado: price / purchasedQuantity
  averagePrice: number;

  priceHistory: PriceHistoryEntry[];
}

export interface PriceHistoryEntry {
  date: string;
  price: number;
  quantity: number;
}

// Histórico de Estoque
export interface StockMovement {
  id: string;
  supplyId: string;
  type: 'in' | 'out';
  quantity: number;
  date: string;
  reason: string;
  balance: number;
}

// Indicadores Automáticos
export interface ProductMetrics {
  productId: string;
  costPerUnit: number;
  costPerKg: number;
  costPerLiter: number;
  marginPercent: number;
  roi: number;
  markup: number;
  breakEven: number;
  breakEvenPoint: number;
  revenue: number;
  profit: number;
  netProfit: number;
  costPercentage: number;
  supplyParticipation: number;
  laborCost: number;
  operationalCost: number;
  profitability: number;
  cogs: number; // Cost of Goods Sold
  ebitda: number;
}

// Simulador
export interface PriceSimulation {
  id: string;
  productId: string;
  price: number;
  quantity: number;
  costs: number;
  taxes: number;
  margin: number;
  commission: number;
  revenue: number;
  profit: number;
  roi: number;
  timestamp: string;
}

export interface Sale {
  id: string;
  date: string;
  productId: string;
  qty: number;
  price: number;
  payment: string;
  client?: string;
}

// Configurações
export interface Settings {
  currency: string;
  language: 'pt-br' | 'en' | 'es';
  theme: 'light' | 'dark' | 'auto';
  company: {
    name: string;
    logo?: string;
  };
  defaultTaxPercentage: number;
  defaultMarkup: number;
  defaultMargin: number;
  laborSalaryMonthly: number;
  laborWorkingDays: number;
  laborWorkingHoursPerDay: number;
  fixedCostMonthly: number;
  variableCostMonthly: number;
}

// Relatório
export interface Report {
  id: string;
  type: 'most_profitable' | 'least_profitable' | 'costs_by_category' | 'profit_by_period' | 'monthly_comparison' | 'annual_comparison' | 'product_ranking';
  title: string;
  data: any[];
  generatedAt: string;
  filters?: any;
}

// Estado Global
export interface AppState {
  products: Product[];
  supplies: Supply[];
  directCosts: DirectCost[];
  indirectCosts: IndirectCost[];
  productionCosts: ProductionCost[];
  extraCosts: ExtraCost[];
  priceFormations: PriceFormation[];
  stockMovements: StockMovement[];
  priceSimulations: PriceSimulation[];
  sales: Sale[];
  reports: Report[];
  settings: Settings;
  recentChanges: ChangeHistory[];
}

// Histórico de Alterações
export interface ChangeHistory {
  id: string;
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete';
  oldValues: any;
  newValues: any;
  timestamp: string;
  userId?: string;
}

// Importação/Exportação
export interface ImportExportData {
  version: string;
  exportedAt: string;
  data: AppState;
}
