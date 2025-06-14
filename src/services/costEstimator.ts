
export interface PricingData {
  gpu: {
    [key: string]: number; // USD per GPU-hour
  };
  vectorStore: {
    [key: string]: number; // USD per month
  };
  llmToken: {
    [key: string]: number; // USD per token
  };
  infrastructure: {
    supabase_pro: number;
    vm_small: number;
    vm_medium: number;
    storage_per_gb: number;
    bandwidth_per_gb: number;
    k8s_control_plane: number;
  };
  workflow: {
    n8n_self_hosted: number;
    n8n_cloud_free: number;
  };
}

export const PRICING_DATA: PricingData = {
  gpu: {
    a100: 1.20, // CoreWeave A100 per hour
    h100: 2.50, // CoreWeave H100 per hour
    none: 0.00, // No GPU usage
  },
  vectorStore: {
    chroma: 22.00, // ChromaDB on 4vCPU/16GB VM
    weaviate: 50.00, // Weaviate managed small
    qdrant: 35.00, // Qdrant managed
  },
  llmToken: {
    llama3: 0.00, // Self-hosted, GPU cost covered separately
    gemini: 0.00008, // Gemini 2.5 Pro
    claude: 0.00250, // Claude Sonnet
    gpt4: 0.00003, // GPT-4
  },
  infrastructure: {
    supabase_pro: 25.00,
    vm_small: 15.00, // 2vCPU/4GB for UI+API
    vm_medium: 22.00, // 4vCPU/16GB for vector DB
    storage_per_gb: 0.023, // S3/GCS standard
    bandwidth_per_gb: 0.09,
    k8s_control_plane: 100.00,
  },
  workflow: {
    n8n_self_hosted: 10.00,
    n8n_cloud_free: 0.00,
  },
};

export interface CostBreakdown {
  gpu_cost: number;
  vector_db_cost: number;
  llm_cost: number;
  infrastructure_cost: number;
  storage_cost: number;
  workflow_cost: number;
  bandwidth_cost: number;
  total: number;
}

export interface CostEstimationInputs {
  // GPU Configuration
  gpu_provider?: string;
  gpu_count?: number;
  gpu_hours_per_day?: number;
  
  // Vector Store
  vector_store?: string;
  
  // LLM Configuration
  llm_provider?: string;
  token_budget?: number;
  
  // Infrastructure
  supabase_plan?: 'free' | 'pro';
  storage_gb?: number;
  bandwidth_gb?: number;
  use_k8s?: boolean;
  
  // Workflow
  n8n_mode?: 'self_hosted' | 'cloud_free';
}

export class CostEstimator {
  private pricing: PricingData;

  constructor(pricing: PricingData = PRICING_DATA) {
    this.pricing = pricing;
  }

  estimateGpuCost(provider: string = 'none', count: number = 0, hoursPerDay: number = 24): number {
    const rate = this.pricing.gpu[provider] || 0;
    const daysPerMonth = 30;
    return rate * count * hoursPerDay * daysPerMonth;
  }

  estimateVectorDbCost(storeType: string = 'chroma'): number {
    return this.pricing.vectorStore[storeType] || 0;
  }

  estimateLlmCost(provider: string = 'llama3', tokenBudget: number = 0): number {
    const rate = this.pricing.llmToken[provider] || 0;
    return rate * tokenBudget;
  }

  estimateInfrastructureCost(
    supabasePlan: 'free' | 'pro' = 'free',
    useK8s: boolean = false
  ): number {
    let cost = this.pricing.infrastructure.vm_small; // Base VM cost
    
    if (supabasePlan === 'pro') {
      cost += this.pricing.infrastructure.supabase_pro;
    }
    
    if (useK8s) {
      cost += this.pricing.infrastructure.k8s_control_plane;
    }
    
    return cost;
  }

  estimateStorageCost(storageGb: number = 0): number {
    return storageGb * this.pricing.infrastructure.storage_per_gb;
  }

  estimateWorkflowCost(n8nMode: 'self_hosted' | 'cloud_free' = 'cloud_free'): number {
    return this.pricing.workflow[n8nMode] || 0;
  }

  estimateBandwidthCost(bandwidthGb: number = 10): number {
    return bandwidthGb * this.pricing.infrastructure.bandwidth_per_gb;
  }

  estimateTotal(inputs: CostEstimationInputs): CostBreakdown {
    const gpuCost = this.estimateGpuCost(
      inputs.gpu_provider,
      inputs.gpu_count,
      inputs.gpu_hours_per_day
    );
    
    const vectorDbCost = this.estimateVectorDbCost(inputs.vector_store);
    
    const llmCost = this.estimateLlmCost(
      inputs.llm_provider,
      inputs.token_budget
    );
    
    const infrastructureCost = this.estimateInfrastructureCost(
      inputs.supabase_plan,
      inputs.use_k8s
    );
    
    const storageCost = this.estimateStorageCost(inputs.storage_gb);
    
    const workflowCost = this.estimateWorkflowCost(inputs.n8n_mode);
    
    const bandwidthCost = this.estimateBandwidthCost(inputs.bandwidth_gb);
    
    const total = gpuCost + vectorDbCost + llmCost + infrastructureCost + 
                 storageCost + workflowCost + bandwidthCost;

    return {
      gpu_cost: Math.round(gpuCost * 100) / 100,
      vector_db_cost: Math.round(vectorDbCost * 100) / 100,
      llm_cost: Math.round(llmCost * 100) / 100,
      infrastructure_cost: Math.round(infrastructureCost * 100) / 100,
      storage_cost: Math.round(storageCost * 100) / 100,
      workflow_cost: Math.round(workflowCost * 100) / 100,
      bandwidth_cost: Math.round(bandwidthCost * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }
}

export const costEstimator = new CostEstimator();
