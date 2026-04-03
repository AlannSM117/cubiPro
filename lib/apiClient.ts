export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cubi-api.onrender.com';

export class ApiClient {
  private static getHeaders() {
    let token = '';
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('access_token') || '';
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // --- AUTH --- //
  static async login(data: any) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al iniciar sesión');
    const json = await res.json();
    if (typeof window !== 'undefined' && json.access_token) {
      localStorage.setItem('access_token', json.access_token);
    }
    return json;
  }

  static logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  }

  static getUserFromToken(): any | null {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  // --- DASHBOARD --- //
  static async getDashboardMetrics() {
    const res = await fetch(`${API_URL}/dashboard/metrics`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Error al obtener métricas');
    return res.json();
  }

  static async getDashboardRecentEntries() {
    const res = await fetch(`${API_URL}/dashboard/recent-entries`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Error al obtener entradas recientes');
    return res.json();
  }
  
  static async getDashboardChart() {
    const res = await fetch(`${API_URL}/dashboard/chart`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Error al obtener gráfico de producción');
    return res.json();
  }

  // --- TROCERIA --- //
  static async getTrocerias() {
    const res = await fetch(`${API_URL}/troceria`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Error al obtener trocerias');
    return res.json();
  }

  static async createEntradaTroceria(data: { fecha: string, turno: string, origen: string, clase: number }) {
    const res = await fetch(`${API_URL}/troceria`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const resp = await res.json().catch(() => null);
      const msg = resp?.message ? (Array.isArray(resp.message) ? resp.message.join(', ') : resp.message) : 'Error al crear entrada de trocería';
      throw new Error(msg);
    }
    return res.json();
  }

  static async addTroza(entradaId: string, data: { diametro1: number, diametro2: number, largo: number, descuento: number }) {
    const res = await fetch(`${API_URL}/troceria/${entradaId}/trozas`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const resp = await res.json().catch(() => null);
      const msg = resp?.message ? (Array.isArray(resp.message) ? resp.message.join(', ') : resp.message) : 'Error al agregar troza';
      throw new Error(msg);
    }
    return res.json();
  }

  static async finalizarEntrada(entradaId: string) {
    const res = await fetch(`${API_URL}/troceria/${entradaId}/finalizar`, {
      method: 'PATCH',
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Error al finalizar entrada');
    return res.json();
  }

  // --- PRODUCCION --- //
  static async getProducciones() {
    const res = await fetch(`${API_URL}/produccion`, { headers: this.getHeaders() });
    if (!res.ok) {
      // Retornar vacio si falla para que no rompa la pantalla
      return [];
    }
    return res.json().catch(() => []);
  }

  // --- USUARIOS --- //
  static async getUsers() {
    const res = await fetch(`${API_URL}/users`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Error al obtener usuarios');
    return res.json();
  }

  static async createUser(data: any) {
    const res = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const resp = await res.json().catch(() => null);
      const msg = resp?.message ? (Array.isArray(resp.message) ? resp.message.join(', ') : resp.message) : 'Error al crear usuario';
      throw new Error(msg);
    }
    return res.json();
  }

  static async updateUser(id: string, data: any) {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar usuario');
    return res.json();
  }

  static async deleteUser(id: string) {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Error al eliminar usuario');
    // Delete might return empty or JSON depending on backend
    return res.json().catch(() => ({}));
  }
}
