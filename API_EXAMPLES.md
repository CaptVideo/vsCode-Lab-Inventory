# Lab Inventory Management System - API Examples

## Base URL
```
http://localhost:5000/api
```

## Authentication Endpoints

### Register User
```bash
POST /auth/register
Content-Type: application/json

{
  "username": "john_lab",
  "email": "john@lab.com",
  "password": "securepwd123",
  "confirm_password": "securepwd123"
}

Response:
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "username": "john_lab",
    "email": "john@lab.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "username": "john_lab",
  "password": "securepwd123"
}

Response:
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "john_lab",
    "email": "john@lab.com",
    "role": "staff"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Inventory Endpoints

### Get All Items
```bash
GET /inventory
Authorization: Bearer <token>

Response:
[
  {
    "id": 1,
    "name": "PBS Solution",
    "item_type": "Reagent",
    "quantity": 50,
    "unit_of_measure": "ml",
    "manufacturer": "Sigma-Aldrich",
    "catalog_number": "PBS-001",
    "location_name": "Lab A - Cabinet 1",
    "expiration_date": "2025-12-31",
    "created_at": "2025-03-05T10:30:00.000Z"
  }
]
```

### Create Item
```bash
POST /inventory
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "PBS Solution",
  "item_type": "Reagent",
  "description": "Phosphate Buffered Saline",
  "manufacturer": "Sigma-Aldrich",
  "catalog_number": "PBS-001",
  "quantity": 50,
  "unit_of_measure": "ml",
  "min_threshold": 10,
  "max_threshold": 100,
  "expiration_date": "2025-12-31",
  "location_id": 1,
  "cost_per_unit": 25.50
}
```

### Get Single Item
```bash
GET /inventory/1
Authorization: Bearer <token>

Response: Single item object
```

### Update Item
```bash
PUT /inventory/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 45,
  "location_id": 2
}
```

### Adjust Quantity
```bash
POST /inventory/1/adjust
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity_change": -5,
  "notes": "Used in experiment ABC"
}
```

### Delete Item
```bash
DELETE /inventory/1
Authorization: Bearer <token>
```

### Get Low Stock Items
```bash
GET /inventory/alerts/low-stock
Authorization: Bearer <token>
```

### Get Expiring Items
```bash
GET /inventory/alerts/expiring?days=30
Authorization: Bearer <token>
```

### Get Item History
```bash
GET /inventory/1/logs
Authorization: Bearer <token>

Response:
[
  {
    "id": 1,
    "item_id": 1,
    "action": "quantity_updated",
    "quantity_changed": -5,
    "previous_quantity": 50,
    "new_quantity": 45,
    "notes": "Used in experiment ABC",
    "username": "john_lab",
    "created_at": "2025-03-05T11:15:00.000Z"
  }
]
```

## Storage Location Endpoints

### Get All Locations
```bash
GET /locations
Authorization: Bearer <token>

Response:
[
  {
    "id": 1,
    "name": "Lab A - Cabinet 1",
    "building": "Science Building",
    "floor": "2",
    "room": "Lab 201",
    "cabinet": "Cabinet A",
    "shelf": "Shelf 3",
    "temperature_requirement": "Room Temperature",
    "item_count": 12,
    "created_at": "2025-03-01T08:00:00.000Z"
  }
]
```

### Create Location
```bash
POST /locations
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Freezer Room - Cabinet 2",
  "building": "Science Building",
  "floor": "1",
  "room": "Lab 105",
  "cabinet": "Cabinet B",
  "shelf": "Shelf 1",
  "temperature_requirement": "-20°C",
  "description": "Main freezer for long-term storage"
}
```

### Update Location
```bash
PUT /locations/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "temperature_requirement": "4°C",
  "shelf": "Shelf 2"
}
```

### Delete Location
```bash
DELETE /locations/1
Authorization: Bearer <token>
```

## Reports Endpoints

### Get Summary
```bash
GET /reports/summary
Authorization: Bearer <token>

Response:
{
  "total_items": 45,
  "total_quantity": 1250,
  "low_stock_count": 3,
  "expiring_count": 2,
  "item_types": 8,
  "total_value": 15750.50
}
```

### Get Items by Type
```bash
GET /reports/by-type
Authorization: Bearer <token>

Response:
[
  {
    "type": "Reagent",
    "count": 25,
    "quantity": 850,
    "value": 12500.00
  },
  {
    "type": "Equipment",
    "count": 10,
    "quantity": 150,
    "value": 3250.50
  }
]
```

### Get Location Utilization
```bash
GET /reports/location-utilization
Authorization: Bearer <token>

Response:
[
  {
    "location": "Lab A - Cabinet 1",
    "item_count": 12,
    "total_quantity": 250
  },
  {
    "location": "Freezer Room",
    "item_count": 8,
    "total_quantity": 500
  }
]
```

### Get Activity Log
```bash
GET /reports/activity?limit=100
Authorization: Bearer <token>

Response:
[
  {
    "id": 1,
    "item_name": "PBS Solution",
    "action": "quantity_updated",
    "quantity_changed": -5,
    "previous_quantity": 50,
    "new_quantity": 45,
    "username": "john_lab",
    "created_at": "2025-03-05T11:15:00.000Z"
  }
]
```

## Using with cURL

### Register Example
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "lab_tech",
    "email": "tech@lab.com",
    "password": "pass123",
    "confirm_password": "pass123"
  }'
```

### Get Inventory with Token
```bash
curl -X GET http://localhost:5000/api/inventory \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Using Postman

1. Create new collection "Lab Inventory"
2. Set base URL: `http://localhost:5000/api`
3. Add authorization header: `Authorization: Bearer <token>`
4. Import requests from examples above
5. Test each endpoint

## Status Codes

- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Common Error Responses

```json
{
  "error": "All fields are required"
}
```

```json
{
  "error": "Invalid credentials"
}
```

```json
{
  "error": "Item not found"
}
```
