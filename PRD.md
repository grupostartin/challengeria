# 📄 Product Requirements Document (PRD) - UPStartin

## 1. Introdução e Visão Geral
O **UPStartin** é uma plataforma SaaS (Software as a Service) desenvolvida para resolver a fragmentação de ferramentas no dia a dia de criadores de conteúdo e agências digitais. Atualmente, esses profissionais utilizam múltiplas ferramentas desconexas (Trello para tarefas, Linktree para links, planilhas para financeiro e CRM externo). O UPStartin consolida todas essas necessidades em um ecossistema único, fluido e profissional.

---

## 2. Público-Alvo
- **Criadores de Conteúdo (Solo)**: YouTubers, Influencers e Blogueiros.
- **Agências de Marketing/Conteúdo**: Gestores que precisam controlar múltiplos projetos e clientes.
- **Profissionais Liberais**: Consultores e freelancers que dependem de agendamentos e contratos.

---

## 3. Objetivos do Produto
- **Eficiência Operacional**: Reduzir o tempo gasto alternando entre abas e ferramentas.
- **Transparência com o Cliente**: Oferecer um portal onde o cliente final pode ver o valor do trabalho sendo entregue.
- **Saúde Financeira**: Facilitar o controle de fluxo de caixa e gestão de pagamentos recorrentes.
- **Conversão de Leads**: Transformar o tráfego orgânico de redes sociais em base de clientes real através da página de Bio.

---

## 4. Mapa Completo de Funcionalidades (Páginas e Módulos)

### 4.1. Dashboard (Visão do Negócio) `Dashboard.tsx`
- Resumo mensal de receitas vs. despesas.
- Próximos compromissos da agenda.
- Tarefas urgentes (prazos curtos) no Kanban.
- Alertas de faturas atrasadas ou vencendo hoje.
- Atalhos rápidos para as principais funções.

### 4.2. Gestão de Projetos (Kanban) `Kanban.tsx`
- Colunas dinâmicas: `Fazer`, `Em Progresso`, `Concluído`.
- Atribuição de tarefas a clientes específicos (`customer_id`).
- Definição de prazos, tags personalizadas e prioridade.
- Feedback visual de status e progresso.

### 4.3. CRM & Relacionamento `Customers.tsx`
- Cadastro completo de clientes (Nome, Email, Telefone, Status).
- **Portal do Cliente**: Geração de tokens de acesso único (`ClientPortal.tsx`).
- Histórico de interações e transações por cliente.
- Filtro por status (Ativo, Inativo, Atraso).

### 4.4. Centro Financeiro `Finance.tsx`
- **Lançamentos**: Registro de Receitas e Despesas com categorias.
- **Organizadores Financeiros**: Gestão de pagamentos recorrentes (Contas fixas/variáveis).
- **Anexos**: Suporte a comprovantes (PDF/Imagens).
- **Filtros e Relatórios**: Visualização por período, categoria e cliente.
- **Vencimentos**: Gestão de datas de vencimento e status de pagamento (Pendente, Pago, Atrasado).

### 4.5. Gestão de Contratos `Contracts.tsx`
- Upload de contratos em PDF vinculados a clientes.
- Visualização rápida e rastreamento de status.
- Integração com o fluxo financeiro para comprovação de serviços.

### 4.6. Vendas & Estoque `Inventory.tsx` & `Sales.tsx`
- **Estoque**: Cadastro de produtos/serviços com controle de quantidade.
- **Vendas**: Registro de transações com múltiplos itens, métodos de pagamento (Pix, Cartão, Dinheiro) e baixa automática de estoque.
- **Relatórios**: Histórico detalhado de vendas e status.

### 4.7. Agenda e Compromissos `Agenda.tsx`
- Calendário interativo para agendamentos de serviços e reuniões.
- Sincronização com clientes do CRM.
- Status de compromissos (Pendente, Concluído, Cancelado).

