const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')
require('dotenv').config(); 

const candidateRoutes = require('./routes/candidateRoutes');
const commonRoutes = require('./routes/commonRoutes');

const app = express();
const PORT = 3000;

app.use(cors());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ Connection error:", err));

// Use routes
app.use('/candidates', candidateRoutes);
app.use('/',commonRoutes)

app.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
});
