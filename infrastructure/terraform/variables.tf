# Variables for Qylon Infrastructure

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
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "region" {
  description = "DigitalOcean region"
  type        = string
  default     = "nyc3"
  
  validation {
    condition = contains([
      "nyc1", "nyc2", "nyc3", "sfo1", "sfo2", "sfo3",
      "tor1", "lon1", "fra1", "ams2", "ams3", "sgp1",
      "blr1", "syd1"
    ], var.region)
    error_message = "Region must be a valid DigitalOcean region."
  }
}

variable "node_count" {
  description = "Number of nodes in the cluster"
  type        = number
  default     = 3
  
  validation {
    condition     = var.node_count >= 1 && var.node_count <= 20
    error_message = "Node count must be between 1 and 20."
  }
}

variable "node_size" {
  description = "Size of the nodes"
  type        = string
  default     = "s-2vcpu-4gb"
  
  validation {
    condition = contains([
      "s-1vcpu-1gb", "s-1vcpu-2gb", "s-2vcpu-2gb", "s-2vcpu-4gb",
      "s-4vcpu-8gb", "s-8vcpu-16gb", "s-16vcpu-32gb", "s-24vcpu-48gb",
      "s-32vcpu-64gb", "s-48vcpu-96gb", "s-64vcpu-128gb"
    ], var.node_size)
    error_message = "Node size must be a valid DigitalOcean droplet size."
  }
}

variable "database_size" {
  description = "Size of the database cluster"
  type        = string
  default     = "db-s-2vcpu-4gb"
  
  validation {
    condition = contains([
      "db-s-1vcpu-1gb", "db-s-1vcpu-2gb", "db-s-2vcpu-2gb", "db-s-2vcpu-4gb",
      "db-s-4vcpu-8gb", "db-s-8vcpu-16gb", "db-s-16vcpu-32gb", "db-s-24vcpu-48gb",
      "db-s-32vcpu-64gb", "db-s-48vcpu-96gb", "db-s-64vcpu-128gb"
    ], var.database_size)
    error_message = "Database size must be a valid DigitalOcean database size."
  }
}

variable "redis_size" {
  description = "Size of the Redis cluster"
  type        = string
  default     = "db-s-1vcpu-2gb"
  
  validation {
    condition = contains([
      "db-s-1vcpu-1gb", "db-s-1vcpu-2gb", "db-s-2vcpu-2gb", "db-s-2vcpu-4gb",
      "db-s-4vcpu-8gb", "db-s-8vcpu-16gb", "db-s-16vcpu-32gb", "db-s-24vcpu-48gb",
      "db-s-32vcpu-64gb", "db-s-48vcpu-96gb", "db-s-64vcpu-128gb"
    ], var.redis_size)
    error_message = "Redis size must be a valid DigitalOcean database size."
  }
}

variable "enable_monitoring" {
  description = "Enable monitoring and alerting"
  type        = bool
  default     = true
}

variable "enable_backups" {
  description = "Enable automated backups"
  type        = bool
  default     = true
}

variable "backup_retention_days" {
  description = "Number of days to retain backups"
  type        = number
  default     = 7
  
  validation {
    condition     = var.backup_retention_days >= 1 && var.backup_retention_days <= 30
    error_message = "Backup retention days must be between 1 and 30."
  }
}

variable "maintenance_window_day" {
  description = "Day of the week for maintenance window"
  type        = string
  default     = "sunday"
  
  validation {
    condition = contains([
      "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
    ], var.maintenance_window_day)
    error_message = "Maintenance window day must be a valid day of the week."
  }
}

variable "maintenance_window_hour" {
  description = "Hour of the day for maintenance window (24-hour format)"
  type        = number
  default     = 4
  
  validation {
    condition     = var.maintenance_window_hour >= 0 && var.maintenance_window_hour <= 23
    error_message = "Maintenance window hour must be between 0 and 23."
  }
}

variable "notification_emails" {
  description = "List of email addresses for notifications"
  type        = list(string)
  default     = ["admin@qylon.ai"]
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = list(string)
  default     = ["qylon", "microservices", "ai-automation"]
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "qylon.ai"
}

variable "ssl_certificate_id" {
  description = "SSL certificate ID for HTTPS"
  type        = string
  default     = ""
}

variable "enable_auto_scaling" {
  description = "Enable auto-scaling for the cluster"
  type        = bool
  default     = true
}

variable "min_nodes" {
  description = "Minimum number of nodes for auto-scaling"
  type        = number
  default     = 2
  
  validation {
    condition     = var.min_nodes >= 1
    error_message = "Minimum nodes must be at least 1."
  }
}

variable "max_nodes" {
  description = "Maximum number of nodes for auto-scaling"
  type        = number
  default     = 10
  
  validation {
    condition     = var.max_nodes >= var.min_nodes
    error_message = "Maximum nodes must be greater than or equal to minimum nodes."
  }
}

variable "cpu_threshold" {
  description = "CPU threshold for auto-scaling (percentage)"
  type        = number
  default     = 80
  
  validation {
    condition     = var.cpu_threshold >= 10 && var.cpu_threshold <= 100
    error_message = "CPU threshold must be between 10 and 100."
  }
}

variable "memory_threshold" {
  description = "Memory threshold for auto-scaling (percentage)"
  type        = number
  default     = 80
  
  validation {
    condition     = var.memory_threshold >= 10 && var.memory_threshold <= 100
    error_message = "Memory threshold must be between 10 and 100."
  }
}