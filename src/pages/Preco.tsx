import React, { useMemo, useState, useEffect } from 'react';
import { useStore } from '@/context/store';
import { getAll } from '@/utils/db';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { calculateRealMargin, calculateSuggestedPrice, formatCurrency, convertUnitQuantity } from '@/utils/calculations';

type Ingredient = { id: string; supplyId: string; quantity: number; unit?: string };
type Flavor = { id: string; name: string; ingredients: Ingredient[]; packagingCost?: number; yield?: number };
type Recipe = {
  id: string;
  name: string;
  yield: number;
  packagingCost: number;
  ingredients: Ingredient[];
  flavors?: Flavor[];
};

const Preco: React.FC = () => {
  const { addSimulation, supplies, settings } = useStore();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeId, setRecipeId] = useState<string>('');
  const [costPerUnit, setCostPerUnit] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [desiredMargin, setDesiredMargin] = useState<number>(35); // percent
  const [taxesPercent, setTaxesPercent] = useState<number>(18); // percent
  const [cardFeePercent, setCardFeePercent] = useState<number>(2.5);
  const [commissionPercent, setCommissionPercent] = useState<number>(0);
  const [wastePercent, setWastePercent] = useState<number>(5);
  const [manualPrice, setManualPrice] = useState<number | ''>('');
  const [saveMessage, setSaveMessage] = useState<string>('');

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const data = await getAll<Recipe>('recipes');
        setRecipes(data || []);
        if (!recipeId && data && data.length > 0) {
          setRecipeId(data[0].id);
        }
      } catch (error) {
        console.error('Failed to load recipes from database', error);
      }
    };

    loadRecipes();
  }, []);

  const getSupplyUnitCost = (supplyId: string) => {
    const sup = supplies.find((s) => s.id === supplyId);
    if (!sup) return 0;

    if (sup.averagePrice && sup.averagePrice > 0) {
      return sup.averagePrice;
    }

    if (sup.purchasedQuantity && sup.purchasedQuantity > 0) {
      return sup.price / sup.purchasedQuantity;
    }

    return 0;
  };

  const getSupplyUnit = (supplyId: string) => {
    const sup = supplies.find((s) => s.id === supplyId);
    return sup?.unit || 'un';
  };

  const convertIngredientQuantityToSupply = (quantity: number, ingredientUnit: string | undefined, supplyUnit: string) => {
    const from = (ingredientUnit || '').toLowerCase();
    const to = (supplyUnit || '').toLowerCase();
    if (!from || from === to) return quantity;
    return convertUnitQuantity(quantity, from, to);
  };

  const calculateRecipeCost = (recipe: Recipe, flavor?: Flavor) => {
    const allIngredients = [
      ...(recipe.ingredients || []),
      ...(flavor?.ingredients || []),
    ];

    const cost = allIngredients.reduce((sum, ing) => {
      const unitCost = getSupplyUnitCost(ing.supplyId);
      const supplyUnit = getSupplyUnit(ing.supplyId);
      const ingredientUnit = (ing as any).unit || supplyUnit;
      const convertedQuantity = convertIngredientQuantityToSupply(ing.quantity, ingredientUnit, supplyUnit);
      return sum + unitCost * convertedQuantity;
    }, 0);

    return cost + (flavor?.packagingCost ?? recipe.packagingCost);
  };

  const selectedRecipe = useMemo(
    () => recipes.find((r) => r.id === recipeId),
    [recipeId, recipes]
  );

  useEffect(() => {
    if (!selectedRecipe) {
      setCostPerUnit(0);
      return;
    }

    const costTotalRecipe = calculateRecipeCost(selectedRecipe);
    const quantidadeProduzida = Math.max(0, selectedRecipe.yield || 0);
    const rawCostPerUnit = quantidadeProduzida > 0 ? costTotalRecipe / quantidadeProduzida : 0;

    setCostPerUnit(rawCostPerUnit);
  }, [selectedRecipe, supplies]);

  const desiredMarginDecimal = desiredMargin / 100;
  const taxesDecimal = taxesPercent / 100;
  const cardFeeDecimal = cardFeePercent / 100;
  const commissionDecimal = commissionPercent / 100;
  const wasteDecimal = wastePercent / 100;

  const costWithWaste = costPerUnit * (1 + wasteDecimal);

  const monthlyWorkHours = settings.laborWorkingDays * settings.laborWorkingHoursPerDay;
  const laborHourlyRate = monthlyWorkHours > 0 ? settings.laborSalaryMonthly / monthlyWorkHours : 0;
  const fixedCostHourly = monthlyWorkHours > 0 ? settings.fixedCostMonthly / monthlyWorkHours : 0;
  const variableCostHourly = monthlyWorkHours > 0 ? settings.variableCostMonthly / monthlyWorkHours : 0;

  const recipeYield = (() => {
    if (!recipeId) return 1;
    const recipe = recipes.find((r) => r.id === recipeId);
    return recipe?.yield || 1;
  })();

  const laborCostUnit = recipeYield > 0 ? laborHourlyRate / recipeYield : 0;
  const fixedCostUnit = recipeYield > 0 ? fixedCostHourly / recipeYield : 0;
  const variableCostUnit = recipeYield > 0 ? variableCostHourly / recipeYield : 0;

  const unitCost = costWithWaste + laborCostUnit + fixedCostUnit + variableCostUnit;
  const taxesAmount = unitCost * taxesDecimal;
  const feesAmount = unitCost * (cardFeeDecimal + commissionDecimal);
  const totalCost = unitCost + taxesAmount + feesAmount;

  const suggestedPrice = calculateSuggestedPrice(totalCost, 1.2, desiredMarginDecimal);
  const effectivePrice = typeof manualPrice === 'number' && manualPrice > 0 ? manualPrice : suggestedPrice;

  const realMargin = calculateRealMargin(effectivePrice, totalCost);
  const markup = totalCost > 0 ? effectivePrice / totalCost : 1;

  const status = useMemo(() => {
    if (realMargin < 0) return 'Prejuízo';
    if (realMargin < desiredMargin) return 'Atenção';
    return 'Saudável';
  }, [realMargin, desiredMargin]);

  const handleSaveSimulation = () => {
    if (!selectedRecipe) {
      setSaveMessage('Selecione uma receita para salvar a simulação.');
      return;
    }

    const sim = {
      id: Date.now().toString(),
      productId: recipeId,
      price: Number(effectivePrice),
      quantity,
      costs: totalCost,
      taxes: taxesAmount,
      margin: realMargin,
      commission: feesAmount,
      revenue: quantity * Number(effectivePrice),
      profit: quantity * (Number(effectivePrice) - totalCost),
      roi: totalCost > 0 ? (quantity * (Number(effectivePrice) - totalCost) / totalCost) * 100 : 0,
      timestamp: new Date().toISOString(),
    };

    addSimulation(sim as any);
    setSaveMessage('Simulação salva com sucesso.');
  };

  return (
    <div className="space-y-6" style={{ color: '#000', fontFamily: '"Arial Black", Arial, sans-serif' }}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Formação de Preço</h1>
        <div className="text-sm text-gray-500">Status: <strong>{status}</strong></div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Parâmetros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Select
                label="Receita"
                options={(recipes || []).map((r: any) => ({ value: r.id, label: r.name }))}
                value={recipeId}
                onChange={(e) => setRecipeId(e.target.value)}
                placeholder="Selecione uma receita"
              />
            </div>
            <Input label="Custo por unidade (R$)" type="number" value={costPerUnit} readOnly />
            <Input label="Quantidade (un)" type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />

            <Input label="Margem desejada (%)" type="number" value={desiredMargin} onChange={(e) => setDesiredMargin(Number(e.target.value))} />
            <Input label="Impostos (%)" type="number" value={taxesPercent} onChange={(e) => setTaxesPercent(Number(e.target.value))} />
            <Input label="Desperdício (%)" type="number" value={wastePercent} onChange={(e) => setWastePercent(Number(e.target.value))} />

            <Input label="Taxa cartão (%)" type="number" value={cardFeePercent} onChange={(e) => setCardFeePercent(Number(e.target.value))} />
            <Input label="Comissão (%)" type="number" value={commissionPercent} onChange={(e) => setCommissionPercent(Number(e.target.value))} />
            <Input label="Preço manual (R$) - opcional" type="number" value={manualPrice as any} onChange={(e) => setManualPrice(e.target.value === '' ? '' : Number(e.target.value))} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Custo com desperdício</p>
              <p className="text-lg font-bold">{formatCurrency(costWithWaste)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Impostos</p>
              <p className="text-lg font-bold">{formatCurrency(taxesAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Taxas/Comissões</p>
              <p className="text-lg font-bold">{formatCurrency(feesAmount)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Custo Total</p>
              <p className="text-lg font-bold">{formatCurrency(totalCost)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Preço Sugerido</p>
              <p className="text-lg font-bold">{formatCurrency(suggestedPrice)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Preço Efetivo</p>
              <p className="text-lg font-bold">{formatCurrency(Number(effectivePrice))}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Margem Real</p>
              <p className="text-lg font-bold">{realMargin.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Markup</p>
              <p className="text-lg font-bold">{markup.toFixed(2)}x</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Receita (qt x preço)</p>
              <p className="text-lg font-bold">{formatCurrency(quantity * Number(effectivePrice))}</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-6">
            <div>
              <p className="text-sm text-gray-500">Mão de obra por unidade</p>
              <p className="text-lg font-bold">{formatCurrency(laborCostUnit)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Custo fixo por unidade</p>
              <p className="text-lg font-bold">{formatCurrency(fixedCostUnit)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Custo variável por unidade</p>
              <p className="text-lg font-bold">{formatCurrency(variableCostUnit)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 items-center">
        <Button type="button" onClick={handleSaveSimulation} disabled={!selectedRecipe}>
          Salvar simulação
        </Button>
        {saveMessage && (
          <p className="text-sm text-slate-600">{saveMessage}</p>
        )}
      </div>
      {!recipes.length && (
        <p className="mt-4 text-sm text-financial-red">
          Nenhuma receita encontrada. Cadastre uma receita em Receitas antes de salvar simulações.
        </p>
      )}
    </div>
  );
};

export default Preco;
