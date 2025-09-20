const express = require('express');
const cors = require('cors');
const detectRoutes = require('./routes/detectRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/detect', detectRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
