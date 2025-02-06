# API reference

<!-- [swagger](http://petstore.swagger.io/v2/swagger.json) -->
<!-- [swagger](http://localhost:8081/api/swagger/json) -->




# Tracking

## Get all trackings

Overview

This API provides methods for managing trackings, including retrieving a list of trackings and creating new ones.

---

Authentication

All API requests must be authenticated using a Bearer Token.
```http
Authorization: Bearer {your_api_key}
```

---

Endpoints

**Description:** Returns a list of all trackings, with optional filtering by status.

- **URL:** `/trackings`
- **Method:** `GET`
- **Request Parameters:**

  | Name       | Type     | Required | Location | Description                  |
  |-----------|---------|---------|--------|--------------------------------|
  | `status`  | `array[string]` | No   | Query  | Tracking status |
  | `hasPaging` | `boolean` | No | Query | Enable pagination |
  | `page`    | `number` | No   | Query  | Page number, default is 1 |
  | `size`    | `number` | No   | Query  | Number of items per page, default is 10 |

- **Example Request:**
  ```http
  GET /api/v1.0.0/trackings?status=active&hasPaging=true&page=1&size=10 HTTP/1.1
  Host: api.example.com
  Authorization: Bearer your_api_key
  ```

- **Response Codes:**

  | Code | Description                         |
  |----|-------------------------------|
  | 200 | Successfully retrieved trackings |
  | 500 | Internal server error |

---

## Create a New Tracking

Overview

This API provides methods for managing trackings, including retrieving a list of trackings and creating new ones.

---

Authentication

All API requests must be authenticated using a Bearer Token.
```http
Authorization: Bearer {your_api_key}
```

---

Endpoints

**Description:** Creates a new tracking in the system.

- **URL:** `/trackings`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "field1": "value1",
    "field2": "value2"
  }
  ```
  *(Replace with `CreateTrackingRequestDto` structure)*

- **Example Request:**
  ```http
  POST /api/v1.0.0/trackings HTTP/1.1
  Host: api.example.com
  Authorization: Bearer your_api_key
  Content-Type: application/json

  {
    "field1": "value1",
    "field2": "value2"
  }
  ```

- **Response Codes:**

  | Code | Description                           |
  |----|---------------------------------|
  | 200 | Tracking created successfully |
  | 201 | New tracking created successfully |
  | 500 | Internal server error             |
