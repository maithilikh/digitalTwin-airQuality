// API service for backend communication
const API_BASE_URL = "http://localhost:8000/api";

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      return {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Cities
  async getCities(): Promise<ApiResponse<string[]>> {
    return this.request<string[]>("/cities");
  }

  // Current city data
  async getCurrentCityData(city: string): Promise<
    ApiResponse<{
      aqi: number;
      temperature: number;
      humidity: number;
      windSpeed: number;
      pollutants: Record<string, number>;
      timestamp: string;
    }>
  > {
    return this.request(`/city/${encodeURIComponent(city)}/current`);
  }

  // City trend data
  async getCityTrend(city: string): Promise<ApiResponse<{ trend: number[] }>> {
    return this.request(`/city/${encodeURIComponent(city)}/trend`);
  }

  // City forecast data
  async getCityForecast(
    city: string,
    range: string = "7d"
  ): Promise<ApiResponse<{ forecast: number[] }>> {
    return this.request(
      `/city/${encodeURIComponent(city)}/forecast?range=${range}`
    );
  }

  // City pollutants
  async getCityPollutants(
    city: string
  ): Promise<ApiResponse<Record<string, number>>> {
    return this.request(`/city/${encodeURIComponent(city)}/pollutants`);
  }

  // Map locations
  async getMapLocations(): Promise<
    ApiResponse<
      Array<{
        city: string;
        lat: number;
        lng: number;
        aqi: number;
        weather: string;
        category: string;
      }>
    >
  > {
    return this.request("/map/locations");
  }

  // Historical data
  async getHistoricalData(
    city: string,
    pollutant: string,
    range: string
  ): Promise<
    ApiResponse<{
      [key: string]: number[] | string[]; // Allow both number arrays and string arrays
      dates: string[] | number[];
    }>
  > {
    return this.request(
      `/city/${encodeURIComponent(
        city
      )}/historical?pollutant=${pollutant}&range=${range}`
    );
  }

  // LLM Query
  async queryLLM(query: string): Promise<ApiResponse<{ response: string }>> {
    return this.request("/llm/query", {
      method: "POST",
      body: JSON.stringify({ query }),
    });
  }

  // City insights
  async getCityInsights(city: string): Promise<
    ApiResponse<{
      summary: string;
      health: string;
      recommendations: string[];
      trend: string;
    }>
  > {
    return this.request(`/city/${encodeURIComponent(city)}/insights`);
  }

  // Compare cities
  async compareCities(
    city1: string,
    city2: string
  ): Promise<
    ApiResponse<{
      city1: any;
      city2: any;
      ai_comparison: string;
    }>
  > {
    return this.request(
      `/compare?city1=${encodeURIComponent(city1)}&city2=${encodeURIComponent(
        city2
      )}`
    );
  }

  // Scenario analysis
  async analyzeScenario(
    city: string,
    params: {
      traffic: number;
      industrial: number;
      weather: string;
      population: number;
    }
  ): Promise<
    ApiResponse<{
      impact: any;
      ai_analysis: string;
    }>
  > {
    return this.request(`/city/${encodeURIComponent(city)}/scenario`, {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  // System status
  async getStatus(): Promise<
    ApiResponse<{
      pipeline: string;
      ai: string;
      uptime: string;
    }>
  > {
    return this.request("/status");
  }

  // Export dashboard data
  async exportDashboard(): Promise<ApiResponse<any>> {
    return this.request("/export/dashboard");
  }
}

export const apiService = new ApiService();
export default apiService;
