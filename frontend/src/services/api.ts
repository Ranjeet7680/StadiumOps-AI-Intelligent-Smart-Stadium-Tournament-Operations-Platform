const API_BASE_URL = "http://localhost:8000/api/v1";

function getHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };
}

async function request(endpoint: string, method: string = "GET", body: any = null) {
  const options: RequestInit = {
    method,
    headers: getHeaders(),
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || "Something went wrong");
  }
  return response.json();
}

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      return request("/auth/login", "POST", { email, password });
    },
    me: async () => {
      return request("/auth/me");
    }
  },
  stadiums: {
    getStadiums: async () => request("/stadiums"),
    getZones: async (stadiumId: number) => request(`/stadiums/${stadiumId}/zones`),
    getGates: async (stadiumId: number) => request(`/stadiums/${stadiumId}/gates`),
    getAllGates: async () => request("/gates"),
    getAllZones: async () => request("/zones")
  },
  crowd: {
    getCurrent: async (stadiumId: number) => request(`/crowd/current?stadium_id=${stadiumId}`),
    getZones: async (stadiumId: number) => request(`/crowd/zones?stadium_id=${stadiumId}`),
    getPredictions: async (stadiumId: number) => request(`/crowd/predictions?stadium_id=${stadiumId}`),
    getHeatmap: async (stadiumId: number) => request(`/crowd/heatmap?stadium_id=${stadiumId}`)
  },
  ai: {
    getDecisions: async (status?: string) => {
      const url = status ? `/ai/decisions?status=${status}` : "/ai/decisions";
      return request(url);
    },
    getDecisionDetails: async (id: string) => request(`/ai/decisions/${id}`),
    approveDecision: async (id: string) => request(`/ai/decisions/${id}/approve`, "POST"),
    rejectDecision: async (id: string) => request(`/ai/decisions/${id}/reject`, "POST"),
    chat: async (message: string) => request("/ai/chat", "POST", { message })
  },
  incidents: {
    getIncidents: async (status?: string, severity?: string, search?: string) => {
      let url = "/incidents?";
      if (status) url += `status=${status}&`;
      if (severity) url += `severity=${severity}&`;
      if (search) url += `search=${search}&`;
      return request(url);
    },
    getIncidentById: async (id: number) => request(`/incidents/${id}`),
    createIncident: async (incident: any) => request("/incidents", "POST", incident),
    updateIncident: async (id: number, status: string, updateText: string) => {
      return request(`/incidents/${id}`, "PATCH", { status, update_text: updateText });
    }
  },
  tournaments: {
    getTournaments: async () => request("/tournaments"),
    getMatches: async () => request("/matches")
  },
  tickets: {
    scanTicket: async (qrToken: string, gateId: number, scannerId: string) => {
      return request("/tickets/scan", "POST", { qr_token: qrToken, gate_id: gateId, scanner_id: scannerId });
    }
  },
  parking: {
    getParking: async () => request("/parking")
  },
  facilities: {
    getFacilities: async () => request("/facilities"),
    getEnergyStats: async () => request("/energy/stats")
  },
  lostFound: {
    getLostFound: async () => request("/lost-found"),
    createLostFound: async (item: any) => request("/lost-found", "POST", item)
  },
  staff: {
    getStaff: async () => request("/staff"),
    getRecommendations: async () => request("/staff/recommendations")
  },
  analytics: {
    getHealth: async (stadiumId: number) => request(`/analytics/health?stadium_id=${stadiumId}`)
  },
  notifications: {
    getNotifications: async () => request("/notifications"),
    readNotification: async (id: number) => request(`/notifications/${id}/read`, "PATCH"),
    markAllRead: async () => request("/notifications/mark-all-read", "POST")
  },
  simulation: {
    control: async (action: string, speed: number = 1) => {
      return request("/simulation/control", "POST", { action, speed });
    }
  },
  audit: {
    getAuditLogs: async () => request("/audit")
  }
};
