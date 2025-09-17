# Qylon Infrastructure on DigitalOcean
# Chief Architect: Bill (siwale)

terraform {
  required_version = ">= 1.0"
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

# Configure the DigitalOcean Provider
provider "digitalocean" {
  token = var.do_token
}

# Variables
variable "do_token" {
  description = "DigitalOcean API token"
  type        = string
  sensitive   = true
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "qylon"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "region" {
  description = "DigitalOcean region"
  type        = string
  default     = "nyc3"
}

variable "node_count" {
  description = "Number of nodes in the cluster"
  type        = number
  default     = 3
}

variable "node_size" {
  description = "Size of the nodes"
  type        = string
  default     = "s-2vcpu-4gb"
}

# Data sources
data "digitalocean_kubernetes_versions" "main" {
  version_prefix = "1.28."
}

# VPC
resource "digitalocean_vpc" "main" {
  name     = "${var.project_name}-${var.environment}-vpc"
  region   = var.region
  ip_range = "10.10.0.0/16"
}

# Kubernetes Cluster
resource "digitalocean_kubernetes_cluster" "main" {
  name    = "${var.project_name}-${var.environment}-cluster"
  region  = var.region
  version = data.digitalocean_kubernetes_versions.main.latest_version
  vpc_uuid = digitalocean_vpc.main.id

  node_pool {
    name       = "${var.project_name}-${var.environment}-pool"
    size       = var.node_size
    node_count = var.node_count
    auto_scale = true
    min_nodes  = 2
    max_nodes  = 10
  }

  maintenance_policy {
    start_time = "04:00"
    day        = "sunday"
  }
}

# Container Registry
resource "digitalocean_container_registry" "main" {
  name                   = "${var.project_name}-${var.environment}-registry"
  subscription_tier_slug = "starter"
  region                 = var.region
}

# Database Cluster
resource "digitalocean_database_cluster" "main" {
  name       = "${var.project_name}-${var.environment}-db"
  engine     = "pg"
  version    = "15"
  size       = "db-s-2vcpu-4gb"
  region     = var.region
  node_count = 2
  vpc_uuid   = digitalocean_vpc.main.id

  maintenance_window {
    day  = "sunday"
    hour = "04:00"
  }
}

# Redis Cluster
resource "digitalocean_database_cluster" "redis" {
  name       = "${var.project_name}-${var.environment}-redis"
  engine     = "redis"
  version    = "7"
  size       = "db-s-1vcpu-2gb"
  region     = var.region
  node_count = 1
  vpc_uuid   = digitalocean_vpc.main.id

  maintenance_window {
    day  = "sunday"
    hour = "04:00"
  }
}

# Spaces Bucket for file storage
resource "digitalocean_spaces_bucket" "main" {
  name   = "${var.project_name}-${var.environment}-storage"
  region = var.region
}

# Load Balancer
resource "digitalocean_loadbalancer" "main" {
  name   = "${var.project_name}-${var.environment}-lb"
  region = var.region
  vpc_uuid = digitalocean_vpc.main.id

  forwarding_rule {
    entry_protocol  = "http"
    entry_port      = 80
    target_protocol = "http"
    target_port     = 3000
  }

  forwarding_rule {
    entry_protocol  = "https"
    entry_port      = 443
    target_protocol = "http"
    target_port     = 3000
    tls_passthrough = false
  }

  healthcheck {
    protocol               = "http"
    port                   = 3000
    path                   = "/health"
    check_interval_seconds = 10
    response_timeout_seconds = 5
    unhealthy_threshold    = 3
    healthy_threshold      = 2
  }

  droplet_ids = []
}

# Firewall
resource "digitalocean_firewall" "main" {
  name = "${var.project_name}-${var.environment}-firewall"

  droplet_ids = []

  inbound_rule {
    protocol         = "tcp"
    port_range       = "22"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "80"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "443"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "3000-3008"
    source_addresses = ["10.10.0.0/16"]
  }

  outbound_rule {
    protocol              = "tcp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "udp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }
}

# Monitoring
resource "digitalocean_monitoring_alert" "cpu" {
  alerts {
    email = ["admin@qylon.ai"]
  }
  compare = "GreaterThan"
  description = "CPU usage is above 80%"
  enabled = true
  entities = [digitalocean_kubernetes_cluster.main.id]
  tags = ["production"]
  type = "v1/insights/droplet/cpu"
  value = 80
  window = "5m"
}

resource "digitalocean_monitoring_alert" "memory" {
  alerts {
    email = ["admin@qylon.ai"]
  }
  compare = "GreaterThan"
  description = "Memory usage is above 80%"
  enabled = true
  entities = [digitalocean_kubernetes_cluster.main.id]
  tags = ["production"]
  type = "v1/insights/droplet/memory_utilization_percent"
  value = 80
  window = "5m"
}

# Outputs
output "cluster_id" {
  description = "The ID of the Kubernetes cluster"
  value       = digitalocean_kubernetes_cluster.main.id
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

output "database_uri" {
  description = "The URI of the PostgreSQL database"
  value       = digitalocean_database_cluster.main.uri
  sensitive   = true
}

output "redis_uri" {
  description = "The URI of the Redis database"
  value       = digitalocean_database_cluster.redis.uri
  sensitive   = true
}

output "spaces_endpoint" {
  description = "The endpoint of the Spaces bucket"
  value       = digitalocean_spaces_bucket.main.endpoint
}

output "load_balancer_ip" {
  description = "The IP address of the load balancer"
  value       = digitalocean_loadbalancer.main.ip
}