### 4.8. UPStartin Bio (Canto de Marketing) `PublicBio.tsx` & `BioSettings.tsx`
- **Página de Links**: Estilo "Linktree" personalizável (avatar, cores, links, imagens).
- **Lead Capture**: Formulário público que cria automaticamente um prospecto no CRM.
- **Gestão Visual**: Editor em tempo real para cores de fundo, botões e tipografia.

### 4.9. Ferramentas de Produtividade
- **Notas (`Notes.tsx`)**: Sistema de anotações rápidas para o usuário (privado).
- **Anexo Rápido (`QuickAttachment.tsx`)**: Fluxo otimizado para upload de arquivos em lote.
- **Ajuda (`Help.tsx`)**: Documentação, tutoriais e botão "Limpar Cache/Dados".

---

## 5. UI/UX & Componentes (Design System)

### 5.1. Layout e Navegação `Layout.tsx`
- Barra lateral (Desktop) e Menus Flutuantes/Inferiores (Mobile).
- **Bottom Menu / Floating Menu**: Otimizado para uso com uma mão em dispositivos móveis.
- Barra de estado superior com nome do app e modo de visualização.

### 5.2. Componentes UI Reutilizáveis `components/ui/`
- **Modais (`Modal.tsx`)**: Diálogos consistentes para criações e edições.
- **Tabelas e Cards**: Otimizados para legibilidade.
- **Framer Motion**: Animações de entrada e transições de página para sensação premium.
- **Design Token**: Paleta de cores escura (Slate/Zinc) com destaques em azul/violeta.

---

## 6. Arquitetura Técnica e Modelo de Dados

### 6.1. Stack Tecnológica
- **Framework**: React 19 com Vite (HMR ultra-rápido).
- **Linguagem**: TypeScript para segurança de tipos.
- **Estilização**: Tailwind CSS (via `index.css`).
- **Estado Global**: React Context API (`AuthContext`, `AppDataContext`).
- **Roteamento**: React Router v6.

### 6.2. Modelo de Dados `types.ts`
- **Perfil (`UserProfile`)**: Gestão de planos e status de assinatura.
- **Entidades**: `Task`, `Transaction`, `Customer`, `Contract`, `InventoryItem`, `Sale`, `Appointment`, `BioConfig`, `UserNote`.
- **Enums**: Prioridades, Status de Tarefas, Tipos de Transação e Modos de App.

### 6.3. Backend & Integração
- **Supabase**:
    - **Auth**: Gestão de usuários e sessões.
    - **PostgreSQL**: Banco de dados relacional.
    - **Storage**: Armazenamento de PDFs, comprovantes e fotos de perfil.
    - **Edge Functions**: Lógica de checkout (`checkout`) e processamento de webhooks (`webhook`).

---

## 7. Infraestrutura e DevOps

- **Hospedagem**: Vercel (Front-end e API Proxy).
- **PWA (Progressive Web App)**:
    - `manifest.json` e `sw.js` para instalação no celular e funcionamento offline básico.
    - Ícones adaptáveis (512px).
- **Pagamentos**: Integração com Stripe via Supabase Edge Functions para gestão de planos (Trial vs Premium).
- **Segurança**: Políticas de RLS (Row Level Security) no Supabase para garantir que usuários vejam apenas seus próprios dados.

---

## 8. Fluxos de Usuário (User Flows)

1. **Onboarding**: Cadastro -> Login -> Teste Gratuito (Trial) de 7 dias -> Configuração da Bio.
2. **Ciclo de Venda**: Lead chega via Link-in-Bio -> CRM -> Projeto Kanban -> Contrato/Anexo -> Pagamento no Financeiro.
3. **Gestão de Assinatura**: Verificação de status de plano -> Link para Stripe Portal -> Atualização automática via Webhook.

---

## 9. Roadmap e Futuro (Próximos Passos)
- **Dashboard Avançado**: Gráficos de barra e linha para tendências financeiras.
- **Integração de APIs**: Conexão com Google Calendar e Instagram Insights.
- **Automação**: Disparo de mensagens WhatsApp no vencimento de faturas.
- **IA Generativa**: Criador de roteiros integrado ao Kanban.

---
**Status atual do PRD: v1.1 (Mapeamento Completo de Ecossistema)**
