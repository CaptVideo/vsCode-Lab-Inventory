# Clinical Laboratory Inventory Management System - Quick Start Guide

## ⚡ Quick Start (2 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```
Or use Ctrl+Shift+B in VS Code to run the default task.

### 3. Open in Browser
Go to: **http://localhost:5000**

### 4. Create Account
- Click **Register**
- Enter username, email, password
- Click **Register**

### 5. Start Using
- Add inventory items
- Create storage locations
- Monitor alerts
- View reports

## 📁 Project Structure at a Glance

```
backend/              → Express REST API
├── server.js        → Main server file
├── models/          → Data models (User, InventoryItem, etc.)
├── routes/          → API routes
├── middleware/      → Authentication
└── database/        → SQLite database

frontend/            → Web Interface
├── index.html       → Main page
├── css/styles.css   → Styling
└── js/app.js        → Client-side logic
```

## 🔑 Key Features

✅ User authentication with JWT  
✅ Inventory tracking with low-stock alerts  
✅ Expiration date warnings  
✅ Storage location management  
✅ Real-time dashboard  
✅ Report generation  

## 📊 Default Test Data

The app starts with an empty database. You can:
1. Create your first user account
2. Add storage locations
3. Add inventory items

## 🛠 Development Commands

```bash
npm start              # Start server (production mode)
npm run dev          # Start with auto-reload (requires nodemon)
npm install          # Install dependencies
```

## 🌐 API Base URL

All API requests go to: `http://localhost:5000/api`

Example: 
- Login: `POST http://localhost:5000/api/auth/login`
- Get Items: `GET http://localhost:5000/api/inventory`

## 📝 First Test Workflow

1. **Register account** → Login  
2. **Add Location** → Click "Locations" → "Add Location"  
3. **Add Item** → Click "Inventory" → "Add Item"  
4. **Check Dashboard** → See metrics and alerts  
5. **View Reports** → Click "Reports"  

## ❓ Troubleshooting

**Port 5000 already in use?**
```bash
Get-Process node | Stop-Process -Force    # Windows PowerShell
killall node                                # Mac/Linux
```

**Database not creating?**
- Check write permissions on `backend/database/` folder

**npm command not working?**
- On Windows: Run PowerShell as Administrator

## 📚 Learn More

- Full documentation: See [README.md](./README.md)
- API reference: See [README.md#API-Endpoints](./README.md#api-endpoints)

## 🎯 Next Steps

1. Customize the app for your laboratory's needs
2. Add more fields to inventory items
3. Set up email notifications for alerts
4. Deploy to production using a proper server
