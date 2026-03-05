# Clinical Laboratory Inventory Management System

A comprehensive JavaScript-based inventory management application designed for clinical laboratories. Track reagents, samples, equipment, stock levels, expiration dates, and storage locations.

## Features

- **User Authentication**: Secure login and registration system
- **Inventory Management**: 
  - Add, edit, and delete inventory items
  - Track quantity, manufacturer, catalog numbers
  - Set min/max thresholds for automatic low-stock alerts
  - Manage expiration dates
- **Storage Locations**: 
  - Define storage locations with detailed information (building, floor, room, cabinet, shelf)
  - Track temperature requirements
  - View item count per location
- **Smart Alerts**:
  - Low stock notifications
  - Expiration date warnings (configurable days ahead)
- **Dashboard**:
  - Real-time inventory metrics
  - Quick view of critical alerts
  - Summary statistics
- **Reports**:
  - Inventory by type analysis
  - Location utilization reports
  - Activity logs
  - Cost tracking

## Project Structure

```
.
├── backend/
│   ├── server.js                 # Express server entry point
│   ├── database/
│   │   └── db.js                # SQLite database initialization
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── InventoryItem.js     # Inventory item model
│   │   ├── StorageLocation.js   # Storage location model
│   │   └── InventoryLog.js      # Activity log model
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── inventory.js         # Inventory management routes
│   │   ├── locations.js         # Storage location routes
│   │   └── reports.js           # Report routes
│   └── middleware/
│       └── auth.js              # JWT authentication middleware
├── frontend/
│   ├── index.html               # Main HTML file
│   ├── css/
│   │   └── styles.css           # Global styles
│   └── js/
│       └── app.js               # Frontend logic
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create environment file** (optional):
   Create a `.env` file in the root directory:
   ```
   PORT=5000
   JWT_SECRET=your_secret_key_here
   ```

3. **Start the server**:
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   Open your browser and navigate to `http://localhost:5000`

## Usage

### First Login
1. Click on **Register** to create a new account
2. Enter username, email, and password
3. Click **Register** to create account
4. You'll be logged in automatically

### Adding Inventory Items
1. Click **Inventory** in the navigation menu
2. Click **+ Add Item** button
3. Fill in the required fields:
   - Name (required)
   - Type (required) - e.g., Reagent, Sample, Equipment
   - Quantity (required)
   - Unit of Measure (required) - e.g., ml, units, boxes
4. Optionally set:
   - Manufacturer
   - Catalog Number
   - Min/Max thresholds (for alerts)
   - Expiration date
   - Storage location
5. Click **Save Item**

### Managing Storage Locations
1. Click **Locations** in navigation
2. Click **+ Add Location** to create new storage area
3. Define location details:
   - Location name (required)
   - Building, floor, room, cabinet, shelf
   - Temperature requirements
4. Click **Save Location**

### Monitoring Alerts
- The **Dashboard** shows:
  - Low stock items (quantity below min threshold)
  - Items expiring in the next 30 days
  - Quick metrics about inventory

### Generating Reports
1. Click **Reports** in navigation
2. View inventory breakdown by type
3. See location utilization statistics

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Inventory
- `GET /api/inventory` - Get all items (with filters)
- `GET /api/inventory/:id` - Get single item
- `POST /api/inventory` - Create item
- `PUT /api/inventory/:id` - Update item
- `DELETE /api/inventory/:id` - Delete item
- `POST /api/inventory/:id/adjust` - Adjust quantity
- `GET /api/inventory/alerts/low-stock` - Get low stock items
- `GET /api/inventory/alerts/expiring` - Get expiring items

### Locations
- `GET /api/locations` - Get all locations
- `GET /api/locations/:id` - Get single location
- `POST /api/locations` - Create location
- `PUT /api/locations/:id` - Update location
- `DELETE /api/locations/:id` - Delete location

### Reports
- `GET /api/reports/summary` - Get inventory summary
- `GET /api/reports/by-type` - Get breakdown by type
- `GET /api/reports/location-utilization` - Get location stats
- `GET /api/reports/activity` - Get activity logs

## Database Schema

### Users Table
- `id` (integer, primary key)
- `username` (text, unique)
- `email` (text, unique)
- `password` (text, hashed)
- `role` (text) - default: 'staff'
- `created_at` (datetime)

### Inventory Items Table
- `id` (integer, primary key)
- `name` (text)
- `item_type` (text)
- `quantity` (integer)
- `unit_of_measure` (text)
- `manufacturer` (text)
- `catalog_number` (text)
- `expiration_date` (date)
- `location_id` (foreign key)
- `min_threshold` (integer)
- `max_threshold` (integer)
- `cost_per_unit` (real)
- `created_at`, `updated_at` (datetime)

### Storage Locations Table
- `id` (integer, primary key)
- `name` (text, unique)
- `building` (text)
- `floor` (text)
- `room` (text)
- `cabinet` (text)
- `shelf` (text)
- `temperature_requirement` (text)
- `created_at` (datetime)

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Authentication**: JWT (JSON Web Tokens), bcryptjs
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **API**: RESTful API

## Future Enhancements

- [ ] User roles and permissions (Admin, Manager, Staff)
- [ ] Barcode/QR code scanning
- [ ] Mobile app (React Native, Flutter)
- [ ] Email notifications for alerts
- [ ] Batch import/export functionality
- [ ] Advanced search and filtering
- [ ] Audit trail with detailed change history
- [ ] Multi-site support
- [ ] Integration with lab information systems (LIS)
- [ ] Historical data analytics

## Troubleshooting

**Cannot connect to database**
- Ensure `backend/database/labinventory.db` has write permissions
- Check that Node.js has access to create/write files

**CORS errors**
- Ensure the backend is running on `http://localhost:5000`
- Check that frontend requests use the correct API_URL

**Authentication issues**
- Clear browser localStorage if having login problems: `localStorage.clear()`
- Ensure JWT_SECRET is consistent between sessions

## License

ISC

## Support

For issues or questions, please create an issue in the repository.
