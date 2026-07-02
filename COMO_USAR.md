# 🚀 Como Usar o Projeto

## ⚡ Quick Start (5 minutos)

### 1. Inicie o projeto
```bash
npm run dev
```
Abra: **http://localhost:3005**

✅ Pronto! Projeto rodando com hot reload.

---

## 📖 Guias de Uso

### 🔧 Desenvolvimento

```bash
# Iniciar servidor com hot reload
npm run dev

# Validar código durante desenvolvimento
npm run lint

# Compilar TypeScript (verificar erros)
npm run build
```

### 🧪 Testes

```bash
# Rodar testes E2E (Playwright)
npm run test:e2e

# Ou preview + testes
npm run build && npm run preview
```

### 🏗️ Build para Produção

```bash
# Compilar tudo
npm run build

# Resultado em: ./dist/

# Testar build localmente
npm run preview
# Acessa: http://localhost:4173
```

---

## 📁 Onde Está Cada Coisa?

| Pasta | O que é | Edite aqui para... |
|-------|---------|-------------------|
| `src/pages/` | Telas principais | Adicionar novas páginas |
| `src/components/` | Componentes | Criar novos componentes |
| `src/types/` | Tipos TypeScript | Definir tipos globais |
| `src/utils/` | Funções úteis | Adicionar helpers |
| `src/context/` | Estado global (Zustand) | Gerenciar dados |
| `dist/` | Build final | NÃO EDITE |

---

## 💾 Dados e Persistência

### Onde os dados ficam?
- **IndexedDB** (banco de dados do navegador)
- **Database:** `dindin_gourmet_db`
- **Stores:** recipes, sales, products, supplies

### Como ver os dados?
1. Abra DevTools: **F12**
2. Vá para: **Application** → **IndexedDB**
3. Expanda: **dindin_gourmet_db**
4. Veja as tabelas

### ⚠️ IMPORTANTE
- Dados são **locais** no navegador
- Limpar cache = **perder dados**
- Sempre faça **backup** (exportar dados)

---

## 🔄 Git e GitHub

### Atualizar código
```bash
# Puxar do GitHub
git pull origin main
```

### Enviar mudanças
```bash
# Ver mudanças
git status

# Adicionar tudo
git add .

# Criar commit
git commit -m "feat: descrição da mudança"

# Enviar para GitHub
git push origin main
```

### Ver histórico
```bash
# Últimos 5 commits
git log --oneline -5

# Todos os commits
git log --oneline
```

---

## ✅ Checklist Antes de Trabalhar

- [ ] Executei `npm install`
- [ ] Executei `npm run dev`
- [ ] Verifiquei em http://localhost:3005
- [ ] Verifiquei `npm run lint` (sem erros)
- [ ] Executei `npm run build` (sem erros)

---

## 🐛 Problemas Comuns

### ❌ "npm: comando não encontrado"
**Solução:** Instale Node.js (20 LTS recomendado)

### ❌ "Porta 3005 já está em uso"
**Solução 1:**
```bash
npm run dev -- --port 3007
```

**Solução 2:** Matar processo na porta
```bash
# Listar processos
netstat -ano | findstr :3005

# Matar processo (substitua <PID>)
taskkill /PID <PID> /F
```

### ❌ "Build falha com erro de módulo"
**Solução:**
```bash
# Limpar tudo
rm -r node_modules
npm cache clean --force

# Reinstalar
npm install

# Tentar novamente
npm run build
```

### ❌ "Dados não aparecem no dashboard"
**Verificar:**
1. Abra DevTools (F12)
2. Console: procure por erros
3. Application → IndexedDB → dindin_gourmet_db
4. Tente: `npm run build && npm run preview`

### ❌ "GitHub Actions está falhando"
**Verificar:**
1. Vá em: https://github.com/hsilva646/sucaoniphi/actions
2. Clique na execução que falhou
3. Veja os logs
4. Se local funciona, pode ser issue de rede

---

## 📊 Scripts npm Disponíveis

| Comando | O que faz |
|---------|-----------|
| `npm run dev` | Inicia dev server (hot reload) |
| `npm run build` | Compila para produção |
| `npm run preview` | Preview do build (modo produção local) |
| `npm run lint` | Valida código |
| `npm run test:e2e` | Executa testes E2E |

---

## 📈 Fluxo de Trabalho Recomendado

### 👨‍💻 Quando está desenvolvendo

```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Enquanto edita
npm run lint  # Depois de grandes mudanças

# Terminal 3: Antes de comitar
npm run build
```

### 🚀 Antes de fazer push

```bash
# Validar tudo
npm run lint
npm run build
npm run test:e2e

# Se passar, fazer commit
git add .
git commit -m "feat: descrição"
git push origin main
```

---

## 🔍 Debug e Desenvolvimento

### DevTools do Navegador
Pressione **F12** para abrir:
- **Console:** Ver logs e erros
- **Network:** Ver requisições
- **Application:** Ver dados persistidos
- **Performance:** Analisar performance

### VS Code Extensions Recomendadas
- ✅ ES7+ React/Redux/React-Native snippets
- ✅ Prettier - Code formatter
- ✅ ESLint
- ✅ Tailwind CSS IntelliSense
- ✅ Thunder Client (para testar APIs)

---

## 📞 Suporte & Referências

### Links Importantes
- **Código:** https://github.com/hsilva646/sucaoniphi
- **Actions:** https://github.com/hsilva646/sucaoniphi/actions
- **Docs:** Veja arquivos .md na raiz

### Documentação Externa
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Vite Docs](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 🎯 Resumo Rápido

✅ **Iniciar:** `npm run dev` → http://localhost:3005

✅ **Validar:** `npm run lint`

✅ **Build:** `npm run build`

✅ **Dados:** IndexedDB (F12 → Application)

✅ **GitHub:** `git push origin main`

✅ **CI/CD:** Automático no push

---

**Pronto para começar! 🚀 Qualquer dúvida, consulte a documentação detalhada.**
