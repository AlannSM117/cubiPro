export type EntradaTroceria = {
  id: string;
  folio: string;
  fecha: string;
  turno: string;
  aserradero: number;
  volumen_final: number;
  total_trozas: number;
  created_at: string;
  user_id: string | null;
};

export type Troza = {
  id: string;
  entrada_id: string;
  origen: string;
  diametro_1: number;
  diametro_2: number;
  largo: number;
  clase: string;
  volumen_m3: number;
  descuento_porcentaje: number;
  descuento_vo?: number;
  volumen_total: number;
  created_at: string;
};

export type ProduccionDiaria = {
  id: string;
  fecha: string;
  volumen_ingresado: number;
  volumen_producido: number;
  created_at: string;
};

// Mock Client para pruebas locales sin Supabase
class QueryBuilder {
  private queryData: any[];
  private isSingle = false;

  constructor(private table: string, private data: any[]) {
    this.queryData = [...this.data];
  }

  select(fields = '*') {
    return this;
  }

  eq(column: string, value: any) {
    this.queryData = this.queryData.filter((item: any) => item[column] === value);
    return this;
  }

  order(column: string, { ascending = true } = {}) {
    this.queryData.sort((a, b) => {
      if (a[column] < b[column]) return ascending ? -1 : 1;
      if (a[column] > b[column]) return ascending ? 1 : -1;
      return 0;
    });
    return this;
  }

  limit(count: number) {
    this.queryData = this.queryData.slice(0, count);
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isSingle = true;
    return this;
  }

  insert(newData: any | any[]) {
    const items = Array.isArray(newData) ? newData : [newData];
    const itemsWithId = items.map((item) => ({ 
      ...item, 
      id: item.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString()), 
      created_at: new Date().toISOString() 
    }));
    
    if (typeof window !== 'undefined') {
      const allData = JSON.parse(localStorage.getItem(`db_${this.table}`) || '[]');
      localStorage.setItem(`db_${this.table}`, JSON.stringify([...allData, ...itemsWithId]));
    }

    this.queryData = itemsWithId;
    return this;
  }

  then(resolve: any, reject: any) {
    const data = this.isSingle ? (this.queryData[0] || null) : this.queryData;
    Promise.resolve({ data, error: null }).then(resolve, reject);
  }
}

const mockSupabase = {
  auth: {
    signInWithPassword: async () => {
      if (typeof window !== 'undefined') localStorage.setItem('auth_session', 'true');
      return { data: { session: true }, error: null };
    },
    getSession: async () => {
      let isLogged = true;
      if (typeof window !== 'undefined') {
        isLogged = localStorage.getItem('auth_session') === 'true';
      }
      if (isLogged) {
        return { data: { session: { user: { email: 'usuario@local.host' } } } };
      }
      return { data: { session: null } };
    },
    onAuthStateChange: (cb: any) => {
      let isLogged = true;
      if (typeof window !== 'undefined') {
        isLogged = localStorage.getItem('auth_session') === 'true';
      }
      if (isLogged) {
        cb('SIGNED_IN', { user: { email: 'usuario@local.host' } });
      } else {
        cb('SIGNED_OUT', null);
      }
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signOut: async () => {
      if (typeof window !== 'undefined') localStorage.removeItem('auth_session');
    }
  },
  from: (table: string) => {
    let data = [];
    if (typeof window !== 'undefined') {
      data = JSON.parse(localStorage.getItem(`db_${table}`) || '[]');
    }
    return new QueryBuilder(table, data);
  }
};

export const db = mockSupabase as any;
