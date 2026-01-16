import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AppContextType, AppState, VideoIdea, Task, Transaction, TaskStatus, Customer, Contract, InventoryItem, AppMode, Sale, SaleItem, Appointment, BioConfig } from '../types';
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
    contracts: [],
    inventory: [],
    sales: [],
    appointments: [],
    bioConfig: null,
    appMode: (localStorage.getItem('appMode') as AppMode) || 'user'
  });
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  const fetchData = async () => {
    if (!user) {
      setState(prev => ({ ...prev, ideas: [], tasks: [], transactions: [], customers: [], contracts: [], inventory: [], sales: [] }));
      setState(prev => ({ ...prev, ideas: [], tasks: [], transactions: [], customers: [], contracts: [], inventory: [], sales: [], appointments: [] }));
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const results = await Promise.all([
        supabase.from('video_ideas').select('*').order('criado_em', { ascending: false }),
        supabase.from('tasks').select('*').order('criada_em', { ascending: false }),
        supabase.from('transactions').select('*').order('data', { ascending: false }),
        supabase.from('customers').select('*').order('criado_em', { ascending: false }),
        supabase.from('contracts').select('*').order('created_at', { ascending: false }),
        supabase.from('inventory').select('*').order('criado_em', { ascending: false }),
        supabase.from('sales').select('*, sale_items(*)').order('criado_em', { ascending: false }),
        supabase.from('appointments').select('*').order('data', { ascending: true }).order('horario', { ascending: true }),
        supabase.from('bio_configs').select('*').single()
      ]);

      const [ideasRes, tasksRes, transactionsRes, customersRes, contractsRes, inventoryRes, salesRes, appointmentsRes, bioRes] = results;

      setState(prev => ({
        ...prev,
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
          contract_id: tx.contract_id,
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
        })),
        inventory: (inventoryRes.data || []).map(i => ({
          ...i,
          criadoEm: new Date(i.criado_em).getTime()
        })),
        sales: (salesRes.data || []).map(s => ({
          ...s,
          criadoEm: new Date(s.criado_em).getTime(),
          items: s.sale_items
        })),
        appointments: (appointmentsRes.data || []).map(a => ({
          ...a,
          criadoEm: new Date(a.criado_em).getTime()
        })),
        bioConfig: bioRes.data || null
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (!user) return;

    // Set up real-time subscriptions
    const channels = [
      supabase.channel('video_ideas_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'video_ideas', filter: `user_id=eq.${user.id}` }, fetchData),
      supabase.channel('tasks_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${user.id}` }, fetchData),
      supabase.channel('transactions_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` }, fetchData),
      supabase.channel('customers_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'customers', filter: `user_id=eq.${user.id}` }, fetchData),
      supabase.channel('contracts_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'contracts', filter: `user_id=eq.${user.id}` }, fetchData),
      supabase.channel('inventory_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'inventory', filter: `user_id=eq.${user.id}` }, fetchData),
      supabase.channel('sales_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'sales', filter: `user_id=eq.${user.id}` }, fetchData),
      supabase.channel('appointments_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `user_id=eq.${user.id}` }, fetchData),
      supabase.channel('bio_configs_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'bio_configs', filter: `user_id=eq.${user.id}` }, fetchData)
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
      status_pagamento: transaction.statusPagamento || 'pago',
      attachment_url: transaction.attachment_url || null,
      valor_pago: transaction.valor_pago || 0,
      contract_id: transaction.contract_id || null
    }]).select();

    if (data && !error) {
      // SYNC: Pull proof from contract if not provided
      let finalAttachmentUrl = transaction.attachment_url;
      if (!finalAttachmentUrl && transaction.contract_id) {
        const linkedContract = state.contracts.find(c => c.id === transaction.contract_id);
        if (linkedContract?.payment_proof_url) {
          finalAttachmentUrl = linkedContract.payment_proof_url;
          // Update the transaction in database with the pulled proof
          await supabase.from('transactions').update({ attachment_url: finalAttachmentUrl }).eq('id', data[0].id);
        }
      }

      const newTx = {
        ...data[0],
        attachment_url: finalAttachmentUrl || data[0].attachment_url,
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

      // SYNC: Push proof to contract if provided and contract has none
      if (transaction.contract_id && transaction.attachment_url) {
        await supabase.from('contracts').update({ payment_proof_url: transaction.attachment_url }).eq('id', transaction.contract_id);
        setState(prev => ({
          ...prev,
          contracts: prev.contracts.map(c => c.id === transaction.contract_id ? { ...c, payment_proof_url: transaction.attachment_url } : c)
        }));
      }
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (!user) return;
    const fields: any = {};
    if (updates.tipo !== undefined) fields.tipo = updates.tipo;
    if (updates.valor !== undefined) fields.valor = updates.valor;
    if (updates.categoria !== undefined) fields.categoria = updates.categoria;
    if (updates.descricao !== undefined) fields.descricao = updates.descricao;
    if (updates.data !== undefined) fields.data = updates.data;
    if (updates.statusPagamento !== undefined) fields.status_pagamento = updates.statusPagamento;
    if (updates.attachment_url !== undefined) fields.attachment_url = updates.attachment_url;
    if (updates.valor_pago !== undefined) fields.valor_pago = updates.valor_pago;
    if (updates.contract_id !== undefined) fields.contract_id = updates.contract_id || null;
    if (updates.customer_id !== undefined) fields.customer_id = updates.customer_id || null;
    if (updates.dataVencimento !== undefined) fields.data_vencimento = updates.dataVencimento || null;

    const { data, error } = await supabase.from('transactions').update(fields).eq('id', id).select();

    if (data && !error) {
      // SYNC: Pull proof from contract if linking to it and no proof provided
      let finalAttachmentUrl = updates.attachment_url;
      const contractId = updates.contract_id !== undefined ? (updates.contract_id || null) : state.transactions.find(t => t.id === id)?.contract_id;

      if (!finalAttachmentUrl && contractId) {
        const linkedContract = state.contracts.find(c => c.id === contractId);
        if (linkedContract?.payment_proof_url) {
          finalAttachmentUrl = linkedContract.payment_proof_url;
          // Update DB with pulled proof
          await supabase.from('transactions').update({ attachment_url: finalAttachmentUrl }).eq('id', id);
        }
      }

      setState(prev => ({
        ...prev,
        transactions: prev.transactions.map(t => t.id === id ? {
          ...t,
          ...updates,
          attachment_url: finalAttachmentUrl || t.attachment_url,
          dataVencimento: data[0].data_vencimento,
          statusPagamento: data[0].status_pagamento
        } : t).sort((a, b) => {
          const dateA = a.data.includes('T') ? a.data : `${a.data}T12:00:00`;
          const dateB = b.data.includes('T') ? b.data : `${b.data}T12:00:00`;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        })
      }));

      // SYNC: Push proof to contract if attachment was explicitly provided/changed
      if (contractId && updates.attachment_url) {
        await supabase.from('contracts').update({ payment_proof_url: updates.attachment_url }).eq('id', contractId);
        setState(prev => ({
          ...prev,
          contracts: prev.contracts.map(c => c.id === contractId ? { ...c, payment_proof_url: updates.attachment_url } : c)
        }));
      }
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;

    // 1. Check if it's a sale transaction
    const tx = state.transactions.find(t => t.id === id);
    if (tx && tx.descricao.includes('VENDA_ID:')) {
      const saleId = tx.descricao.split('VENDA_ID:')[1];
      // Delete the sale (which will also trigger the sale deletion logic if we're not careful, 
      // but here we just want the database to stay in sync)
      await supabase.from('sales').delete().eq('id', saleId);
    }

    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (!error) {
      setState(prev => ({
        ...prev,
        transactions: prev.transactions.filter(t => t.id !== id),
        sales: tx && tx.descricao.includes('VENDA_ID:')
          ? prev.sales.filter(s => s.id !== tx.descricao.split('VENDA_ID:')[1])
          : prev.sales
      }));
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

  const togglePortalShare = async (id: string): Promise<string | null> => {
    if (!user) return null;

    const customer = state.customers.find(c => c.id === id);
    if (!customer) return null;

    // If already shared, disable sharing (null the token)
    if (customer.portal_token) {
      const { error } = await supabase.from('customers').update({
        portal_token: null
      }).eq('id', id);

      if (!error) {
        setState(prev => ({
          ...prev,
          customers: prev.customers.map(c => c.id === id ? { ...c, portal_token: undefined } : c)
        }));
      }
      return null;
    }

    // Generate new portal token
    const portalToken = `${id.substring(0, 8)}-${Math.random().toString(36).substring(2, 10)}`;

    const { error } = await supabase.from('customers').update({
      portal_token: portalToken
    }).eq('id', id);

    if (!error) {
      setState(prev => ({
        ...prev,
        customers: prev.customers.map(c => c.id === id ? { ...c, portal_token: portalToken } : c)
      }));

      return `${window.location.origin}/#/portal/${portalToken}`;
    }

    return null;
  };

  // --- Contracts ---
  const addContract = async (contract: Omit<Contract, 'id' | 'created_at'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('contracts').insert([{
      user_id: user.id,
      customer_id: contract.customer_id,
      title: contract.title,
      pdf_url: contract.pdf_url,
      payment_proof_url: contract.payment_proof_url || null
    }]).select();

    if (data && !error) {
      const newContract = {
        ...data[0],
        created_at: new Date(data[0].created_at).getTime()
      };
      setState(prev => ({ ...prev, contracts: [newContract, ...prev.contracts] }));

      // SYNC: Update linked transactions if proof exists
      if (contract.payment_proof_url) {
        await supabase.from('transactions').update({ attachment_url: contract.payment_proof_url }).eq('contract_id', data[0].id);
        setState(prev => ({
          ...prev,
          transactions: prev.transactions.map(t => t.contract_id === data[0].id ? { ...t, attachment_url: contract.payment_proof_url } : t)
        }));
      }
    }
  };

  const updateContract = async (id: string, updates: Partial<Contract>) => {
    if (!user) return;

    // Build update object only with defined fields
    const fields: any = {};
    if (updates.title !== undefined) fields.title = updates.title;
    if (updates.pdf_url !== undefined) fields.pdf_url = updates.pdf_url;
    if (updates.payment_proof_url !== undefined) fields.payment_proof_url = updates.payment_proof_url;
    if (updates.customer_id !== undefined) fields.customer_id = updates.customer_id;

    const { data, error } = await supabase.from('contracts').update(fields).eq('id', id).select();

    if (data && !error) {
      setState(prev => ({
        ...prev,
        contracts: prev.contracts.map(c => c.id === id ? { ...c, ...updates } : c)
      }));

      // SYNC: Update linked transactions if proof changed
      if (updates.payment_proof_url) {
        await supabase.from('transactions').update({ attachment_url: updates.payment_proof_url }).eq('contract_id', id);
        setState(prev => ({
          ...prev,
          transactions: prev.transactions.map(t => t.contract_id === id ? { ...t, attachment_url: updates.payment_proof_url } : t)
        }));
      }
    }
  };

  const deleteContract = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('contracts').delete().eq('id', id);
    if (!error) {
      setState(prev => ({ ...prev, contracts: prev.contracts.filter(c => c.id !== id) }));
    }
  };

  // --- Inventory ---
  const addInventoryItem = async (item: Omit<InventoryItem, 'id' | 'user_id' | 'criadoEm'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('inventory').insert([{
      user_id: user.id,
      nome: item.nome,
      descricao: item.descricao,
      quantidade: item.quantidade,
      preco: item.preco,
      categoria: item.categoria
    }]).select();

    if (data && !error) {
      const newItem = {
        ...data[0],
        criadoEm: new Date(data[0].criado_em).getTime()
      };
      setState(prev => ({ ...prev, inventory: [newItem, ...prev.inventory] }));
    }
  };

  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    if (!user) return;
    const { data, error } = await supabase.from('inventory').update({
      nome: updates.nome,
      descricao: updates.descricao,
      quantidade: updates.quantidade,
      preco: updates.preco,
      categoria: updates.categoria
    }).eq('id', id).select();

    if (data && !error) {
      setState(prev => ({
        ...prev,
        inventory: prev.inventory.map(i => i.id === id ? { ...i, ...updates } : i)
      }));
    }
  };

  const deleteInventoryItem = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('inventory').delete().eq('id', id);
    if (!error) {
      setState(prev => ({ ...prev, inventory: prev.inventory.filter(i => i.id !== id) }));
    }
  };

  // --- Sales ---
  const addSale = async (sale: Omit<Sale, 'id' | 'user_id' | 'criadoEm'>, items: Omit<SaleItem, 'id' | 'sale_id'>[]) => {
    if (!user) return;

    // 1. Create the sale
    const { data: saleData, error: saleError } = await supabase.from('sales').insert([{
      user_id: user.id,
      customer_id: sale.customer_id,
      total: sale.total,
      status: sale.status,
      metodo_pagamento: sale.metodo_pagamento
    }]).select();

    if (saleError || !saleData) return;

    const saleId = saleData[0].id;

    // 2. Create sale items
    const { error: itemsError } = await supabase.from('sale_items').insert(
      items.map(item => ({
        sale_id: saleId,
        product_id: item.product_id,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
        nome_produto: item.nome_produto
      }))
    );

    if (!itemsError) {
      // 3. Create a financial transaction for the sale
      await addTransaction({
        tipo: 'receita',
        valor: sale.total,
        categoria: 'Vendas',
        descricao: `VENDA_ID:${saleId}`, // Using a searchable pattern
        data: new Date().toISOString().split('T')[0],
        customer_id: sale.customer_id,
        statusPagamento: sale.status === 'concluido' ? 'pago' : 'pendente'
      });

      fetchData(); // Refresh everything
    }
  };

  const updateSaleStatus = async (id: string, status: Sale['status']) => {
    if (!user) return;
    const { error } = await supabase.from('sales').update({ status }).eq('id', id);
    if (!error) {
      // Also update the related transaction status
      const relatedTx = state.transactions.find(t => t.descricao.includes(`VENDA_ID:${id}`));
      if (relatedTx) {
        await updateTransaction(relatedTx.id, { statusPagamento: status === 'concluido' ? 'pago' : 'pendente' });
      }

      setState(prev => ({
        ...prev,
        sales: prev.sales.map(s => s.id === id ? { ...s, status } : s)
      }));
    }
  };

  const deleteSale = async (id: string) => {
    if (!user) return;

    // 1. Delete the sale (this will trigger cascade on sale_items in DB)
    const { error } = await supabase.from('sales').delete().eq('id', id);
    if (!error) {
      // 2. Find and delete the related transaction
      const relatedTx = state.transactions.find(t => t.descricao.includes(`VENDA_ID:${id}`));
      if (relatedTx) {
        await supabase.from('transactions').delete().eq('id', relatedTx.id);
      }

      setState(prev => ({
        ...prev,
        sales: prev.sales.filter(s => s.id !== id),
        transactions: prev.transactions.filter(t => !t.descricao.includes(`VENDA_ID:${id}`))
      }));
    }
  };

  const setAppMode = (mode: AppMode) => {
    localStorage.setItem('appMode', mode);
    setState(prev => ({ ...prev, appMode: mode }));
  };

  // --- Appointments ---
  const addAppointment = async (appointment: Omit<Appointment, 'id' | 'user_id' | 'criadoEm'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('appointments').insert([{
      user_id: user.id,
      customer_id: appointment.customer_id || null,
      titulo: appointment.titulo,
      descricao: appointment.descricao,
      data: appointment.data,
      horario: appointment.horario,
      tipo: appointment.tipo,
      status: appointment.status
    }]).select();

    if (data && !error) {
      const newAppointment = {
        ...data[0],
        criadoEm: new Date(data[0].criado_em).getTime()
      };
      setState(prev => ({
        ...prev,
        appointments: [...prev.appointments, newAppointment].sort((a, b) => {
          if (a.data !== b.data) return a.data.localeCompare(b.data);
          return a.horario.localeCompare(b.horario);
        })
      }));
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    if (!user) return;
    const fields: any = {};
    if (updates.customer_id !== undefined) fields.customer_id = updates.customer_id || null;
    if (updates.titulo !== undefined) fields.titulo = updates.titulo;
    if (updates.descricao !== undefined) fields.descricao = updates.descricao;
    if (updates.data !== undefined) fields.data = updates.data;
    if (updates.horario !== undefined) fields.horario = updates.horario;
    if (updates.tipo !== undefined) fields.tipo = updates.tipo;
    if (updates.status !== undefined) fields.status = updates.status;

    const { data, error } = await supabase.from('appointments').update(fields).eq('id', id).select();

    if (data && !error) {
      setState(prev => ({
        ...prev,
        appointments: prev.appointments.map(a => a.id === id ? { ...a, ...updates } : a)
          .sort((a, b) => {
            if (a.data !== b.data) return a.data.localeCompare(b.data);
            return a.horario.localeCompare(b.horario);
          })
      }));
    }
  };

  const deleteAppointment = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (!error) {
      setState(prev => ({ ...prev, appointments: prev.appointments.filter(a => a.id !== id) }));
    }
  };

  // --- Bio & Leads ---
  const updateBioConfig = async (updates: Partial<BioConfig>) => {
    if (!user) return;

    if (state.bioConfig) {
      const { data, error } = await supabase
        .from('bio_configs')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (data && !error) {
        setState(prev => ({ ...prev, bioConfig: data }));
      }
    } else {
      const { data, error } = await supabase
        .from('bio_configs')
        .insert([{ ...updates, user_id: user.id }])
        .select()
        .single();

      if (data && !error) {
        setState(prev => ({ ...prev, bioConfig: data }));
      }
    }
  };

  const submitLead = async (username: string, lead: { nome: string; email: string; telefone: string; mensagem?: string }) => {
    // 1. Find the user ID for this username
    const { data: bioData, error: bioError } = await supabase
      .from('bio_configs')
      .select('user_id')
      .eq('username', username)
      .single();

    if (bioError || !bioData) throw new Error('Link-in-bio not found');

    // 2. Create the customer as a "Lead"
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .insert([{
        user_id: bioData.user_id,
        nome: lead.nome,
        email: lead.email,
        telefone: lead.telefone,
        status: 'ativo'
      }])
      .select()
      .single();

    if (customerError) throw customerError;

    // 3. Create a task for the user to follow up
    await supabase.from('tasks').insert([{
      user_id: bioData.user_id,
      customer_id: customerData.id,
      titulo: `Novo Lead: ${lead.nome}`,
      descricao: `Mensagem: ${lead.mensagem || 'Sem mensagem'}\nTelefone: ${lead.telefone}`,
      coluna: 'todo',
      tags: ['Lead', 'Bio']
    }]);
  };

  return (
    <AppContext.Provider value={{
      ...state,
      addIdea, updateIdea, deleteIdea,
      addTask, moveTask, deleteTask,
      addTransaction, updateTransaction, deleteTransaction,
      convertIdeaToTask,
      toggleIdeaShare,
      addCustomer, updateCustomer, deleteCustomer, togglePortalShare,
      addContract, updateContract, deleteContract,
      addInventoryItem, updateInventoryItem, deleteInventoryItem,
      addSale, updateSaleStatus, deleteSale,
      addAppointment, updateAppointment, deleteAppointment,
      updateBioConfig, submitLead,
      setAppMode
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
