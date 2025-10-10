# Qylon Production Process File
# Defines the process types for DigitalOcean App Platform

# API Gateway Service (Node.js)
api-gateway: cd services/api-gateway && npm start

# Meeting Intelligence Service (Node.js)
meeting-intelligence: cd services/meeting-intelligence && npm start

# Workflow Automation Service (Node.js)
workflow-automation: cd services/workflow-automation && npm start

# Integration Management Service (Python)
integration-management: cd services/integration_management && python -m uvicorn app.main:app --host 0.0.0.0 --port 3006

# Content Creation Service (Python)
content-creation: cd services/content-creation && python -m uvicorn src.index:app --host 0.0.0.0 --port 3004

# Frontend Service (Static Site)
frontend: cd frontend && npm run preview

# Default process (API Gateway)
web: cd services/api-gateway && npm start
