# 📊 Arquitetura Visual - Como o Projeto Funciona

```
┌────────────────────────────────────────────────────────────────┐
│                    🌐 SEU NAVEGADOR                            │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │           http://localhost:3005 (DEV)                   │ │
│  │           http://localhost:4173 (PREVIEW)               │ │
│  │                                                          │ │
│  │  ┌────────────────┐  ┌────────────────┐                │ │
│  │  │   Dashboard    │  │   Produtos     │                │ │
│  │  │   (Métricas)   │  │  (Gerenciar)   │                │ │
│  │  └────────────────┘  └────────────────┘                │ │
│  │                                                          │ │
│  │  ┌────────────────┐  ┌────────────────┐                │ │
│  │  │  Suprimentos   │  │   Vendas       │                │ │
│  │  │   (Estoque)    │  │  (Registrar)   │                │ │
│  │  └────────────────┘  └────────────────┘                │ │
│  │                                                          │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │          💵 Formação de Preços                    │ │ │
│  │  │          (Simulation)                             │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │            💾 Dados Locais (IndexedDB)                  │ │
│  │                                                          │ │
│  │  📊 recipes    💰 sales    🛒 products   📦 supplies    │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘

              ⬇️  Toda vez que salva um dado  ⬇️

┌────────────────────────────────────────────────────────────────┐
│              💽 IndexedDB (Banco de Dados Local)               │
│                                                                │
│  - Persistência automática                                    │
│  - Funciona offline                                           │
│  - Sincroniza entre abas                                      │
│  - Dados seguros no navegador                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Desenvolvimento

```
┌──────────────────┐
│   Editar código  │  ← Seu editor (VS Code)
│   em src/        │
└────────┬─────────┘
         │
         ⬇️  Salva arquivo
         │
┌────────────────────────────────┐
│   Vite Hot Reload              │
│   (recarga automática)          │
└────────┬───────────────────────┘
         │
         ⬇️  Em tempo real
         │
┌──────────────────────────────────┐
│   Navegador atualiza             │
│   (você vê a mudança)            │
└──────────────────────────────────┘
```

---

## 🚀 Fluxo de Deploy (GitHub Actions)

```
┌───────────────────────┐
│   Você faz push       │  ← git push origin main
│   git commit          │
└──────────┬────────────┘
           │
           ⬇️
┌──────────────────────────────────────┐
│   GitHub recebe o push               │
│   Dispara GitHub Actions             │
└──────────┬──────────────────────────┘
           │
           ⬇️  Automático
           │
┌──────────────────────────────────────┐
│   Runner (máquina no GitHub)         │
│                                      │
│   1. npm ci      (instala deps)     │
│   2. npm lint    (valida código)    │
│   3. npm build   (compila)          │
│   4. npm test:e2e (roda testes)     │
└──────────┬──────────────────────────┘
           │
           ⬇️
    ✅ SUCESSO ou ❌ FALHA
           │
           ⬇️
    Resultado no GitHub Actions
