import React, { useState } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { DataTable, Column } from '@/components/DataTable';
import { useStore } from '@/context/store';
import { generateId, formatCurrency } from '@/utils/calculations';
import { Supply } from '@/types';
import { Badge } from '@/components/ui/index';
import { motion } from 'framer-motion';

const Supplies: React.FC = () => {
  const { supplies, addSupply, updateSupply, deleteSupply } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Supply>>({
    name: '',
    code: '',
    price: 0,
    purchasedQuantity: 0,
    quantityInStock: 0,
    averagePrice: 0,
    unit: 'un',
    category: '',
    supplier: '',
    minimumStock: 0,
    validity: '',
    lastPurchase: '',
    priceHistory: [],
  });

  const calcularCustoUnitario = (precoPago: number, quantidadeComprada: number) => {
    if (!quantidadeComprada || quantidadeComprada <= 0) return 0;
    return precoPago / quantidadeComprada;
  };

  const handleOpenModal = (supply?: Supply) => {
    if (supply) {
      setEditingId(supply.id);
      setFormData({
        name: supply.name,
        price: supply.price,
        purchasedQuantity: supply.purchasedQuantity,
        quantityInStock: supply.quantityInStock,
        unit: supply.unit,
        averagePrice:
          supply.averagePrice !== undefined && supply.averagePrice !== null
            ? supply.averagePrice
            : supply.purchasedQuantity && supply.purchasedQuantity > 0
            ? supply.price / supply.purchasedQuantity
            : 0,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        price: 0,
        purchasedQuantity: 0,
        quantityInStock: 0,
        unit: 'un',
        averagePrice: 0,
      });
    }

    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) return;

    const precoUnitario = Number(formData.price) || 0;
    const quantidadeComprada = Number(formData.purchasedQuantity) || 0;

    const payload: Partial<Supply> = {
      name: formData.name,
      price: precoUnitario,
      purchasedQuantity: quantidadeComprada,
      quantityInStock: Number(formData.quantityInStock) || 0,
      unit: formData.unit || 'un',
      averagePrice: quantidadeComprada > 0 ? precoUnitario / quantidadeComprada : precoUnitario,
    };

    if (editingId) {
      updateSupply(editingId, payload);
    } else {
      const supply: Supply = {
        id: generateId(),
        name: formData.name || '',
        category: '',
        supplier: '',
        code: '',
        price: precoUnitario,
        unit: formData.unit || 'un',
        purchasedQuantity: quantidadeComprada,
        quantityInStock: Number(formData.quantityInStock) || 0,
        minimumStock: 0,
        validity: '',
        lastPurchase: '',
        averagePrice: precoUnitario,
        priceHistory: [],
      };

      addSupply(supply);
    }

    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      name: '',
      code: '',
      price: 0,
      purchasedQuantity: 0,
      quantityInStock: 0,
      averagePrice: 0,
      unit: 'un',
      category: '',
      supplier: '',
      minimumStock: 0,
      validity: '',
      lastPurchase: '',
      priceHistory: [],
    });
  };

  const lowStockSupplies = supplies.filter((s) => s.quantityInStock <= s.minimumStock);

  const valorTotalEstoque = supplies.reduce((total, insumo) => {
    const custoUnitario = insumo.averagePrice || calcularCustoUnitario(insumo.price, insumo.purchasedQuantity || insumo.quantityInStock);
    return total + custoUnitario * insumo.quantityInStock;
  }, 0);

  const columns: Column<Supply>[] = [
    { id: 'name', label: 'Nome', sortable: true, width: '25%' },
    { id: 'quantityInStock', label: 'Estoque', sortable: true, width: '12%' },
    { id: 'minimumStock', label: 'Mínimo', sortable: true, width: '10%' },
    {
      id: 'quantityInStock',
      label: 'Status',
      render: (value, row: Supply) => (
        <Badge variant={value <= row.minimumStock ? 'error' : 'success'}>
          {value <= row.minimumStock ? 'Baixo' : 'OK'}
        </Badge>
      ),
      width: '10%',
    },
    {
      id: 'price',
      label: 'Preço Pago',
      render: (value) => formatCurrency(value),
      width: '15%',
    },
    {
      id: 'averagePrice',
      label: 'Custo Unit.',
      render: (value) => formatCurrency(value || 0),
      width: '15%',
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => handleOpenModal()} icon={<Plus className="h-4 w-4" />}>
          Novo Insumo
        </Button>
      </div>

      {lowStockSupplies.length > 0 && (
        <Card className="border-l-4 border-l-financial-red bg-financial-red/5">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-financial-red flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-financial-red">Estoque Baixo</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {lowStockSupplies.length} insumo(s) com estoque abaixo do mínimo
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total de Insumos</p>
            <p className="text-3xl font-bold">{supplies.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Valor Total em Estoque</p>
            <p className="text-3xl font-bold text-financial-green">
              {formatCurrency(valorTotalEstoque)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Estoques Baixos</p>
            <p className="text-3xl font-bold text-financial-red">{lowStockSupplies.length}</p>
          </CardContent>
        </Card>
      </div>

      <DataTable<Supply>
        columns={columns}
        data={supplies}
        searchable={true}
        onEdit={handleOpenModal}
        onDelete={deleteSupply}
        actionButton={
          <Button onClick={() => handleOpenModal()} icon={<Plus className="h-4 w-4" />}>
            Novo Insumo
          </Button>
        }
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Editar Insumo' : 'Novo Insumo'}
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>{editingId ? 'Atualizar' : 'Criar'}</Button>
          </div>
        }
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <Input
            label="Nome do Produto *"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <Input
            label="Preço Unitário"
            type="number"
            value={formData.price || 0}
            onChange={(e) => {
              const precoTotal = parseFloat(e.target.value) || 0;
              const quantidadeComprada = Number(formData.purchasedQuantity) || 0;
              const novoAverage = quantidadeComprada > 0 ? precoTotal / quantidadeComprada : formData.averagePrice || 0;

              setFormData({
                ...formData,
                price: precoTotal,
                averagePrice: novoAverage,
              });
            }}
          />

          <Input
            label="Quantidade Comprada"
            type="number"
            value={formData.purchasedQuantity || 0}
            onChange={(e) => {
              const quantidadeComprada = parseFloat(e.target.value) || 0;
              const precoTotal = Number(formData.price) || 0;
              const novoAverage = quantidadeComprada > 0 ? precoTotal / quantidadeComprada : formData.averagePrice || 0;

              setFormData({
                ...formData,
                purchasedQuantity: quantidadeComprada,
                averagePrice: novoAverage,
              });
            }}
          />

          <Input
            label="Estoque Atual"
            type="number"
            value={formData.quantityInStock || 0}
            onChange={(e) => {
              setFormData({
                ...formData,
                quantityInStock: parseFloat(e.target.value) || 0,
              });
            }}
          />

          <Select
            label="Unidade"
            options={[
              { value: 'g', label: 'g' },
              { value: 'kg', label: 'kg' },
              { value: 'ml', label: 'ml' },
              { value: 'l', label: 'L' },
              { value: 'un', label: 'Unidade' },
            ]}
            value={formData.unit || 'un'}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          />
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Custo unitário estimado</div>
            <div className="text-lg font-semibold">{formatCurrency(
              formData.averagePrice || calcularCustoUnitario(Number(formData.price) || 0, Number(formData.purchasedQuantity) || 0)
            )}</div>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export { Supplies };