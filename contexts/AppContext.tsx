import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AppContextType, AppState, VideoIdea, Task, Transaction, TaskStatus, Customer, Contract } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [state, setState] = useState<AppState>({
    ideas: [],
    tasks: [],
    transactions: [],
    customers: [],
    contracts: []
  });
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    if (!user) {
      setState({ ideas: [], tasks: [], transactions: [], customers: [], contracts: [] });
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);

      const [ideasRes, tasksRes, transactionsRes, customersRes, contractsRes] = await Promise.all([
        supabase.from('video_ideas').select('*').order('criado_em', { ascending: false }),
        supabase.from('tasks').select('*').order('criada_em', { ascending: false }),
        supabase.from('transactions').select('*').order('data', { ascending: false }),
        supabase.from('customers').select('*').order('criado_em', { ascending: false }),
        supabase.from('contracts').select('*').order('created_at', { ascending: false })
      ]);

      setState({
        ideas: (ideasRes.data || []).map(i => ({
          ...i,
          criadoEm: new Date(i.criado_em).getTime(),
          atualizadoEm: new Date(i.atualizado_em).getTime()
        })),
        tasks: (tasksRes.data || []).map(t => ({
          ...t,
          criadaEm: new Date(t.criada_em).getTime(),
          concluidaEm: t.concluida_em ? new Date(t.concluida_em).getTime() : null
        })),
        transactions: (transactionsRes.data || []).map(tx => ({
          ...tx,
          dataVencimento: tx.data_vencimento,
          statusPagamento: tx.status_pagamento,
          criadaEm: new Date(tx.criada_em).getTime()
        })).sort((a, b) => {
          const dateA = a.data.includes('T') ? a.data : `${a.data}T12:00:00`;
          const dateB = b.data.includes('T') ? b.data : `${b.data}T12:00:00`;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        }),
        customers: (customersRes.data || []).map(c => ({
          ...c,
          criadoEm: new Date(c.criado_em).getTime()
        })),
        contracts: (contractsRes.data || []).map(c => ({
          ...c,
          created_at: new Date(c.created_at).getTime()
        }))
      });
      setLoading(false);
    };

    fetchData();

    // Set up real-time subscriptions
    const channels = [
      supabase.channel('video_ideas_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'video_ideas', filter: `user_id=eq.${user.id}` }, fetchData),
      supabase.channel('tasks_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${user.id}` }, fetchData),
      supabase.channel('transactions_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` }, fetchData),
      supabase.channel('customers_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'customers', filter: `user_id=eq.${user.id}` }, fetchData),
      supabase.channel('contracts_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'contracts', filter: `user_id=eq.${user.id}` }, fetchData)
    ];

    channels.forEach(channel => channel.subscribe());

    return () => {
      channels.forEach(channel => channel.unsubscribe());
    };
  }, [user]);

  // --- Ideas ---
  const addIdea = async (idea: Omit<VideoIdea, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('video_ideas').insert([{
      user_id: user.id,
      customer_id: idea.customer_id || null,
      titulo: idea.titulo,
      descricao: idea.descricao,
      categoria: idea.categoria,
      prioridade: idea.prioridade,
      status: idea.status,
      notas: idea.notas
    }]).select();

    if (data && !error) {
      const newIdea = {
        ...data[0],
        criadoEm: new Date(data[0].criado_em).getTime(),
        atualizadoEm: new Date(data[0].atualizado_em).getTime()
      };
      setState(prev => ({ ...prev, ideas: [newIdea, ...prev.ideas] }));
    }
  };

  const updateIdea = async (id: string, updates: Partial<VideoIdea>) => {
    if (!user) return;
    const fields: any = {
      titulo: updates.titulo,
      descricao: updates.descricao,
      categoria: updates.categoria,
      prioridade: updates.prioridade,
      status: updates.status,
      notas: updates.notas,
      atualizado_em: new Date().toISOString()
    };
    if (updates.customer_id !== undefined) fields.customer_id = updates.customer_id || null;

    const { data, error } = await supabase.from('video_ideas').update(fields).eq('id', id).select();

    if (data && !error) {
      setState(prev => ({
        ...prev,
        ideas: prev.ideas.map(i => i.id === id ? {
          ...i,
          ...updates,
          atualizadoEm: new Date(data[0].atualizado_em).getTime()
        } : i)
      }));
    }
  };

  const deleteIdea = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('video_ideas').delete().eq('id', id);
    if (!error) {
      setState(prev => ({ ...prev, ideas: prev.ideas.filter(i => i.id !== id) }));
    }
  };

  const toggleIdeaShare = async (id: string): Promise<string | null> => {
    if (!user) return null;

    const idea = state.ideas.find(i => i.id === id);
    if (!idea) return null;

    // If already shared, disable sharing
    if (idea.share_enabled) {
      const { error } = await supabase.from('video_ideas').update({
        share_enabled: false
      }).eq('id', id);

      if (!error) {
        setState(prev => ({
          ...prev,
          ideas: prev.ideas.map(i => i.id === id ? { ...i, share_enabled: false } : i)
        }));
      }
      return null;
    }

    // Generate new share token if needed
    const shareToken = idea.share_token || `${id.substring(0, 8)}-${Date.now().toString(36)}`;

    const { error } = await supabase.from('video_ideas').update({
      share_token: shareToken,
      share_enabled: true
    }).eq('id', id);

    if (!error) {
      setState(prev => ({
        ...prev,
        ideas: prev.ideas.map(i => i.id === id ? {
          ...i,
          share_token: shareToken,
          share_enabled: true
        } : i)
      }));

      return `${window.location.origin}/#/share/${shareToken}`;
    }

    return null;
  };

  // --- Tasks ---
  const addTask = async (task: Omit<Task, 'id' | 'criadaEm' | 'concluidaEm'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('tasks').insert([{
      user_id: user.id,
      customer_id: task.customer_id || null,
      idea_id: task.idea_id || null, // Link to Idea
      titulo: task.titulo,
      descricao: task.descricao,
      coluna: task.coluna,
      tags: task.tags,
      prazo: task.prazo || null,
      concluida_em: task.coluna === 'done' ? new Date().toISOString() : null
    }]).select();

    if (data && !error) {
      const newTask = {
        ...data[0],
        criadaEm: new Date(data[0].criada_em).getTime(),
        concluidaEm: data[0].concluida_em ? new Date(data[0].concluida_em).getTime() : null
      };
      setState(prev => ({ ...prev, tasks: [newTask, ...prev.tasks] }));
    }
  };

  const moveTask = async (id: string, newStatus: TaskStatus) => {
    if (!user) return;
    const { data, error } = await supabase.from('tasks').update({
      coluna: newStatus,
      concluida_em: newStatus === 'done' ? new Date().toISOString() : null
    }).eq('id', id).select();

    if (data && !error) {
      const task = state.tasks.find(t => t.id === id);
      const ideaId = task?.idea_id;

      if (ideaId) {
        let newIdeaStatus: any = 'pendente';
        if (newStatus === 'inprogress') newIdeaStatus = 'processando';
        if (newStatus === 'done') newIdeaStatus = 'concluido';

        await supabase.from('video_ideas').update({ status: newIdeaStatus }).eq('id', ideaId);

        setState(prev => ({
          ...prev,
          ideas: prev.ideas.map(i => i.id === ideaId ? { ...i, status: newIdeaStatus } : i),
          tasks: prev.tasks.map(t => t.id === id ? {
            ...t,
            coluna: newStatus,
            concluidaEm: data[0].concluida_em ? new Date(data[0].concluida_em).getTime() : null
          } : t)
        }));
      } else {
        setState(prev => ({
          ...prev,
          tasks: prev.tasks.map(t => t.id === id ? {
            ...t,
            coluna: newStatus,
            concluidaEm: data[0].concluida_em ? new Date(data[0].concluida_em).getTime() : null
          } : t)
        }));
      }
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (!error) {
      setState(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
    }
  };

  const convertIdeaToTask = async (id: string) => {
    if (!user) return;
    const idea = state.ideas.find(i => i.id === id);
    if (!idea) return;

    // 1. Create the task
    const { data: taskData, error: taskError } = await supabase.from('tasks').insert([{
      user_id: user.id,
      customer_id: idea.customer_id || null,
      idea_id: idea.id, // Linking task to idea
      titulo: idea.titulo,
      descricao: idea.descricao,
      coluna: 'todo',
      tags: [idea.categoria],
    }]).select();

    if (taskError) return;

    // 2. Update the idea status to 'pendente' (since it matches 'todo')
    const { data: ideaData, error: ideaError } = await supabase.from('video_ideas').update({
      status: 'pendente',
      task_id: taskData[0].id, // Linking idea to task
      atualizado_em: new Date().toISOString()
    }).eq('id', id).select();

    if (!ideaError && taskData && ideaData) {
      const newTask = {
        ...taskData[0],
        criadaEm: new Date(taskData[0].criada_em).getTime(),
        concluidaEm: null
      };

      setState(prev => ({
        ...prev,
        tasks: [newTask, ...prev.tasks],
        ideas: prev.ideas.map(i => i.id === id ? {
          ...i,
          status: 'pendente',
          task_id: taskData[0].id,
          atualizadoEm: Date.now()
        } : i)
      }));
    }
  };

  // --- Transactions ---
  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'criadaEm'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('transactions').insert([{
      user_id: user.id,
      customer_id: transaction.customer_id || null,
      tipo: transaction.tipo,
      valor: transaction.valor,
      categoria: transaction.categoria,
      descricao: transaction.descricao,
      data: transaction.data,
      data_vencimento: transaction.dataVencimento || null,
      status_pagamento: transaction.statusPagamento || 'pago'
    }]).select();

    if (data && !error) {
      const newTx = {
        ...data[0],
        dataVencimento: data[0].data_vencimento,
        statusPagamento: data[0].status_pagamento,
        criadaEm: new Date(data[0].criada_em).getTime()
      };
      setState(prev => ({
        ...prev,
        transactions: [newTx, ...prev.transactions].sort((a, b) => {
          const dateA = a.data.includes('T') ? a.data : `${a.data}T12:00:00`;
          const dateB = b.data.includes('T') ? b.data : `${b.data}T12:00:00`;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        })
      }));
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (!user) return;
    const fields: any = {
      tipo: updates.tipo,
      valor: updates.valor,
      categoria: updates.categoria,
      descricao: updates.descricao,
      data: updates.data,
      status_pagamento: updates.statusPagamento
    };
    if (updates.customer_id !== undefined) fields.customer_id = updates.customer_id || null;
    if (updates.dataVencimento !== undefined) fields.data_vencimento = updates.dataVencimento || null;

    const { data, error } = await supabase.from('transactions').update(fields).eq('id', id).select();

    if (data && !error) {
      setState(prev => ({
        ...prev,
        transactions: prev.transactions.map(t => t.id === id ? {
          ...t,
          ...updates,
          dataVencimento: data[0].data_vencimento,
          statusPagamento: data[0].status_pagamento
        } : t).sort((a, b) => {
          const dateA = a.data.includes('T') ? a.data : `${a.data}T12:00:00`;
          const dateB = b.data.includes('T') ? b.data : `${b.data}T12:00:00`;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        })
      }));
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (!error) {
      setState(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
    }
  };

  // --- Customers ---
  const addCustomer = async (customer: Omit<Customer, 'id' | 'criadoEm'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('customers').insert([{
      user_id: user.id,
      nome: customer.nome,
      email: customer.email,
      telefone: customer.telefone,
      status: customer.status
    }]).select();

    if (data && !error) {
      const newCustomer = {
        ...data[0],
        criadoEm: new Date(data[0].criado_em).getTime()
      };
      setState(prev => ({ ...prev, customers: [newCustomer, ...prev.customers] }));
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    if (!user) return;
    const { data, error } = await supabase.from('customers').update({
      nome: updates.nome,
      email: updates.email,
      telefone: updates.telefone,
      status: updates.status,
      updated_at: new Date().toISOString()
    }).eq('id', id).select();

    if (data && !error) {
      setState(prev => ({
        ...prev,
        customers: prev.customers.map(c => c.id === id ? { ...c, ...updates } : c)
      }));
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (!error) {
      setState(prev => ({ ...prev, customers: prev.customers.filter(c => c.id !== id) }));
    }
  };

  // --- Contracts ---
  const addContract = async (contract: Omit<Contract, 'id' | 'created_at'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('contracts').insert([{
      user_id: user.id,
      customer_id: contract.customer_id,
      title: contract.title,
      pdf_url: contract.pdf_url
    }]).select();

    if (data && !error) {
      const newContract = {
        ...data[0],
        created_at: new Date(data[0].created_at).getTime()
      };
      setState(prev => ({ ...prev, contracts: [newContract, ...prev.contracts] }));
    }
  };

  const deleteContract = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('contracts').delete().eq('id', id);
    if (!error) {
      setState(prev => ({ ...prev, contracts: prev.contracts.filter(c => c.id !== id) }));
    }
  };

  return (
    <AppContext.Provider value={{
      ...state,
      addIdea, updateIdea, deleteIdea,
      addTask, moveTask, deleteTask,
      addTransaction, updateTransaction, deleteTransaction,
      convertIdeaToTask,
      toggleIdeaShare,
      addCustomer, updateCustomer, deleteCustomer,
      addContract, deleteContract
    }}>
      {!loading && children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
