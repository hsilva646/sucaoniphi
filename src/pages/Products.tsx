import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { DataTable, Column } from '@/components/DataTable';
import { useStore } from '@/context/store';
import { generateId, formatDate, formatCurrency } from '@/utils/calculations';
import { Product } from '@/types';
import { motion } from 'framer-motion';

interface ProductsProps {
  // Products component props
}

const Products: React.FC<ProductsProps> = () => {
  const { products, addProduct, updateProduct, deleteProduct, duplicateProduct } = useStore();
  const defaultFlavors = [
    'brigadeiro', 'limão', 'maracujá', 'maracujá trufado', 'romeu e julieta', 'doce de leite com ameixa',
    'doce de leite trufado', 'ninho com nutela', 'ninho com morango', 'açai', 'amendoim', 'delicia de abacaxi',
    'pudim', 'coco', 'cappuccino com doce de leite',
  ];

  const addFlavorProduct = (name: string) => {
    if (products.some((p) => p.name.toLowerCase() === name.toLowerCase())) return;
    const newProduct: Product = {
      id: generateId(),
      name: name.charAt(0).toUpperCase() + name.slice(1),
      category: 'Sabores',
      code: `SAB-${name.slice(0, 3).toUpperCase()}`,
      description: `Sabor ${name} da receita`,
      supplier: 'Receita',
      createdAt: new Date().toISOString(),
      status: 'active',
      unit: 'un',
      quantityProduced: 1,
      weight: 0,
      volume: 0,
      notes: 'Produto gerado a partir dos sabores de receita',
      favorited: false,
      price: 0,
    };
    addProduct(newProduct);
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: '',
    code: '',
    description: '',
    supplier: '',
    status: 'active',
    unit: 'un',
    quantityProduced: 0,
    weight: 0,
    volume: 0,
    notes: '',
    favorited: false,
    price: 0,
  });

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setFormData(product);
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        category: '',
        code: '',
        description: '',
        supplier: '',
        status: 'active',
        unit: 'un',
        quantityProduced: 0,
        weight: 0,
        volume: 0,
        notes: '',
        favorited: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.code) {
      alert('Preencha os campos obrigatórios');
      return;
    }

    if (editingId) {
      updateProduct(editingId, formData);
    } else {
      const newProduct: Product = {
        id: generateId(),
        name: formData.name || '',
        category: formData.category || '',
        code: formData.code || '',
        description: formData.description || '',
        supplier: formData.supplier || '',
        createdAt: new Date().toISOString(),
        status: formData.status || 'active',
        unit: formData.unit || 'un',
        quantityProduced: formData.quantityProduced || 0,
        weight: formData.weight || 0,
        volume: formData.volume || 0,
        notes: formData.notes || '',
        favorited: false,
        price: formData.price || 0,
      };
      addProduct(newProduct);
    }

    setIsModalOpen(false);
  };

  const columns: Column<Product>[] = [
    {
      id: 'name',
      label: 'Nome',
      sortable: true,
      filterable: true,
      width: '25%',
    },
    {
      id: 'category',
      label: 'Categoria',
      sortable: true,
      filterable: true,
      width: '15%',
    },
    {
      id: 'code',
      label: 'Código',
      sortable: true,
      filterable: true,
      width: '12%',
    },
    {
      id: 'supplier',
      label: 'Fornecedor',
      sortable: true,
      width: '15%',
    },
    {
      id: 'quantityProduced',
      label: 'Quantidade',
      sortable: true,
      width: '10%',
    },
    {
      id: 'price',
      label: 'Preço Unit.',
      sortable: true,
      render: (value: unknown) => {
        const numValue = typeof value === 'number' ? value : 0;
        return numValue ? formatCurrency(numValue) : '—';
      },
      width: '12%',
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          value === 'active' ? 'bg-financial-green/10 text-financial-green' :
          value === 'inactive' ? 'bg-accent-gold/10 text-accent-gold' :
          'bg-financial-red/10 text-financial-red'
        }`}>
          {value === 'active' ? 'Ativo' : value === 'inactive' ? 'Inativo' : 'Descontinuado'}
        </span>
      ),
      width: '12%',
    },
    {
      id: 'createdAt',
      label: 'Data Criação',
      sortable: true,
      render: (value: unknown) => {
        const dateValue = value instanceof Date ? value : (typeof value === 'string' ? value : new Date());
        return formatDate(dateValue);
      },
      width: '12%',
    },
  ];


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total de Produtos</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{products.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">Ativos</p>
            <p className="text-3xl font-bold text-financial-green">
              {products.filter((p) => p.status === 'active').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">Favoritos</p>
            <p className="text-3xl font-bold text-accent-gold">
              {products.filter((p) => p.favorited).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sabores Prontos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {defaultFlavors.map((flavor) => (
              <button
                key={flavor}
                onClick={() => addFlavorProduct(flavor)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-left text-sm font-semibold hover:bg-slate-100"
              >
                {flavor}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
      <DataTable<Product>
        columns={columns}
        data={products}
        title="Produtos"
        searchable={true}
        paginated={true}
        onEdit={handleOpenModal}
        onDelete={deleteProduct}
        onDuplicate={(row) => duplicateProduct(row.id)}
        actionButton={
          <Button
            onClick={() => handleOpenModal()}
            icon={<Plus className="h-4 w-4" />}
          >
            Novo Produto
          </Button>
        }
        emptyState={
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Nenhum produto cadastrado</p>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Produto
            </Button>
          </div>
        }
      />

      {/* Modal de Edição/Criação */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Editar Produto' : 'Novo Produto'}
        size="lg"
        footer={
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingId ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <Input
            label="Nome *"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nome do produto"
          />

          <Input
            label="Código *"
            value={formData.code || ''}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="Código único"
          />

          <Input
            label="Categoria"
            value={formData.category || ''}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="Ex: Alimentos, Bebidas"
          />

          <Input
            label="Fornecedor"
            value={formData.supplier || ''}
            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
            placeholder="Nome do fornecedor"
          />

          <Input
            label="Descrição"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descrição detalhada"
          />

          <Select
            label="Status"
            value={formData.status || 'active'}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            options={[
              { value: 'active', label: 'Ativo' },
              { value: 'inactive', label: 'Inativo' },
              { value: 'discontinued', label: 'Descontinuado' },
            ]}
          />

          <Select
            label="Unidade de Medida"
            value={formData.unit || 'un'}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            options={[
              { value: 'un', label: 'Unidade' },
              { value: 'kg', label: 'Quilograma' },
              { value: 'l', label: 'Litro' },
              { value: 'm', label: 'Metro' },
              { value: 'caixa', label: 'Caixa' },
            ]}
          />

          <Input
            label="Preço Unitário"
            type="number"
            value={formData.price || 0}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            placeholder="0"
          />

          <Input
            label="Quantidade Produzida"
            type="number"
            value={formData.quantityProduced || 0}
            onChange={(e) => setFormData({ ...formData, quantityProduced: parseFloat(e.target.value) })}
            placeholder="0"
          />

          <Input
            label="Peso (kg)"
            type="number"
            value={formData.weight || 0}
            onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
            placeholder="0"
          />

          <Input
            label="Volume (L)"
            type="number"
            value={formData.volume || 0}
            onChange={(e) => setFormData({ ...formData, volume: parseFloat(e.target.value) })}
            placeholder="0"
          />

          <Input
            label="Observações"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Notas adicionais"
          />
        </div>
      </Modal>
    </motion.div>
  );
};

export default Products;
