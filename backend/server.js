const express = require('express');
const dbConnect = require('./database/index')
const {PORT} = require('./config/index');
const router = require('./routes/index')
const errorHandler = require('./middlewares/errorHandler')
const cookieParser = require('cookie-parser')
const session = require('express-session');
const cors = require('cors');
const passport = require('./middlewares/googleOauth')

const app = express();
app.use(cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(cookieParser());
app.use(session({ secret: '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', resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(router);
dbConnect();

app.use(errorHandler);
app.get('/',(req, res) => res.json({msg:'hello world'}))
app.listen(PORT, () =>console.log(`Backend is running on port ${PORT}`));