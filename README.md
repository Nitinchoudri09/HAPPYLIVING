# Happy Living PG & Mess Management System

A comprehensive PG (Paying Guest) and Mess management system with integrated payment processing, user authentication, and administrative features.

## Features

- **User Management**: Student and Admin authentication
- **Payment Processing**: Integrated Razorpay payment gateway
- **Room Allocation**: Automated room assignment and management
- **Mess Subscription**: Silver, Gold, and Platinum meal plans
- **Dashboard Analytics**: Real-time statistics and reporting
- **Complaint System**: Maintenance request tracking
- **Attendance Tracking**: Daily attendance monitoring

## Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Font Awesome for icons
- Responsive design with mobile support

### Backend
- Node.js with Express.js
- JWT authentication
- Razorpay payment integration
- In-memory storage (easily upgradeable to MongoDB)

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pgmess
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Copy `.env` file and update the values:
   ```bash
   cp .env.example .env
   ```
   
   Update the following variables in `.env`:
   ```
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # JWT Secret
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   
   # Payment Gateway Configuration
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   
   # Email Configuration (optional)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   
   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:5500
   ```

4. **Start the backend server**
   ```bash
   # For development
   npm run dev
   
   # For production
   npm start
   ```

5. **Access the application**
   
   - Backend API: http://localhost:3000
   - Frontend: Open `index.html` in your browser or use a live server extension
   - API Documentation: http://localhost:3000/api/health

## Demo Accounts

### Student Login
- **Email**: student@example.com
- **Password**: student123

### Admin Login
- **Email**: admin@happylivingpg.com
- **Password**: admin123

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/forgot-password` - Forgot password
- `POST /api/v1/auth/reset-password` - Reset password

### Payments
- `POST /api/v1/payments/create-order` - Create payment order
- `POST /api/v1/payments/process` - Process payment
- `GET /api/v1/payments` - Get payment history
- `GET /api/v1/payments/:id` - Get payment details
- `POST /api/v1/payments/:id/refund` - Refund payment

### Users
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `GET /api/v1/users/allocation` - Get room allocation
- `GET /api/v1/users/mess-subscription` - Get mess subscription
- `PUT /api/v1/users/mess-subscription` - Update mess subscription
- `GET /api/v1/users/dashboard` - Get dashboard data

## Payment Integration

The system integrates with Razorpay for payment processing:

1. **Order Creation**: Frontend creates a payment order
2. **Payment Processing**: User completes payment via Razorpay
3. **Verification**: Backend verifies and records the transaction
4. **Receipt Generation**: Digital receipt is generated

### Razorpay Setup

1. Create a Razorpay account at [https://razorpay.com](https://razorpay.com)
2. Get your API keys from the Razorpay dashboard
3. Update the `.env` file with your credentials:
   ```
   RAZORPAY_KEY_ID=your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret
   ```

## Project Structure

```
pgmess/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables
├── routes/                # API routes
│   ├── auth.js           # Authentication routes
│   ├── payments.js       # Payment routes
│   └── users.js          # User management routes
├── js/                    # Frontend JavaScript
│   ├── auth-service.js   # Authentication service
│   ├── payment.js        # Payment service
│   └── main.js          # Main application logic
├── css/                   # Stylesheets
├── student/               # Student pages
├── admin/                 # Admin pages
└── index.html            # Landing page
```

## Development

### Running in Development Mode
```bash
npm run dev
```
This will start the server with nodemon for automatic restarts.

### Adding New Features

1. **Backend**: Add new routes in the `routes/` directory
2. **Frontend**: Update JavaScript files in the `js/` directory
3. **Styling**: Modify CSS files or add new stylesheets

### Database Integration

The current implementation uses in-memory storage for demo purposes. To integrate with a database:

1. Install MongoDB and Mongoose:
   ```bash
   npm install mongoose
   ```

2. Update the models and routes to use database operations

3. Configure MongoDB connection in `server.js`

## Security Features

- JWT-based authentication
- Rate limiting on API endpoints
- Helmet.js for security headers
- CORS configuration
- Input validation and sanitization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and queries, please contact the development team.

---

**Note**: This is a demonstration system. For production use, ensure proper security measures, database integration, and error handling.
