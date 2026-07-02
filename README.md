Dindin Gourmet — Mini ERP

Visão geral
- App SPA em React + TypeScript + Vite para gestão de insumos, receitas, formação de preço, vendas e relatórios.
- Persistência: `IndexedDB` para `recipes` e `sales`; `zustand` com `localStorage` para estado adicional.

Principais fluxos implementados
- Insumos → Receitas → Formação de Preço → Vendas → Relatórios
- `Salvar simulação` na página de Formação de Preço salva simulações em `priceSimulations`.
- Vendas: CRUD com confirmação de exclusão, export/import CSV, export/import completo da app (JSON).
- Relatórios: filtros por data (campos De/Até).

Como rodar localmente
1. Instale dependências:

```bash
npm install
```

2. Rodar em desenvolvimento (hot-reload):

```bash
npm run dev
# abre em http://localhost:3006 por padrão neste workspace
```

3. Build para produção:

```bash
npm run build
```

Deploy
- Recomendado: Vercel (ou Netlify). Com Vercel, crie um projeto apontando para este repositório e configure:
  - Build command: `npm run build`
  - Output directory: `dist`
  - Framework: Vite

Export / Import de dados
- Exportar App (JSON): na página `Vendas` clique em `Exportar App (JSON)` para baixar um backup completo do estado da aplicação.
- Importar App (JSON): na página `Vendas` clique em `Importar App (JSON)` e selecione um arquivo JSON compatível (gerado pelo export).
- Exportar CSV (apenas `sales`): botão `Exportar CSV` na página `Vendas`.
- Importar CSV (apenas `sales`): botão `Importar CSV` na página `Vendas` (formato: `id,date,productId,productName,qty,price,payment,client`).

Notas técnicas
- DB IndexedDB: `dindin_gourmet_db`, stores `recipes` e `sales`.
- Para testes locais rápidos, a store foi exposta em `window.__APP_STORE` (útil para importar/inspecionar via console).

Próximos passos recomendados
- Polir mensagens de empty state e confirmar UX em telas menores.
- Implementar confirmação de alteração em massa e histórico de alterações mais detalhado.
- Adicionar testes automatizados (Playwright/Cypress) cobrindo o fluxo Preço → Vendas → Relatórios.

Contato
- Para continuar, me diga se quer que eu:
  - Adicione testes automáticos (Playwright), ou
  - Faça refinamentos visuais / confirmações extras, ou
  - Empacote instruções de deploy (Vercel) mais detalhadas.
