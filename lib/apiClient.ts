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

  // AUTH
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
      // Limpiar datos residuales del almacenamiento local (mock antiguo)
      this.clearLegacyLocalStorage();
    }
    return json;
  }

  static logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      this.clearLegacyLocalStorage();
    }
  }

  /** Elimina todos los datos residuales del mock local (localDb antiguo) */
  static clearLegacyLocalStorage() {
    if (typeof window === 'undefined') return;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('db_') || key === 'auth_session')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
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

  // DASHBOARD
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

  // TROCERIA
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

  static async getTrozasByEntrada(entradaId: string) {
    const res = await fetch(`${API_URL}/troceria/${entradaId}`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Error al obtener trozas');
    const data = await res.json();
    // La entrada completa viene con las trozas embebidas
    return Array.isArray(data?.trozas) ? data.trozas : [];
  }

  static async updateTroza(entradaId: string, trozaId: string, data: { diametro1?: number, diametro2?: number, largo?: number, descuento?: number }) {
    const res = await fetch(`${API_URL}/troceria/${entradaId}/trozas/${trozaId}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const resp = await res.json().catch(() => null);
      const msg = resp?.message ? (Array.isArray(resp.message) ? resp.message.join(', ') : resp.message) : 'Error al actualizar troza';
      throw new Error(msg);
    }
    return res.json();
  }

  static async deleteTroza(entradaId: string, trozaId: string) {
    const res = await fetch(`${API_URL}/troceria/${entradaId}/trozas/${trozaId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Error al eliminar troza');
    return res.json().catch(() => ({}));
  }

  static async finalizarEntrada(entradaId: string) {
    const res = await fetch(`${API_URL}/troceria/${entradaId}/finalizar`, {
      method: 'PATCH',
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Error al finalizar entrada');
    return res.json();
  }

  // PRODUCCION
  static async getProducciones() {
    const res = await fetch(`${API_URL}/produccion`, { headers: this.getHeaders() });
    if (!res.ok) {
      // Retornar vacio si falla para que no rompa la pantalla
      return [];
    }
    return res.json().catch(() => []);
  }

  static async createEntradaProduccion(data: { fecha: string, turno: string }) {
    const res = await fetch(`${API_URL}/produccion`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const resp = await res.json().catch(() => null);
      const msg = resp?.message ? (Array.isArray(resp.message) ? resp.message.join(', ') : resp.message) : 'Error al crear entrada de producción';
      throw new Error(msg);
    }
    return res.json();
  }

  static async addPieza(entradaId: string, data: { grueso: number, clase: number, ancho: number, largo: number, verde: number, estufa: number }) {
    const res = await fetch(`${API_URL}/produccion/${entradaId}/piezas`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const resp = await res.json().catch(() => null);
      const msg = resp?.message ? (Array.isArray(resp.message) ? resp.message.join(', ') : resp.message) : 'Error al agregar pieza';
      throw new Error(msg);
    }
    return res.json();
  }

  static async finalizarEntradaProduccion(entradaId: string) {
    const res = await fetch(`${API_URL}/produccion/${entradaId}/finalizar`, {
      method: 'PATCH',
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Error al finalizar entrada de producción');
    return res.json();
  }

  static async getPiezasByEntrada(entradaId: string) {
    const res = await fetch(`${API_URL}/produccion/${entradaId}`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Error al obtener piezas');
    const data = await res.json();
    return Array.isArray(data?.piezas) ? data.piezas : [];
  }

  static async updatePieza(entradaId: string, piezaId: string, data: { grueso?: number, clase?: number, ancho?: number, largo?: number, verde?: number, estufa?: number }) {
    const res = await fetch(`${API_URL}/produccion/${entradaId}/piezas/${piezaId}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const resp = await res.json().catch(() => null);
      const msg = resp?.message ? (Array.isArray(resp.message) ? resp.message.join(', ') : resp.message) : 'Error al actualizar pieza';
      throw new Error(msg);
    }
    return res.json();
  }

  static async deletePieza(entradaId: string, piezaId: string) {
    const res = await fetch(`${API_URL}/produccion/${entradaId}/piezas/${piezaId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Error al eliminar pieza');
    return res.json().catch(() => ({}));
  }

  // USUARIOS
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
    // La función Delete puede devolver un valor vacío o un objeto JSON, dependiendo del backend
    return res.json().catch(() => ({}));
  }
}
