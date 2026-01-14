export type Priority = 'alta' | 'media' | 'baixa';
export type IdeaStatus = 'pendente' | 'processando' | 'concluido' | 'arquivado';
export type TaskStatus = 'todo' | 'inprogress' | 'done';
export type TransactionType = 'receita' | 'despesa';
export type AppMode = 'user' | 'store';

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
  criadoEm: number;
}

export interface VideoIdea {
  id: string;
  customer_id?: string;
  task_id?: string; // Link to Kanban Task
  titulo: string;
  descricao: string;
  categoria: string;
  prioridade: Priority;
  status: IdeaStatus;
  notas: string;
  share_token?: string; // Token for public sharing
  share_enabled?: boolean; // Whether sharing is enabled
  criadoEm: number; // Timestamp
  atualizadoEm: number; // Timestamp
}

export interface Task {
  id: string;
  customer_id?: string;
  idea_id?: string; // Link to Video Idea
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
  statusPagamento: 'pendente' | 'pago' | 'atrasado';
  criadaEm: number;
}

export interface Contract {
  id: string;
  customer_id: string;
  title: string;
  pdf_url: string;
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

export interface AppState {
  ideas: VideoIdea[];
  tasks: Task[];
  transactions: Transaction[];
  customers: Customer[];
  contracts: Contract[];
  inventory: InventoryItem[];
  sales: Sale[];
  appMode: AppMode;
}

export interface AppContextType extends AppState {
  addIdea: (idea: Omit<VideoIdea, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  updateIdea: (id: string, idea: Partial<VideoIdea>) => void;
  deleteIdea: (id: string) => void;

  addTask: (task: Omit<Task, 'id' | 'criadaEm' | 'concluidaEm'>) => void;
  moveTask: (id: string, newStatus: TaskStatus) => void;
  deleteTask: (id: string) => void;

  addTransaction: (transaction: Omit<Transaction, 'id' | 'criadaEm'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => void;

  convertIdeaToTask: (id: string) => Promise<void>;
  toggleIdeaShare: (id: string) => Promise<string | null>; // Returns share URL or null

  addCustomer: (customer: Omit<Customer, 'id' | 'criadoEm'>) => Promise<void>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;

  addContract: (contract: Omit<Contract, 'id' | 'created_at'>) => Promise<void>;
  deleteContract: (id: string) => Promise<void>;

  // --- Inventory ---
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'user_id' | 'criadoEm'>) => Promise<void>;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;

  // --- Sales ---
  addSale: (sale: Omit<Sale, 'id' | 'user_id' | 'criadoEm'>, items: Omit<SaleItem, 'id' | 'sale_id'>[]) => Promise<void>;
  updateSaleStatus: (id: string, status: Sale['status']) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;

  setAppMode: (mode: AppMode) => void;
}

