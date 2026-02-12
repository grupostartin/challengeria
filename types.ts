export type Priority = 'alta' | 'media' | 'baixa';

export type TaskStatus = 'todo' | 'inprogress' | 'done';
export type TransactionType = 'receita' | 'despesa';
export type AppMode = 'user' | 'store';
export type OrganizerType = 'conta_mensal' | 'assinatura' | 'recebimento' | 'outro';

export interface InventoryItem {
  id: string;
  user_id: string;
  nome: string;
  descricao: string;
  quantidade: number;
  preco: number;
  categoria: string;
  criadoEm: number;
}

export interface Customer {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  status: 'ativo' | 'inativo' | 'atraso';
  portal_token?: string; // Unique token for client portal
  criadoEm: number;
}



export interface Task {
  id: string;
  customer_id?: string;

  titulo: string;
  descricao: string;
  coluna: TaskStatus;
  tags: string[];
  prazo: string | null; // ISO Date string
  criadaEm: number;
  concluidaEm: number | null;
}

export interface Transaction {
  id: string;
  customer_id?: string;
  tipo: TransactionType;
  valor: number;
  categoria: string;
  descricao: string;
  data: string; // ISO Date string
  dataVencimento?: string; // ISO Date string
  statusPagamento: 'pendente' | 'pago' | 'atrasado' | 'parcial';
  criadaEm: number;
  attachment_url?: string;
  valor_pago?: number;
  contract_id?: string;
  recurrence_id?: string;
}

export interface Contract {
  id: string;
  customer_id: string;
  title: string;
  pdf_url: string;
  payment_proof_url?: string;
  created_at: number;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantidade: number;
  preco_unitario: number;
  nome_produto: string;
}

export interface Sale {
  id: string;
  user_id: string;
  customer_id: string;
  total: number;
  status: 'concluido' | 'pendente' | 'cancelado';
  metodo_pagamento: 'pix' | 'cartao' | 'dinheiro';
  criadoEm: number;
  items?: SaleItem[];
}

export interface Appointment {
  id: string;
  user_id: string;
  customer_id?: string;
  titulo: string;
  descricao: string;
  data: string; // ISO Date (YYYY-MM-DD)
  horario: string; // HH:mm
  tipo: 'servico' | 'compromisso' | 'outro';
  status: 'pendente' | 'concluido' | 'cancelado';
  criadoEm: number;
}

export interface FinancialOrganizer {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  category: string;
  type: OrganizerType;
  due_day: number;
  active: boolean;
  total_installments?: number;
  current_installment?: number;
  frequency?: 'monthly' | 'weekly';
  created_at: number;
}

export interface BioLink {
  label: string;
  url: string;
  image_url?: string;
}

export interface BioConfig {
  id: string;
  user_id: string;
  username: string;
  title: string;
  description: string;
  avatar_url: string;
  background_color: string;
  button_color: string;
  button_text_color: string;
  background_image_url?: string;
  links: BioLink[];
  show_lead_form: boolean;
  lead_form_title: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  subscription_status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
  plan_type: 'trial' | 'premium';
  current_period_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  trial_ends_at: string | null;
}

export interface AppState {

  tasks: Task[];
  transactions: Transaction[];
  customers: Customer[];
  contracts: Contract[];
  inventory: InventoryItem[];
  sales: Sale[];
  appointments: Appointment[];
  financialOrganizers: FinancialOrganizer[];
  bioConfig: BioConfig | null;
  appMode: AppMode;
}

export interface AppContextType extends AppState {
  addTask: (task: Omit<Task, 'id' | 'criadaEm' | 'concluidaEm'>) => void;
  moveTask: (id: string, newStatus: TaskStatus) => void;
  deleteTask: (id: string) => void;

  addTransaction: (transaction: Omit<Transaction, 'id' | 'criadaEm'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => void;



  addCustomer: (customer: Omit<Customer, 'id' | 'criadoEm'>) => Promise<void>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  togglePortalShare: (id: string) => Promise<string | null>; // Returns portal URL or null

  addContract: (contract: Omit<Contract, 'id' | 'created_at'>) => Promise<void>;
  updateContract: (id: string, updates: Partial<Contract>) => Promise<void>;
  deleteContract: (id: string) => Promise<void>;

  // --- Inventory ---
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'user_id' | 'criadoEm'>) => Promise<void>;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;

  // --- Sales ---
  addSale: (sale: Omit<Sale, 'id' | 'user_id' | 'criadoEm'>, items: Omit<SaleItem, 'id' | 'sale_id'>[]) => Promise<void>;
  updateSaleStatus: (id: string, status: Sale['status']) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;

  // --- Agenda ---
  addAppointment: (appointment: Omit<Appointment, 'id' | 'user_id' | 'criadoEm'>) => Promise<void>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;

  // --- Bio & Leads ---
  updateBioConfig: (updates: Partial<BioConfig>) => Promise<void>;
  submitLead: (username: string, lead: { nome: string; email: string; telefone: string; mensagem?: string }) => Promise<void>;

  // --- Financial Organizers ---
  addFinancialOrganizer: (organizer: Omit<FinancialOrganizer, 'id' | 'created_at'>) => Promise<void>;
  updateFinancialOrganizer: (id: string, updates: Partial<FinancialOrganizer>) => Promise<void>;
  deleteFinancialOrganizer: (id: string) => Promise<void>;

  setAppMode: (mode: AppMode) => void;
}


