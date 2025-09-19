import os
import sys
from datetime import datetime
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

# Add the parent directory to the Python path to import the main module
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from index import app  # noqa: E402

client = TestClient(app)


class TestContentCreation:
    """Test cases for content creation endpoints"""

    @pytest.fixture
    def mock_auth(self):
        """Mock authentication"""
        with patch("index.get_current_user") as mock:
            mock.return_value = {
                "id": "user-123",
                "email": "test@example.com",
                "role": "user",
            }
            yield mock

    @pytest.fixture(autouse=True)
    def setup_auth(self):
        """Auto-setup authentication for all tests"""
        with patch("index.get_current_user") as mock:
            mock.return_value = {
                "id": "user-123",
                "email": "test@example.com",
                "role": "user",
            }
            yield mock

    @pytest.fixture
    def sample_content_request(self):
        """Sample content request data"""
        return {
            "title": "Test Article",
            "content_type": "article",
            "topic": "AI in Business",
            "target_audience": "business professionals",
            "tone": "professional",
            "length": "medium",
            "keywords": ["AI", "business", "automation"],
            "client_id": "client-123",
            "metadata": {"priority": "high"},
        }

    @pytest.fixture
    def sample_template_request(self):
        """Sample template request data"""
        return {
            "name": "Business Article Template",
            "content_type": "article",
            "template_content": ("Template content with {variable1} and {variable2}"),
            "variables": ["variable1", "variable2"],
            "description": "Template for business articles",
            "client_id": "client-123",
        }

    def test_health_check(self):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "content-creation-service"
        assert "timestamp" in data

    @patch("index.generate_ai_content")
    @patch("index.save_content")
    def test_create_content_success(
        self, mock_save, mock_generate, mock_auth, sample_content_request
    ):
        """Test successful content creation"""
        # Mock AI content generation
        mock_generate.return_value = "Generated article content"
        mock_save.return_value = "content_123"

        response = client.post("/content", json=sample_content_request)

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == sample_content_request["title"]
        assert data["content_type"] == sample_content_request["content_type"]
        assert data["content"] == "Generated article content"
        assert data["status"] == "draft"
        assert data["client_id"] == sample_content_request["client_id"]

        # Verify mocks were called
        mock_generate.assert_called_once()
        mock_save.assert_called_once()

    def test_create_content_missing_fields(self, mock_auth):
        """Test content creation with missing required fields"""
        incomplete_request = {
            "title": "Test Article",
            "content_type": "article",
            # Missing required fields
        }

        response = client.post("/content", json=incomplete_request)
        assert response.status_code == 422  # Validation error

    def test_create_content_invalid_content_type(self, mock_auth):
        """Test content creation with invalid content type"""
        invalid_request = {
            "title": "Test Article",
            "content_type": "invalid_type",
            "topic": "AI in Business",
            "target_audience": "business professionals",
            "tone": "professional",
            "length": "medium",
            "client_id": "client-123",
        }

        response = client.post("/content", json=invalid_request)
        assert response.status_code == 422  # Validation error

    def test_create_content_invalid_tone(self, mock_auth):
        """Test content creation with invalid tone"""
        invalid_request = {
            "title": "Test Article",
            "content_type": "article",
            "topic": "AI in Business",
            "target_audience": "business professionals",
            "tone": "invalid_tone",
            "length": "medium",
            "client_id": "client-123",
        }

        response = client.post("/content", json=invalid_request)
        assert response.status_code == 422  # Validation error

    @patch("index.retrieve_content")
    def test_get_content_success(self, mock_retrieve, mock_auth):
        """Test successful content retrieval"""
        # Mock content retrieval
        mock_content = {
            "id": "content_123",
            "title": "Test Article",
            "content_type": "article",
            "topic": "AI in Business",
            "target_audience": "business professionals",
            "tone": "professional",
            "length": "medium",
            "content": "Generated content",
            "status": "draft",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "client_id": "client-123",
        }
        mock_retrieve.return_value = mock_content

        response = client.get("/content/content_123")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "content_123"
        assert data["title"] == "Test Article"

    @patch("index.retrieve_content")
    def test_get_content_not_found(self, mock_retrieve, mock_auth):
        """Test content retrieval when content not found"""
        mock_retrieve.return_value = None

        response = client.get("/content/nonexistent")

        assert response.status_code == 404
        data = response.json()
        assert data["detail"] == "Content not found"

    @patch("index.update_content_in_db")
    def test_update_content_success(self, mock_update, mock_auth):
        """Test successful content update"""
        # Mock content update
        updated_content = {
            "id": "content_123",
            "title": "Updated Article",
            "content_type": "article",
            "topic": "AI in Business",
            "target_audience": "business professionals",
            "tone": "professional",
            "length": "medium",
            "content": "Updated content",
            "status": "review",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "client_id": "client-123",
        }
        mock_update.return_value = updated_content

        update_request = {"title": "Updated Article", "status": "review"}

        response = client.put("/content/content_123", json=update_request)

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Article"
        assert data["status"] == "review"

    @patch("index.update_content_in_db")
    def test_update_content_not_found(self, mock_update, mock_auth):
        """Test content update when content not found"""
        mock_update.return_value = None

        update_request = {"title": "Updated Article"}

        response = client.put("/content/nonexistent", json=update_request)

        assert response.status_code == 404
        data = response.json()
        assert data["detail"] == "Content not found"

    @patch("index.list_content_from_db")
    def test_list_content_success(self, mock_list, mock_auth):
        """Test successful content listing"""
        # Mock content list
        mock_content_list = [
            {
                "id": "content_123",
                "title": "Test Article 1",
                "content_type": "article",
                "topic": "AI in Business",
                "target_audience": "business professionals",
                "tone": "professional",
                "length": "medium",
                "content": "Generated content 1",
                "status": "draft",
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
                "client_id": "client-123",
            },
            {
                "id": "content_124",
                "title": "Test Article 2",
                "content_type": "article",
                "topic": "AI in Business",
                "target_audience": "business professionals",
                "tone": "professional",
                "length": "medium",
                "content": "Generated content 2",
                "status": "published",
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
                "client_id": "client-123",
            },
        ]
        mock_list.return_value = mock_content_list

        response = client.get("/content?client_id=client-123")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["id"] == "content_123"
        assert data[1]["id"] == "content_124"

    def test_list_content_missing_client_id(self, mock_auth):
        """Test content listing without client_id"""
        response = client.get("/content")
        assert response.status_code == 422  # Validation error

    @patch("index.save_template")
    def test_create_template_success(
        self, mock_save, mock_auth, sample_template_request
    ):
        """Test successful template creation"""
        mock_save.return_value = "template_123"

        response = client.post("/templates", json=sample_template_request)

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == sample_template_request["name"]
        assert data["content_type"] == sample_template_request["content_type"]
        assert data["template_content"] == sample_template_request["template_content"]
        assert data["variables"] == sample_template_request["variables"]
        assert data["client_id"] == sample_template_request["client_id"]

        mock_save.assert_called_once()

    def test_create_template_missing_fields(self, mock_auth):
        """Test template creation with missing required fields"""
        incomplete_request = {
            "name": "Test Template",
            "content_type": "article",
            # Missing required fields
        }

        response = client.post("/templates", json=incomplete_request)
        assert response.status_code == 422  # Validation error

    @patch("index.list_templates_from_db")
    def test_list_templates_success(self, mock_list, mock_auth):
        """Test successful template listing"""
        # Mock template list
        mock_template_list = [
            {
                "id": "template_123",
                "name": "Business Article Template",
                "content_type": "article",
                "template_content": "Template content",
                "variables": ["variable1", "variable2"],
                "description": "Template for business articles",
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
                "client_id": "client-123",
            }
        ]
        mock_list.return_value = mock_template_list

        response = client.get("/templates?client_id=client-123")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["id"] == "template_123"
        assert data[0]["name"] == "Business Article Template"

    def test_list_templates_missing_client_id(self, mock_auth):
        """Test template listing without client_id"""
        response = client.get("/templates")
        assert response.status_code == 422  # Validation error

    def test_unauthorized_access(self):
        """Test access without authentication"""
        response = client.post(
            "/content",
            json={
                "title": "Test Article",
                "content_type": "article",
                "topic": "AI in Business",
                "target_audience": "business professionals",
                "tone": "professional",
                "length": "medium",
                "client_id": "client-123",
            },
        )

        assert response.status_code == 401
        data = response.json()
        assert data["detail"] == "Not authenticated"

    @patch("index.generate_ai_content")
    def test_ai_content_generation_error(
        self, mock_generate, mock_auth, sample_content_request
    ):
        """Test content creation when AI generation fails"""
        mock_generate.side_effect = Exception("AI service unavailable")

        response = client.post("/content", json=sample_content_request)

        assert response.status_code == 500
        data = response.json()
        assert data["detail"] == "Failed to create content"

    @patch("index.save_content")
    def test_database_save_error(self, mock_save, mock_auth, sample_content_request):
        """Test content creation when database save fails"""
        mock_save.side_effect = Exception("Database error")

        response = client.post("/content", json=sample_content_request)

        assert response.status_code == 500
        data = response.json()
        assert data["detail"] == "Failed to create content"
