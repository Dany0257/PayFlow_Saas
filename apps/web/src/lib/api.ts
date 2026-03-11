const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
    private token: string | null = null;

    constructor() {
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('payflow_token');
        }
    }

    setToken(token: string) {
        this.token = token;
        if (typeof window !== 'undefined') {
            localStorage.setItem('payflow_token', token);
        }
    }

    clearToken() {
        this.token = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('payflow_token');
        }
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...((options.headers as Record<string, string>) || {}),
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Erreur réseau' }));
            throw new Error(error.message || `Erreur ${response.status}`);
        }

        return response.json();
    }

    // Auth
    async register(data: any) {
        const result = await this.request<any>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        this.setToken(result.accessToken);
        return result;
    }

    async login(data: { email: string; password: string }) {
        const result = await this.request<any>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        this.setToken(result.accessToken);
        return result;
    }

    async getProfile() {
        return this.request<any>('/auth/profile');
    }

    // Clients
    async getClients() {
        return this.request<any[]>('/clients');
    }

    async createClient(data: any) {
        return this.request<any>('/clients', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateClient(id: string, data: any) {
        return this.request<any>(`/clients/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async deleteClient(id: string) {
        return this.request<any>(`/clients/${id}`, {
            method: 'DELETE',
        });
    }

    // Invoices
    async getInvoices(page = 1, limit = 20, status?: string) {
        let url = `/invoices?page=${page}&limit=${limit}`;
        if (status) url += `&status=${status}`;
        return this.request<any>(url);
    }

    async getInvoice(id: string) {
        return this.request<any>(`/invoices/${id}`);
    }

    async getInvoiceByToken(token: string) {
        return this.request<any>(`/invoices/public/${token}`);
    }

    async createInvoice(data: any) {
        return this.request<any>('/invoices', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateInvoiceStatus(id: string, status: string) {
        return this.request<any>(`/invoices/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    }

    async deleteInvoice(id: string) {
        return this.request<any>(`/invoices/${id}`, {
            method: 'DELETE',
        });
    }

    // Stats
    async getDashboardStats() {
        return this.request<any>('/stats/dashboard');
    }

    async getMonthlyRevenue(year?: number) {
        const url = year ? `/stats/revenue?year=${year}` : '/stats/revenue';
        return this.request<any>(url);
    }
}

export const api = new ApiClient();
