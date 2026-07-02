import React, { useState } from 'react';
import { useStore } from '@/context/store';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const Configuracoes: React.FC = () => {
  const store = useStore();
  const [settings, setSettings] = useState(() => ({
    ...store.settings,
    laborSalaryMonthly: store.settings.laborSalaryMonthly ?? 1700,
    laborWorkingDays: store.settings.laborWorkingDays ?? 24,
    laborWorkingHoursPerDay: store.settings.laborWorkingHoursPerDay ?? 5,
    fixedCostMonthly: store.settings.fixedCostMonthly ?? 975,
    variableCostMonthly: store.settings.variableCostMonthly ?? 165,
  }));

  const monthlyWorkHours = settings.laborWorkingDays * settings.laborWorkingHoursPerDay;
  const laborHourlyRate = monthlyWorkHours > 0 ? settings.laborSalaryMonthly / monthlyWorkHours : 0;
  const fixedCostHourly = monthlyWorkHours > 0 ? settings.fixedCostMonthly / monthlyWorkHours : 0;
  const variableCostHourly = monthlyWorkHours > 0 ? settings.variableCostMonthly / monthlyWorkHours : 0;

  const save = () => {
    store.updateSettings(settings);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Configurações e Custos Gerais</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-white p-4">
          <p className="font-semibold">Empresa</p>
          <Input label="Nome da empresa" value={settings.company.name} onChange={(e) => setSettings({ ...settings, company: { ...settings.company, name: e.target.value } })} />
          <Input label="Margem padrão (%)" type="number" value={String(settings.defaultMargin * 100)} onChange={(e) => setSettings({ ...settings, defaultMargin: parseFloat(e.target.value) / 100 })} />
          <Input label="Imposto padrão (%)" type="number" value={String(settings.defaultTaxPercentage)} onChange={(e) => setSettings({ ...settings, defaultTaxPercentage: parseFloat(e.target.value) })} />
          <Input label="Markup padrão" type="number" value={String(settings.defaultMarkup)} onChange={(e) => setSettings({ ...settings, defaultMarkup: parseFloat(e.target.value) })} />
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="font-semibold">Custos de Mão de Obra</p>
          <Input label="Salário Mensal (R$)" type="number" value={settings.laborSalaryMonthly} onChange={(e) => setSettings({ ...settings, laborSalaryMonthly: parseFloat(e.target.value) || 0 })} />
          <Input label="Dias trabalhados por mês" type="number" value={settings.laborWorkingDays} onChange={(e) => setSettings({ ...settings, laborWorkingDays: parseFloat(e.target.value) || 0 })} />
          <Input label="Horas trabalhadas por dia" type="number" value={settings.laborWorkingHoursPerDay} onChange={(e) => setSettings({ ...settings, laborWorkingHoursPerDay: parseFloat(e.target.value) || 0 })} />

          <div className="mt-4 rounded-lg border bg-slate-50 p-3">
            <p className="text-sm text-gray-600">Total de horas mensais</p>
            <p className="text-lg font-semibold">{monthlyWorkHours}</p>
            <p className="text-sm text-gray-600">Valor hora mão de obra</p>
            <p className="text-lg font-semibold">R$ {laborHourlyRate.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-white p-4">
          <p className="font-semibold">Custo Fixo</p>
          <Input label="Despesa fixa mensal (R$)" type="number" value={settings.fixedCostMonthly} onChange={(e) => setSettings({ ...settings, fixedCostMonthly: parseFloat(e.target.value) || 0 })} />
          <p className="mt-3 text-sm text-gray-600">Valor fixo por hora</p>
          <p className="text-lg font-semibold">R$ {fixedCostHourly.toFixed(2)}</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="font-semibold">Custo Variável</p>
          <Input label="Despesa variável mensal (R$)" type="number" value={settings.variableCostMonthly} onChange={(e) => setSettings({ ...settings, variableCostMonthly: parseFloat(e.target.value) || 0 })} />
          <p className="mt-3 text-sm text-gray-600">Valor variável por hora</p>
          <p className="text-lg font-semibold">R$ {variableCostHourly.toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-4">
        <Button onClick={save}>Salvar</Button>
      </div>
    </div>
  );
};

export default Configuracoes;
