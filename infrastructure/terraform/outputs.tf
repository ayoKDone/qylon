# Outputs for Qylon Infrastructure

output "cluster_id" {
  description = "The ID of the Kubernetes cluster"
  value       = digitalocean_kubernetes_cluster.main.id
}

output "cluster_name" {
  description = "The name of the Kubernetes cluster"
  value       = digitalocean_kubernetes_cluster.main.name
}

output "cluster_endpoint" {
  description = "The endpoint of the Kubernetes cluster"
  value       = digitalocean_kubernetes_cluster.main.endpoint
}

output "cluster_kubeconfig" {
  description = "The kubeconfig for the Kubernetes cluster"
  value       = digitalocean_kubernetes_cluster.main.kube_config
  sensitive   = true
}

output "cluster_version" {
  description = "The version of the Kubernetes cluster"
  value       = digitalocean_kubernetes_cluster.main.version
}

output "vpc_id" {
  description = "The ID of the VPC"
  value       = digitalocean_vpc.main.id
}

output "vpc_name" {
  description = "The name of the VPC"
  value       = digitalocean_vpc.main.name
}

output "vpc_ip_range" {
  description = "The IP range of the VPC"
  value       = digitalocean_vpc.main.ip_range
}

output "database_id" {
  description = "The ID of the PostgreSQL database cluster"
  value       = digitalocean_database_cluster.main.id
}

output "database_name" {
  description = "The name of the PostgreSQL database cluster"
  value       = digitalocean_database_cluster.main.name
}

output "database_uri" {
  description = "The URI of the PostgreSQL database"
  value       = digitalocean_database_cluster.main.uri
  sensitive   = true
}

output "database_host" {
  description = "The host of the PostgreSQL database"
  value       = digitalocean_database_cluster.main.host
  sensitive   = true
}

output "database_port" {
  description = "The port of the PostgreSQL database"
  value       = digitalocean_database_cluster.main.port
}

output "database_user" {
  description = "The user of the PostgreSQL database"
  value       = digitalocean_database_cluster.main.user
  sensitive   = true
}

output "database_password" {
  description = "The password of the PostgreSQL database"
  value       = digitalocean_database_cluster.main.password
  sensitive   = true
}

output "database_database" {
  description = "The database name of the PostgreSQL database"
  value       = digitalocean_database_cluster.main.database
}

output "redis_id" {
  description = "The ID of the Redis database cluster"
  value       = digitalocean_database_cluster.redis.id
}

output "redis_name" {
  description = "The name of the Redis database cluster"
  value       = digitalocean_database_cluster.redis.name
}

output "redis_uri" {
  description = "The URI of the Redis database"
  value       = digitalocean_database_cluster.redis.uri
  sensitive   = true
}

output "redis_host" {
  description = "The host of the Redis database"
  value       = digitalocean_database_cluster.redis.host
  sensitive   = true
}

output "redis_port" {
  description = "The port of the Redis database"
  value       = digitalocean_database_cluster.redis.port
}

output "redis_password" {
  description = "The password of the Redis database"
  value       = digitalocean_database_cluster.redis.password
  sensitive   = true
}

output "spaces_bucket_name" {
  description = "The name of the Spaces bucket"
  value       = digitalocean_spaces_bucket.main.name
}

output "spaces_endpoint" {
  description = "The endpoint of the Spaces bucket"
  value       = digitalocean_spaces_bucket.main.endpoint
}

output "spaces_region" {
  description = "The region of the Spaces bucket"
  value       = digitalocean_spaces_bucket.main.region
}

output "container_registry_id" {
  description = "The ID of the container registry"
  value       = digitalocean_container_registry.main.id
}

output "container_registry_name" {
  description = "The name of the container registry"
  value       = digitalocean_container_registry.main.name
}

output "container_registry_endpoint" {
  description = "The endpoint of the container registry"
  value       = digitalocean_container_registry.main.endpoint
}

output "load_balancer_id" {
  description = "The ID of the load balancer"
  value       = digitalocean_loadbalancer.main.id
}

output "load_balancer_name" {
  description = "The name of the load balancer"
  value       = digitalocean_loadbalancer.main.name
}

output "load_balancer_ip" {
  description = "The IP address of the load balancer"
  value       = digitalocean_loadbalancer.main.ip
}

output "firewall_id" {
  description = "The ID of the firewall"
  value       = digitalocean_firewall.main.id
}

output "firewall_name" {
  description = "The name of the firewall"
  value       = digitalocean_firewall.main.name
}

# Connection strings for applications
output "database_connection_string" {
  description = "PostgreSQL connection string for applications"
  value       = "postgresql://${digitalocean_database_cluster.main.user}:${digitalocean_database_cluster.main.password}@${digitalocean_database_cluster.main.host}:${digitalocean_database_cluster.main.port}/${digitalocean_database_cluster.main.database}?sslmode=require"
  sensitive   = true
}

output "redis_connection_string" {
  description = "Redis connection string for applications"
  value       = "redis://:${digitalocean_database_cluster.redis.password}@${digitalocean_database_cluster.redis.host}:${digitalocean_database_cluster.redis.port}"
  sensitive   = true
}

# Environment variables for deployment
output "environment_variables" {
  description = "Environment variables for application deployment"
  value = {
    DATABASE_URL = "postgresql://${digitalocean_database_cluster.main.user}:${digitalocean_database_cluster.main.password}@${digitalocean_database_cluster.main.host}:${digitalocean_database_cluster.main.port}/${digitalocean_database_cluster.main.database}?sslmode=require"
    REDIS_URL = "redis://:${digitalocean_database_cluster.redis.password}@${digitalocean_database_cluster.redis.host}:${digitalocean_database_cluster.redis.port}"
    SPACES_ENDPOINT = digitalocean_spaces_bucket.main.endpoint
    SPACES_BUCKET = digitalocean_spaces_bucket.main.name
    REGISTRY_ENDPOINT = digitalocean_container_registry.main.endpoint
    LOAD_BALANCER_IP = digitalocean_loadbalancer.main.ip
  }
  sensitive = true
}

# Kubernetes configuration
output "kubectl_config" {
  description = "Kubectl configuration command"
  value       = "doctl kubernetes cluster kubeconfig save ${digitalocean_kubernetes_cluster.main.id}"
}

# Deployment instructions
output "deployment_instructions" {
  description = "Instructions for deploying the application"
  value = <<-EOT
    To deploy the Qylon application:
    
    1. Configure kubectl:
       doctl kubernetes cluster kubeconfig save ${digitalocean_kubernetes_cluster.main.id}
    
    2. Set environment variables:
       export DATABASE_URL="${digitalocean_database_cluster.main.uri}"
       export REDIS_URL="${digitalocean_database_cluster.redis.uri}"
       export SPACES_ENDPOINT="${digitalocean_spaces_bucket.main.endpoint}"
       export SPACES_BUCKET="${digitalocean_spaces_bucket.main.name}"
    
    3. Deploy the application:
       kubectl apply -f k8s/
    
    4. Access the application:
       http://${digitalocean_loadbalancer.main.ip}
  EOT
}