const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const routes = require('./routes');
app.use('/api', routes);

app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'An internal error occurred' });
});

module.exports = app;