```

---

## 📁 Estrutura de Arquivos Importantes

```
CRM CODE/
│
├── 📄 COMO_USAR.md                   ← Você está aqui!
├── 📄 PRODUCAO_DOCUMENTACAO_FINAL.md ← Build & Deploy
├── 📄 SESSAO_PRODUCAO_SUMARIO.md     ← Resumo
│
├── src/                              ← EDITE AQUI
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Products.tsx
│   │   ├── Supplies.tsx
│   │   └── Vendas.tsx (não em uso)
│   │
│   ├── components/
│   │   ├── DataTable.tsx
│   │   ├── Layout.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── Select.tsx
│   │       └── Tabs.tsx
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   ├── utils/
│   │   ├── calculations.ts
│   │   ├── cn.ts
│   │   ├── db.ts (IndexedDB)
│   │   ├── exportImport.ts
│   │   └── storage.ts
│   │
│   ├── context/
│   │   └── store.ts (Zustand state)
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── dist/                             ← NÃO EDITE (build)
│   ├── index.html
│   ├── assets/
│   │   ├── index-*.css
│   │   └── index-*.js
│
├── .github/
│   └── workflows/
│       └── playwright.yml            ← CI/CD automático
│
├── node_modules/                     ← NÃO EDITE
│
├── package.json                      ← Scripts aqui
├── tsconfig.json                     ← Config TypeScript
├── vite.config.ts                    ← Config Vite
├── tailwind.config.js                ← Config Tailwind
└── eslint.config.js                  ← Config ESLint
```

---

## 🎯 O Que Cada Pasta Faz

| Pasta | Responsabilidade | Você edita? |
|-------|------------------|-------------|
| `src/pages/` | Telas completas | ✅ SIM |
| `src/components/` | Partes reutilizáveis | ✅ SIM |
| `src/types/` | Definições TypeScript | ✅ SIM |
| `src/utils/` | Funções úteis | ✅ SIM |
| `src/context/` | Estado global | ✅ SIM |
| `dist/` | Build final | ❌ NÃO |
| `node_modules/` | Dependências | ❌ NÃO |
| `.github/` | CI/CD automático | ⚠️ COM CUIDADO |

---

## 💡 Como Editar e Ver Mudanças

### Exemplo: Adicionar novo botão

1. **Abra:** `src/pages/Dashboard.tsx`
2. **Edite:** Adicione um novo `<Button>` em algum lugar
3. **Salve:** Ctrl+S
4. **Navegador:** Atualiza automaticamente (hot reload)
5. **Veja:** Mudança aparece em tempo real

### Exemplo: Mudar cor do Dashboard

1. **Abra:** `src/pages/Dashboard.tsx`
2. **Edite:** Mude as classes Tailwind
   ```jsx
   // Antes:
   <div className="bg-blue-50">
   
   // Depois:
   <div className="bg-red-50">
   ```
3. **Salve:** Ctrl+S
4. **Navegador:** Cor muda automaticamente

---

## 🧪 Testando o Build

### Testar localmente (como será em produção)

```bash
# Compilar
npm run build

# Rodar localmente
npm run preview

# Abrir
http://localhost:4173
```

---

## 📱 DevTools - Ferramentas de Desenvolvimento

### F12 → Abrir DevTools

#### Console Tab
- Ver logs do projeto
- Ver erros JavaScript
- Executar código JavaScript

#### Application Tab
- **IndexedDB** → Seus dados
- **LocalStorage** → Cache
- **Cookies** → Sessões

#### Network Tab
- Ver todas as requisições
- Verificar tempo de carga
- Debug de APIs

#### Performance Tab
- Analisar performance
- Ver bottlenecks
- Otimizar carregamento

---

## ✅ Checklist de Desenvolvimento

### Antes de começar
- [ ] Executei `npm install`
- [ ] Executei `npm run dev`
- [ ] Verifiquei em http://localhost:3005

### Enquanto desenvolvo
- [ ] Monitoro console (F12)
- [ ] Salvo arquivos frequentemente
- [ ] Testo em múltiplos navegadores

### Antes de fazer push
- [ ] Executei `npm run lint`
- [ ] Executei `npm run build`
- [ ] Testei em `npm run preview`
- [ ] Verifiquei dados em DevTools

### Após fazer push
- [ ] Verifiquei GitHub Actions
- [ ] Confirmei que passou

---

## 🎓 Resumo Visual - Ciclo Completo

```
╔════════════════════════════════════════════════════════════════╗
║                   SEU WORKFLOW DIÁRIO                         ║
╚════════════════════════════════════════════════════════════════╝

MANHÃ:
  git pull origin main          (puxar atualizações)
  npm run dev                   (iniciar dev server)

DURANTE O DIA:
  Editar em src/                (seu código)
  F12 para debugar              (se tiver erro)
  npm run lint                  (validar)
  npm run build                 (compilar)

FINAL DO DIA:
  git add .                     (adicionar mudanças)
  git commit -m "feature: ..." (descrever)
  git push origin main          (enviar)
  Verificar GitHub Actions      (passou?)

PRÓXIMA MANHÃ:
  Volta ao início ↩️
```

---

## 🏁 Pronto para Começar?

```bash
npm run dev
```

Seu projeto estará em: **http://localhost:3005**

**Boa sorte! 🚀**
