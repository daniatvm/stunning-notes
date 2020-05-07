const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const passport = require('passport');
const path = require('path');
const methodOverride = require('method-override');
const flash = require('connect-flash');

//Initializations
require('dotenv').config();
const app = express();
//conectarse a una dirección de internet, este caso localhost y se le da el nombre de la bd
//si la bd no existe la crea, si existe entonces la agarra no prob
//se le manda un objeto de configuración es para el funcionamiento de la biblioteca
mongoose.connect(process.env.URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})
//promesa de mensaje por consola cuando se intente la conexión
    .then(db => console.log('DB is connected'))
    .catch(err=> console.error(err));
require('./config/passport');

//Settings
//configuración del puerto en el 3000, servicios de la nube pueden dar un puerto
//si existe un puerto seteado en mi computador que lo tome, sino use el 3000
app.set('port', process.env.PORT || 3000);
//views está dentro de src entonces hay que configurar esto
app.set('views', path.join(__dirname, 'views'));
//configurando express handlebars .hbs es el nombre de archivos de las vistas
//se le manda un objeto de configuración
app.engine('.hbs', exphbs({
    //saber de que manera se van a usar las vistas
    defaultLayout: 'main',
    LayoutsDir: path.join(app.get('views'), 'layouts'),
    partialDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs'
}));
//configura el motor de plantillas/vistas
app.set('view engine', '.hbs');

//Static Files
//archivos estáticos estarán en la carpeta public
app.use(express.static(path.join(__dirname, 'public')));


//Middlewares
//usuario manda un dato, se pueda entender
//extended false no se aceptan imágenes
app.use(express.urlencoded({ extended: true }));
//forms pueden usar otros métodos además de get y post, usen put delete
//a través de qué input nos envían otros métodos, se envía input oculto _method
app.use(methodOverride('_method'));
//permite autenticar el usuario y almacenar datos
app.use(session({
    store: new MongoStore({mongooseConnection: mongoose.connection}),
    secret: 'vitamin-cat',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
//dar mensajes de error o de éxito
app.use(flash());

//Global Variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.warning_msg = req.flash('warning_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

//Routes
app.use(require('./routes/index'));
app.use(require('./routes/notes'));
app.use(require('./routes/users'));

app.use(function (req, res) {
    res.status(404);
    res.send('404');
    // if (req.accepts('html')) {
    //   res.render('404', { url: req.url });
    //   return;
    // }
});

//Server is listening
//iniciar servidor
app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
});