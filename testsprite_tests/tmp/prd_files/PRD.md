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

## 4. Requisitos Funcionais (Módulos)

### 4.1. Dashboard (Visão do Negócio)
- Resumo mensal de receitas vs. despesas.
- Próximos compromissos da agenda.
- Tarefas urgentes (prazos curtos) no Kanban.
- Alertas de faturas atrasadas ou vencendo hoje.

### 4.2. Gestão de Projetos (Kanban)
- Colunas dinâmicas: `Ideia`, `Roteiro`, `Gravação`, `Edição`, `Postado`.
- Atribuição de tarefas a clientes específicos.
- Definição de prazos e tags personalizadas.

### 4.3. CRM & Relacionamento
- Cadastro completo de clientes (Nome, Email, Telefone).
- Geração de tokens de acesso único para o **Portal do Cliente**.
- Histórico de interações e transações por cliente.

### 4.4. Centro Financeiro
- Categorização de lançamentos (Receita/Despesa).
- **Organizadores Financeiros**: Gestão de custos fixos (Contas de Luz, Internet) e variáveis.
- Suporte a anexos (PDF/Imagens) para cada transação.
- Filtros por período, cliente e categoria.

### 4.5. Gestão de Contratos
- Upload e visualização de contratos em PDF.
- Rastreamento de status de assinatura e vinculação a pagamentos.

### 4.6. Vendas & Estoque
- Registro de vendas simples ou com múltiplos itens.
- Controle de quantidade em estoque com baixa automática após venda.
- Relatório de produtos mais vendidos.

### 4.7. UPStartin Bio (Marketing)
- Editor Visual: Troca de avatar, cores de fundo e estilos de botões.
- Gerenciamento de links com ícones personalizáveis.
- **Lead Capture**: Formulário público que cria automaticamente um cliente prospecto no CRM.

---

## 5. Requisitos Não Funcionais
- **Segurança**: Autenticação via Supabase Auth (GoTrue).
- **Responsividade**: Interface adaptável para Mobile, Tablet e Desktop.
- **Performance**: Tempo de carregamento inferior a 2 segundos para o Dashboard.
- **Disponibilidade**: Arquitetura baseada em cloud (Vercel + Supabase) para 99.9% uptime.

---

## 6. Arquitetura Técnica
- **Framework**: React 19 com Vite.
- **Linguagem**: TypeScript (Strict Mode).
- **Banco de Dados**: PostgreSQL (Gerenciado por Supabase).
- **Storage**: Supabase Storage para contratos, anexos e fotos de perfil.
- **Injeção de Estado**: Context API para estados globais (Auth e AppData).
- **Animações**: Framer Motion para feedback visual e transições de página.

---

## 7. Fluxos de Usuário (User Flows)
1. **Onboarding**: Usuário se cadastra -> Landing Page explicativa -> Configura seu perfil de Bio -> Começa a cadastrar clientes.
2. **Ciclo de Venda**: Lead chega via Link-in-Bio -> Convertido em Cliente no CRM -> Projeto criado no Kanban -> Contrato enviado -> Pagamento registrado no Financeiro.
3. **Pós-Venda**: Cliente recebe link do Portal -> Acompanha as etapas no Kanban -> Verifica históricos e notas fiscais anexadas.

---

## 8. Roadmap e Futuro
- **Integração de APIs**: Conexão com Instagram API para buscar métricas automáticas.
- **Automação**: Envio de lembretes de pagamento via WhatsApp WebHook.
- **IA**: Assistente para gerar roteiros de conteúdo baseados no nicho do usuário.

---
**Status atual do PRD: v1.0 (Lançamento Core)**
