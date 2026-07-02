import React, { useEffect, useState } from 'react';
import { getAll, putAll } from '@/utils/db';
import { useStore } from '@/context/store';
import { generateId, formatCurrency, convertUnitQuantity } from '@/utils/calculations';

type Ingredient = { id: string; supplyId: string; quantity: number; unit: string };
type Flavor = { id: string; name: string; ingredients: Ingredient[]; packagingCost?: number; yield?: number };

type Recipe = {
  id: string;
  name: string;
  yield: number;
  packagingCost: number;
  ingredients: Ingredient[];
  flavors?: Flavor[];
};

const Receitas: React.FC = () => {
  const store = useStore();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [editing, setEditing] = useState<Recipe | null>(null);
  const [isRecipesLoaded, setIsRecipesLoaded] = useState(false);

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const data = await getAll<Recipe>('recipes');
        setRecipes(data || []);
      } catch (error) {
        console.error('Failed to load recipes from database', error);
      } finally {
        setIsRecipesLoaded(true);
      }
    };

    loadRecipes();
  }, []);

  useEffect(() => {
    if (!isRecipesLoaded) return;

    const saveRecipes = async () => {
      try {
        await putAll('recipes', recipes);
      } catch (error) {
        console.error('Failed to save recipes to database', error);
      }
    };

    saveRecipes();
  }, [recipes, isRecipesLoaded]);

  const getUnitCost = (supplyId: string) => {
    const sup = store.supplies.find((s) => s.id === supplyId);
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
    const sup = store.supplies.find((s) => s.id === supplyId);
    return sup?.unit || 'un';
  };

  const convertIngredientToSupply = (
    quantity: number,
    supplyUnit: string,
    ingredientUnit?: string
  ) => {
    const normalizedSupplyUnit = (supplyUnit || '').toLowerCase();
    const normalizedIngredientUnit = (ingredientUnit || '').toLowerCase();

    if (!normalizedIngredientUnit || normalizedSupplyUnit === normalizedIngredientUnit) {
      return quantity;
    }

    return convertUnitQuantity(quantity, normalizedIngredientUnit, normalizedSupplyUnit);
  };

  const getIngredientDisplayUnit = (ing: Ingredient) => {
    return ing.unit || getSupplyUnit(ing.supplyId);
  };

  const getIngredientCost = (ing: Ingredient) => {
    const unitCost = getUnitCost(ing.supplyId);
    const supplyUnit = getSupplyUnit(ing.supplyId);
    const ingredientQuantity = convertIngredientToSupply(ing.quantity, supplyUnit, getIngredientDisplayUnit(ing));
    return unitCost * ingredientQuantity;
  };

  const create = () => {
    const r: Recipe = {
      id: generateId(),
      name: 'Nova Receita',
      yield: 10,
      packagingCost: 0,
      ingredients: [],
      flavors: [],
    };

    setEditing(r);
  };

  const save = (r: Recipe) => {
    setRecipes((s) => {
      const exists = s.find((x) => x.id === r.id);
      if (exists) return s.map((x) => (x.id === r.id ? r : x));
      return [r, ...s];
    });

    setEditing(null);
  };

  const remove = (id: string) => {
    setRecipes((s) => s.filter((r) => r.id !== id));
  };

  const calcCost = (r: Recipe) => {
    return (
      r.ingredients.reduce((sum, ing) => {
        const unitCost = getUnitCost(ing.supplyId);
        const supplyUnit = getSupplyUnit(ing.supplyId);
        const ingredientQuantity = convertIngredientToSupply(ing.quantity, supplyUnit, ing.unit);
        return sum + unitCost * ingredientQuantity;
      }, 0) + r.packagingCost
    );
  };

  const calcCostForFlavor = (r: Recipe, flavor: Flavor) => {
    return (
      (flavor.ingredients || []).reduce((sum, ing) => {
        const unitCost = getUnitCost(ing.supplyId);
        const supplyUnit = getSupplyUnit(ing.supplyId);
        const ingredientQuantity = convertIngredientToSupply(ing.quantity, supplyUnit, ing.unit);
        return sum + unitCost * ingredientQuantity;
      }, 0) + (flavor.packagingCost ?? r.packagingCost)
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Receitas / Sabores</h1>
        <button className="btn" onClick={create}>
          Novo
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {recipes.map((r) => (
          <div
            key={r.id}
            className="rounded-xl border bg-white p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{r.name}</p>
              <p className="text-sm">Custo total: {formatCurrency(calcCost(r))}</p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setEditing(r)} className="px-3 py-1 rounded bg-slate-100">
                Editar
              </button>

              <button
                onClick={() => remove(r.id)}
                className="px-3 py-1 rounded bg-red-100 text-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 overflow-y-auto bg-black/40 p-4">
          <div className="mx-auto flex min-h-full w-full max-w-3xl items-start justify-center">
            <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-2xl shadow-black/40 ring-1 ring-slate-700 sm:max-w-4xl md:mx-0 md:mt-8 md:min-h-[auto] md:w-full md:max-h-[calc(100vh-4rem)] md:overflow-y-auto">
              <h2 className="text-lg font-semibold">Editar Receita</h2>

              <div className="mt-4 grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Nome da Receita</label>
                  <input
                    className="border p-2 w-full"
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Rendimento</label>
                  <input
                    className="border p-2 w-full"
                    type="number"
                    value={editing.yield}
                    onChange={(e) =>
                      setEditing({ ...editing, yield: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Valor de embalagens</label>
                  <input
                    className="border p-2 w-full"
                    type="number"
                    value={editing.packagingCost}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        packagingCost: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div>
                  <p className="font-semibold">Ingredientes Gerais</p>

                  <div className="space-y-2 mt-2">
                    {editing.ingredients.map((ing, idx) => (
                      <div key={ing.id} className="flex gap-2 items-center">
                        <select
                          className="border p-2 flex-1"
                          value={ing.supplyId}
                          onChange={(e) => {
                            const copy = { ...editing };
                            copy.ingredients = [...copy.ingredients];
                            copy.ingredients[idx] = {
                              ...copy.ingredients[idx],
                              supplyId: e.target.value,
                            };
                            setEditing(copy);
                          }}
                        >
                          <option value="">-- selecione --</option>
                          {store.supplies.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>

                        <div className="flex flex-col w-24">
                          <label className="text-xs text-gray-500">Qtd. utilizada</label>
                          <input
                            className="border p-2"
                            type="number"
                            value={ing.quantity}
                            onChange={(e) => {
                              const copy = { ...editing };
                              copy.ingredients = [...copy.ingredients];
                              copy.ingredients[idx] = {
                                ...copy.ingredients[idx],
                                quantity: parseFloat(e.target.value) || 0,
                              };
                              setEditing(copy);
                            }}
                          />
                        </div>

                        <div className="flex flex-col w-24">
                          <label className="text-xs text-gray-500">Unidade</label>
                          <select
                            className="border p-2"
                            value={ing.unit || getSupplyUnit(ing.supplyId)}
                            onChange={(e) => {
                              const copy = { ...editing };
                              copy.ingredients = [...copy.ingredients];
                              copy.ingredients[idx] = {
                                ...copy.ingredients[idx],
                                unit: e.target.value,
                              };
                              setEditing(copy);
                            }}
                          >
                            <option value="g">g</option>
                            <option value="kg">kg</option>
                            <option value="ml">ml</option>
                            <option value="l">L</option>
                            <option value="un">un</option>
                          </select>
                        </div>

                        <div className="flex flex-col w-36 text-right">
                          <span className="text-xs text-gray-500">Custo por ingrediente</span>
                          <span className="text-sm font-semibold">
                            {formatCurrency(getIngredientCost(ing))}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            setEditing({
                              ...editing,
                              ingredients: editing.ingredients.filter((x) => x.id !== ing.id),
                            });
                          }}
                          className="px-2 bg-red-100 text-red-700"
                        >
                          x
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() => {
                        setEditing({
                          ...editing,
                          ingredients: [
                            ...editing.ingredients,
                            {
                              id: generateId(),
                              supplyId: store.supplies[0]?.id || '',
                              quantity: 0,
                              unit: store.supplies[0]?.unit || 'g',
                            },
                          ],
                        });
                      }}
                      className="mt-2 px-3 py-1 rounded bg-slate-100"
                    >
                      Adicionar ingrediente
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="font-semibold">Sabores</p>

                  <div className="space-y-3 mt-2">
                    {(editing.flavors || []).map((f, fIdx) => (
                      <div key={f.id} className="border rounded p-3">
                        <div className="flex items-center justify-between">
                          <strong>{f.name}</strong>
                          <div className="text-sm">
                            Custo: {formatCurrency(calcCostForFlavor(editing, f))}
                          </div>
                        </div>

                        <div className="mt-2 space-y-2">
                          {f.ingredients.map((ing, idx) => (
                            <div key={ing.id} className="flex gap-2">
                              <select
                                className="border p-2 flex-1"
                                value={ing.supplyId}
                                onChange={(e) => {
                                  const flavors = [...(editing.flavors || [])];
                                  const ingredients = [...flavors[fIdx].ingredients];

                                  ingredients[idx] = {
                                    ...ingredients[idx],
                                    supplyId: e.target.value,
                                  };

                                  flavors[fIdx] = {
                                    ...flavors[fIdx],
                                    ingredients,
                                  };

                                  setEditing({
                                    ...editing,
                                    flavors,
                                  });
                                }}
                              >
                                <option value="">-- selecione --</option>
                                {store.supplies.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.name}
                                  </option>
                                ))}
                              </select>

                              <input
                                className="border p-2 w-28"
                                type="number"
                                value={ing.quantity}
                                onChange={(e) => {
                                  const flavors = [...(editing.flavors || [])];
                                  const ingredients = [...flavors[fIdx].ingredients];

                                  ingredients[idx] = {
                                    ...ingredients[idx],
                                    quantity: parseFloat(e.target.value) || 0,
                                  };

                                  flavors[fIdx] = {
                                    ...flavors[fIdx],
                                    ingredients,
                                  };

                                  setEditing({
                                    ...editing,
                                    flavors,
                                  });
                                }}
                              />

                              <div className="flex flex-col w-24">
                                <label className="text-xs text-gray-500">Unidade</label>
                                <select
                                  className="border p-2"
                                  value={ing.unit || getSupplyUnit(ing.supplyId)}
                                  onChange={(e) => {
                                    const flavors = [...(editing.flavors || [])];
                                    const ingredients = [...flavors[fIdx].ingredients];

                                    ingredients[idx] = {
                                      ...ingredients[idx],
                                      unit: e.target.value,
                                    };

                                    flavors[fIdx] = {
                                      ...flavors[fIdx],
                                      ingredients,
                                    };

                                    setEditing({
                                      ...editing,
                                      flavors,
                                    });
                                  }}
                                >
                                  <option value="g">g</option>
                                  <option value="kg">kg</option>
                                  <option value="ml">ml</option>
                                  <option value="l">L</option>
                                  <option value="un">un</option>
                                </select>
                              </div>

                              <div className="flex flex-col w-36 text-right">
                                <span className="text-xs text-gray-500">Custo por ingrediente</span>
                                <span className="text-sm font-semibold">
                                  {formatCurrency(getIngredientCost(ing))}
                                </span>
                              </div>

                              <button
                                onClick={() => {
                                  const flavors = [...(editing.flavors || [])];

                                  flavors[fIdx] = {
                                    ...flavors[fIdx],
                                    ingredients: flavors[fIdx].ingredients.filter(
                                      (x) => x.id !== ing.id
                                    ),
                                  };

                                  setEditing({
                                    ...editing,
                                    flavors,
                                  });
                                }}
                                className="px-2 bg-red-100 text-red-700"
                              >
                                x
                              </button>
                            </div>
                          ))}

                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const flavors = [...(editing.flavors || [])];

                                flavors[fIdx] = {
                                  ...flavors[fIdx],
                                  ingredients: [
                                    ...flavors[fIdx].ingredients,
                                    {
                                      id: generateId(),
                                      supplyId: store.supplies[0]?.id || '',
                                      quantity: 0,
                                      unit: store.supplies[0]?.unit || 'g',
                                    },
                                  ],
                                };

                                setEditing({
                                  ...editing,
                                  flavors,
                                });
                              }}
                              className="px-3 py-1 rounded bg-slate-100"
                            >
                              Adicionar ingrediente
                            </button>

                            <button
                              onClick={() => {
                                setEditing({
                                  ...editing,
                                  flavors: (editing.flavors || []).filter((x) => x.id !== f.id),
                                });
                              }}
                              className="px-3 py-1 rounded bg-red-100 text-red-700"
                            >
                              Remover sabor
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="flex gap-2">
                      <select id="newFlavor" className="border p-2" defaultValue="">
                        <option value="">-- adicionar sabor --</option>
                        {[
                          'brigadeiro',
                          'limão',
                          'maracujá',
                          'maracujá trufado',
                          'romeu e julieta',
                          'doce de leite com ameixa',
                          'doce de leite trufado',
                          'ninho com nutela',
                          'ninho com morango',
                          'açai',
                          'amendoin',
                          'delicia de abacaxi',
                          'pudim',
                          'coco',
                          'cappuccino com doce de leite',
                        ].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => {
                          const sel = (document.getElementById('newFlavor') as HTMLSelectElement)
                            .value;

                          if (!sel) return;

                          setEditing({
                            ...editing,
                            flavors: [
                              ...(editing.flavors || []),
                              {
                                id: generateId(),
                                name: sel,
                                ingredients: [],
                              },
                            ],
                          });
                        }}
                        className="px-3 py-1 rounded bg-emerald-500 text-white"
                      >
                        Adicionar sabor
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setEditing(null)} className="px-4 py-2 rounded border">
                  Cancelar
                </button>

                <button
                  onClick={() => save(editing)}
                  className="px-4 py-2 rounded bg-emerald-500 text-white"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Receitas;