import passport  from 'passport';
import express from 'express';
import path from 'path';
import session from 'express-session';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import {Server} from 'socket.io';
import authenticateRoutes from './routes/authenticate.mjs';
import taskRoutes from './routes/tasks.mjs'

const app = express();

app.use(session({secret: 'mySecret',
                resave: true,
                saveUninitialized: true}));

app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next){
	res.locals.user = req.user;
	next();
});

const server = createServer(app);
export const io = new Server(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));
io.on('connection', socket =>{
    console.log('a user connected');
})

app.use(taskRoutes);
app.use('/auth', authenticateRoutes);
console.log('listening on', process.env.PORT ?? 3000);
server.listen(process.env.PORT || 3000);

