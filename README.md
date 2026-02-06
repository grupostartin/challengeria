# 🚀 UPStartin | Ecosystem for Content Creators & Digital Business

![Banner Challengeria](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

## 📄 PRD: Documentação de Produto (Product Requirements Document)

---

### 1. Visão Geral do Produto
**UPStartin** é uma plataforma "tudo-em-um" desenhada para criadores de conteúdo, agências e profissionais liberais que buscam centralizar sua operação. O projeto combina ferramentas de CRM, Gestão de Projetos (Conteúdo), Financeiro e Marketing (Link-in-Bio) em uma única interface moderna e responsiva.

---

### 2. Objetivos Principais
- **Centralização**: Eliminar a necessidade de múltiplas ferramentas (Linktree, Trello, Planilhas, CRM externo).
- **Escalabilidade**: Oferecer uma estrutura que suporte desde o criador solo até pequenas agências.
- **Profissionalismo**: Prover um Portal do Cliente e páginas de Bio que transmitam autoridade.

---

### 3. Módulos e Funcionalidades Core

#### 📁 Gestão de Projetos & Criatividade
- **Workflow Kanban**: Gestão visual do status de produção (Ideia, Roteiro, Gravação, Edição, Postado).

#### 👥 CRM & Relacionamento
- **Gestão de Clientes**: Banco de dados centralizado com histórico e contatos.
- **Controle de Contratos**: Gestão de documentos, datas de vencimento e status de assinatura.
- **Portal do Cliente**: Área logada (ou via link seguro) para o cliente acompanhar o progresso de seus projetos.

#### 💰 Gestão Operacional & Financeira
- **Gestão de Vendas**: Registro de transações e performance comercial.
- **Centro Financeiro**: Fluxo de caixa, controle de entradas/saídas e metas.
- **Controle de Estoque**: Gerenciamento de itens físicos ou licenças digitais.
- **Agenda**: Calendário integrado para sessões, reuniões e deadlines.

#### 🔗 Marketing & Presença Digital
- **Link-in-Bio (UPStartin Bio)**: Página pública personalizada para centralizar links e converter visitantes em leads (Bio Settings).
- **Lead Capture**: Integração direta entre a página de bio e o CRM.

---

### 4. Arquitetura de Informação (Rotas)

| Rota | Descrição | Status de Acesso |
| :--- | :--- | :--- |
| `/` | Dashboard Principal | 🔐 Protegido |
| `/tarefas` | Quadro Kanban de Produção | 🔐 Protegido |
| `/financeiro` | Gestão de Fluxo de Caixa | 🔐 Protegido |
| `/clientes` | Lista e Detalhes de Clientes | 🔐 Protegido |
| `/contratos` | Gestão de Documentos | 🔐 Protegido |
| `/estoque` | Controle de Inventário | 🔐 Protegido |
| `/vendas` | Histórico de Vendas | 🔐 Protegido |
| `/agenda` | Calendário de Eventos | 🔐 Protegido |
| `/config-bio` | Editor da Landing Page de Bio | 🔐 Protegido |
| `/bio/:username`| Landing Page Pública | 🌐 Público |
| `/portal/:token`| Portal de Acesso do Cliente | 🌐 Público (via Token) |

---

### 5. Stack Tecnológica
- **Frontend**: React 19 (Hooks, Context API)
- **Tooling**: Vite (HMR ultra-rápido)
- **Linguagem**: TypeScript
- **Estilização**: CSS Puro + Tailwind Utility Classes (Via `tailwind-merge`)
- **Animações**: Framer Motion (Transições fluidas e Splash Screens)
- **Backend/Auth**: Supabase (PostgreSQL + GoTrue)
- **Visualização**: Recharts (Gráficos analíticos)
- **Ícones**: Lucide React

---

### 6. Próximos Passos (Roadmap)
- [ ] Implementação de notificações Push para prazos de contratos.
- [ ] Exportação de relatórios financeiros em PDF/Excel.
- [ ] Integração nativa com APIs de Redes Sociais (Instagram/YouTube Insights).
- [ ] Modo Offline com sincronização tardia via Service Workers.

---

### 7. Como Executar o Projeto
1. Clone o repositório.
2. Instale as dependências: `npm install`.
3. Configure o `.env.local` com suas credenciais do **Supabase**.
4. Inicie o servidor de desenvolvimento: `npm run dev`.

---

**Criado com ❤️ para a comunidade desafiadora.**
