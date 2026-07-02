import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useStore } from '@/context/store';
import { formatCurrency } from '@/utils/calculations';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Package } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, trend = 'neutral' }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {change !== undefined && (
              <div className="mt-2 flex items-center gap-1">
                {trend === 'up' && <TrendingUp className="h-4 w-4 text-financial-green" />}
                {trend === 'down' && <TrendingDown className="h-4 w-4 text-financial-red" />}
                <span className={trend === 'up' ? 'text-financial-green' : 'text-financial-red'}>
                  {Math.abs(change).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          <div className="text-3xl opacity-50">{icon}</div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const Dashboard: React.FC = () => {
  const { products, directCosts, indirectCosts, extraCosts, settings } = useStore();

  const monthlyWorkHours = settings.laborWorkingDays * settings.laborWorkingHoursPerDay;
  const laborHourlyRate = monthlyWorkHours > 0 ? settings.laborSalaryMonthly / monthlyWorkHours : 0;
  const fixedCostHourly = monthlyWorkHours > 0 ? settings.fixedCostMonthly / monthlyWorkHours : 0;
  const variableCostHourly = monthlyWorkHours > 0 ? settings.variableCostMonthly / monthlyWorkHours : 0;

  const metrics = useMemo(() => {
    if (products.length === 0) {
      return { totalProducts: 0, averageCost: 0, totalRevenue: 0, totalProfit: 0, averageMargin: 0, roi: 0, averageMarkup: 1.0, averageTicket: 0 };
    }

    const totalDirectCost = directCosts.reduce((sum, c) => sum + c.totalPrice, 0);
    const totalIndirectCost = indirectCosts.reduce((sum, c) => sum + c.amount, 0);
    const totalExtraCost = extraCosts.reduce((sum, c) => sum + c.amount, 0);
    const totalCost = totalDirectCost + totalIndirectCost + totalExtraCost;

    const averageCost = totalCost / products.length;
    const totalRevenue = products.reduce((sum, p) => sum + (averageCost * (p.quantityProduced || 1) * 2), 0);
    const totalProfit = totalRevenue - totalCost;
    const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const roi = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
    const averageMarkup = totalCost > 0 ? totalRevenue / totalCost : 1;
    const averageTicket = totalRevenue / (products.length || 1);

    return { totalProducts: products.length, averageCost, totalRevenue, totalProfit, averageMargin, roi, averageMarkup, averageTicket };
  }, [products, directCosts, indirectCosts, extraCosts]);

  const costDistribution = useMemo(() => {
    const totalDirectCost = directCosts.reduce((sum, c) => sum + c.totalPrice, 0);
    const totalIndirectCost = indirectCosts.reduce((sum, c) => sum + c.amount, 0);
    const totalExtraCost = extraCosts.reduce((sum, c) => sum + c.amount, 0);
    const laborCost = settings.laborSalaryMonthly;
    const fixedOverhead = settings.fixedCostMonthly;
    const variableOverhead = settings.variableCostMonthly;
    return [
      { name: 'Diretos', value: totalDirectCost },
      { name: 'Indiretos', value: totalIndirectCost },
      { name: 'Extras', value: totalExtraCost },
      { name: 'Mão de Obra', value: laborCost },
      { name: 'Fixos', value: fixedOverhead },
      { name: 'Variáveis', value: variableOverhead },
    ].filter((item) => item.value > 0);
  }, [directCosts, indirectCosts, extraCosts, settings]);

  const topProducts = useMemo(() => products.slice(0, 5).map((p) => ({ name: p.name, revenue: (p.quantityProduced || 1) * 100, profit: (p.quantityProduced || 1) * 40 })), [products]);

  const COLORS = ['#0d7377', '#10b981', '#f59e0b'];

  const profitEvolution = useMemo(() => [
    { month: 'Jan', profit: Math.random() * 10000, revenue: Math.random() * 25000 },
    { month: 'Fev', profit: Math.random() * 12000, revenue: Math.random() * 30000 },
    { month: 'Mar', profit: Math.random() * 15000, revenue: Math.random() * 35000 },
    { month: 'Abr', profit: Math.random() * 18000, revenue: Math.random() * 40000 },
    { month: 'Mai', profit: Math.random() * 20000, revenue: Math.random() * 45000 },
    { month: 'Jun', profit: metrics.totalProfit, revenue: metrics.totalRevenue },
  ], [metrics]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total de Produtos" value={metrics.totalProducts} icon={<Package className="h-6 w-6" />} trend="up" change={15} />
        <MetricCard title="Custo Médio" value={formatCurrency(metrics.averageCost)} icon={<DollarSign className="h-6 w-6" />} trend="down" change={8} />
        <MetricCard title="Receita Total" value={formatCurrency(metrics.totalRevenue)} icon={<DollarSign className="h-6 w-6" />} trend="up" change={25} />
        <MetricCard title="Lucro Total" value={formatCurrency(metrics.totalProfit)} icon={<TrendingUp className="h-6 w-6" />} trend="up" change={32} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hora de mão de obra</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(laborHourlyRate)}</p>
            <p className="text-sm text-gray-500">Com base em {settings.laborWorkingDays} dias/mês e {settings.laborWorkingHoursPerDay}h por dia</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Custo fixo por hora</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(fixedCostHourly)}</p>
            <p className="text-sm text-gray-500">Despesa fixa mensal: {formatCurrency(settings.fixedCostMonthly)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Custo variável por hora</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(variableCostHourly)}</p>
            <p className="text-sm text-gray-500">Despesa variável mensal: {formatCurrency(settings.variableCostMonthly)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {costDistribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Custos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={costDistribution} cx="50%" cy="50%" labelLine={false} label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`} outerRadius={100} fill="#8884d8" dataKey="value">
                    {costDistribution.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {topProducts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#0d7377" name="Receita" />
                  <Bar dataKey="profit" fill="#10b981" name="Lucro" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evolução de Lucro e Receita</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={profitEvolution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#0d7377" strokeWidth={2} name="Receita" dot={{ fill: '#0d7377' }} />
              <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Lucro" dot={{ fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
