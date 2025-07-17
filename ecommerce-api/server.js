import express from "express";
import dotenv from "dotenv";
import routes from './src/routes/index.js';
import dbConnection from './src/config/database.js';

dotenv.config(); // Poder utilizar el archivo ".env" e instalar su dependecia con "npm install dotenv"

const app = express();
dbConnection();
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome!!!')
});

app.get('/api', routes);

app.listen(process.env.PORT, () => {
    console.log(`Server running on http:localhost:${process.env.PORT}`);
});