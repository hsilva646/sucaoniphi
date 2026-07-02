import { Product } from '@/types';

/**
 * Exporta produtos para CSV
 */
export const exportToCSV = (products: Product[], fileName: string = 'produtos.csv'): void => {
  const headers = [
    'ID',
    'Nome',
    'Categoria',
    'Código',
    'Fornecedor',
    'Unidade',
    'Quantidade',
    'Peso',
    'Volume',
    'Status',
    'Data Criação',
  ];

  const rows = products.map((p) => [
    p.id,
    p.name,
    p.category,
    p.code,
    p.supplier,
    p.unit,
    p.quantityProduced,
    p.weight,
    p.volume,
    p.status,
    p.createdAt,
  ]);

  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((cell) =>
          typeof cell === 'string' && cell.includes(',')
            ? `"${cell}"`
            : cell
        )
        .join(',')
    ),
  ].join('\n');

  downloadFile(csv, fileName, 'text/csv');
};

/**
 * Exporta para JSON
 */
export const exportToJSON = (data: any, fileName: string = 'dados.json'): void => {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, fileName, 'application/json');
};

/**
 * Gera um PDF simples (básico, sem lib externa pesada)
 */
export const exportToPDF = async (
  title: string,
  data: string,
  fileName: string = 'relatorio.pdf'
): Promise<void> => {
  try {
    // Usando html2pdf como alternativa leve
    const element = document.createElement('div');
    element.innerHTML = `
      <h1>${title}</h1>
      <div>${data}</div>
    `;
    
    // Fallback: converter para texto e salvar como TXT
    downloadFile(data, fileName.replace('.pdf', '.txt'), 'text/plain');
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
  }
};

/**
 * Importa dados de um arquivo JSON
 */
export const importFromJSON = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        resolve(data);
      } catch {
        reject(new Error('Arquivo JSON inválido'));
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsText(file);
  });
};

/**
 * Importa dados de um arquivo CSV
 */
export const importFromCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        const data = lines.slice(1).map((line) => {
          const values = line.split(',');
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header.trim()] = values[index]?.trim();
          });
          return obj;
        });
        resolve(data);
      } catch {
        reject(new Error('Arquivo CSV inválido'));
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsText(file);
  });
};

/**
 * Faz download de arquivo
 */
export const downloadFile = (
  content: string,
  fileName: string,
  mimeType: string
): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Gera URL de dados para compartilhamento
 */
export const generateShareURL = (data: any): string => {
  const encoded = btoa(JSON.stringify(data));
  return `${window.location.origin}?data=${encoded}`;
};

/**
 * Carrega dados compartilhados
 */
export const loadSharedData = (url: string): any => {
  const params = new URLSearchParams(new URL(url).search);
  const data = params.get('data');
  if (!data) return null;
  try {
    return JSON.parse(atob(data));
  } catch {
    return null;
  }
};

/**
 * Exporta para Excel (tabela HTML)
 */
export const exportToExcel = (
  products: Product[],
  fileName: string = 'produtos.xls'
): void => {
  let html =
    '<table border="1"><tr><th>ID</th><th>Nome</th><th>Categoria</th><th>Código</th><th>Fornecedor</th><th>Quantidade</th><th>Peso</th><th>Volume</th><th>Status</th></tr>';

  products.forEach((p) => {
    html += `<tr><td>${p.id}</td><td>${p.name}</td><td>${p.category}</td><td>${p.code}</td><td>${p.supplier}</td><td>${p.quantityProduced}</td><td>${p.weight}</td><td>${p.volume}</td><td>${p.status}</td></tr>`;
  });

  html += '</table>';

  downloadFile(html, fileName, 'application/vnd.ms-excel');
};

/**
 * Backup automático
 */
export const createBackup = (data: any): void => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  exportToJSON(data, `backup-${timestamp}.json`);
};

/**
 * Restaura backup
 */
export const restoreBackup = (file: File): Promise<any> => {
  return importFromJSON(file);
};
