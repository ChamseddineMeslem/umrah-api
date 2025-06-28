// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const agenciesRoutes = require('./routes/agencies');
const offersRoutes = require('./routes/offers');
const bookingsRoutes = require('./routes/bookings');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    'https://umrah-frontend-zqvr.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://127.0.0.1:5500'
  ],
  credentials: true
}));
app.use(express.json());


app.use('/api/agencies', agenciesRoutes);
app.use('/api/offers', offersRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);


// صفحة ترحيبية لتجربة الموقع
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Umrah API</title>
        <style>
          body { font-family: Tahoma, Arial, sans-serif; background: #f7f7f7; color: #222; text-align: center; padding-top: 60px; }
          .box { background: #fff; margin: auto; padding: 32px 24px; border-radius: 12px; box-shadow: 0 2px 12px #0001; display: inline-block; }
          h1 { color: #1a73e8; }
          p { margin: 16px 0 0 0; }
        </style>
      </head>
      <body>
        <div class="box">
          <h1>Umrah API 🚀</h1>
          <p>الخادم يعمل بنجاح!<br>يمكنك الآن تجربة نقاط الـ API.</p>
          <p style="margin-top:20px;font-size:14px;color:#888;">&copy; 2025</p>
        </div>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
