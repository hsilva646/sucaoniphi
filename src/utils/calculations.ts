import { ProductMetrics, Product, DirectCost, IndirectCost, ProductionCost, ExtraCost } from '@/types';

/**
 * Calcula todas as métricas de um produto automaticamente
 */
export const calculateProductMetrics = (
  product: Product,
  directCosts: DirectCost[],
  indirectCosts: IndirectCost[],
  productionCost: ProductionCost | undefined,
  extraCosts: ExtraCost[],
  quantity: number,
  revenue: number
): ProductMetrics => {
  // Custo Total
  const totalDirectCost = directCosts.reduce((sum, c) => sum + c.totalPrice, 0);
  const totalIndirectCost = indirectCosts.reduce((sum, c) => sum + c.amount, 0);
  const totalProductionCost = productionCost ? productionCost.laborCost : 0;
  const totalExtraCost = extraCosts.reduce((sum, c) => sum + c.amount, 0);
  const totalCost = totalDirectCost + totalIndirectCost + totalProductionCost + totalExtraCost;

  // Custo por unidade
  const costPerUnit = quantity > 0 ? totalCost / quantity : 0;
  
  // Custo por quilo e litro
  const costPerKg = product.weight > 0 ? totalCost / product.weight : 0;
  const costPerLiter = product.volume > 0 ? totalCost / product.volume : 0;

  // Receita
  const actualRevenue = revenue || (costPerUnit * quantity);

  // Lucro
  const profit = actualRevenue - totalCost;
  const netProfit = profit * 0.85; // Aproximação 15% de impostos

  // Margem
  const marginPercent = actualRevenue > 0 ? (profit / actualRevenue) * 100 : 0;
  const costPercentage = actualRevenue > 0 ? (totalCost / actualRevenue) * 100 : 0;

  // ROI e Markup
  const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;
  const markup = totalCost > 0 ? actualRevenue / totalCost : 1;

  // Break Even
  const breakEven = totalCost > 0 ? totalCost / costPerUnit : 0;
  const breakEvenPoint = costPerUnit > 0 ? totalCost / costPerUnit : 0;

  // Custos específicos
  const laborCost = totalProductionCost;
  const operationalCost = totalIndirectCost;
  const supplyParticipation = totalCost > 0 ? (totalDirectCost / totalCost) * 100 : 0;

  // Profitability e Lucratividade
  const profitability = actualRevenue > 0 ? (profit / actualRevenue) * 100 : 0;
  const cogs = totalDirectCost + (totalProductionCost * (quantity / (product.quantityProduced || 1)));

  // EBITDA Simplificado
  const ebitda = profit; // Simplificação

  return {
    productId: product.id,
    costPerUnit,
    costPerKg,
    costPerLiter,
    marginPercent,
    roi,
    markup,
    breakEven,
    breakEvenPoint,
    revenue: actualRevenue,
    profit,
    netProfit,
    costPercentage,
    supplyParticipation,
    laborCost,
    operationalCost,
    profitability,
    cogs,
    ebitda,
  };
};

/**
 * Formata valores monetários
 */
export const formatCurrency = (value: number, currency: string = 'BRL'): string => {
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(value);
};

/**
 * Formata percentuais
 */
export const formatPercent = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Calcula preço sugerido com base em markup e margem
 */
export const calculateSuggestedPrice = (
  costPerUnit: number,
  markup: number,
  desiredMargin: number
): number => {
  const priceByMarkup = costPerUnit * markup;
  const priceByMargin = costPerUnit / (1 - desiredMargin);
  return Math.max(priceByMarkup, priceByMargin);
};

/**
 * Calcula margem real baseado no preço
 */
export const calculateRealMargin = (price: number, cost: number): number => {
  if (price === 0) return 0;
  return ((price - cost) / price) * 100;
};

/**
 * Calcula ponto de equilíbrio
 */
export const calculateBreakEvenPoint = (
  fixedCosts: number,
  variableCostPerUnit: number,
  pricePerUnit: number
): number => {
  const contribution = pricePerUnit - variableCostPerUnit;
  if (contribution === 0) return 0;
  return fixedCosts / contribution;
};

/**
 * Formata horas e minutos
 */
export const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

/**
 * Calcula a evolução de margem
 */
export const calculateMarginEvolution = (
  previousPrice: number,
  previousCost: number,
  currentPrice: number,
  currentCost: number
): number => {
  const previousMargin = calculateRealMargin(previousPrice, previousCost);
  const currentMargin = calculateRealMargin(currentPrice, currentCost);
  return currentMargin - previousMargin;
};

/**
 * Gera ID único
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Converte quantidade de um sistema de unidades para outro.
 */
export const convertUnitQuantity = (
  quantity: number,
  fromUnit: string,
  toUnit: string
): number => {
  const from = (fromUnit || '').toLowerCase();
  const to = (toUnit || '').toLowerCase();

  if (from === to || !from || !to) return quantity;

  const conversions: Record<string, number> = {
    g_to_kg: 1 / 1000,
    kg_to_g: 1000,
    ml_to_l: 1 / 1000,
    l_to_ml: 1000,
  };

  const key = `${from}_to_${to}`;
  if (conversions[key] !== undefined) {
    return quantity * conversions[key];
  }

  // Unidades compatíveis de volume/peso sem conversão direta
  if ((from === 'g' || from === 'kg') && (to === 'g' || to === 'kg')) {
    return quantity * (conversions[key] ?? 1);
  }

  if ((from === 'ml' || from === 'l') && (to === 'ml' || to === 'l')) {
    return quantity * (conversions[key] ?? 1);
  }

  return quantity;
};

/**
 * Formata data
 */
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

/**
 * Valida CNPJ
 */
export const validateCNPJ = (cnpj: string): boolean => {
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14) return false;
  
  let sum = 0;
  let remainder;

  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * (5 - (i % 8));
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[12])) return false;

  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned[i]) * (6 - ((i + 1) % 8));
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[13])) return false;

  return true;
};

/**
 * Calcula custos de simulação
 */
export const calculateSimulationMetrics = (
  quantity: number,
  price: number,
  costs: number,
  taxes: number,
  commission: number
) => {
  const revenue = quantity * price;
  const totalCosts = costs + taxes + commission;
  const profit = revenue - totalCosts;
  const roi = costs > 0 ? (profit / costs) * 100 : 0;

  return {
    revenue,
    profit,
    roi,
    profitMargin: revenue > 0 ? (profit / revenue) * 100 : 0,
  };
};
