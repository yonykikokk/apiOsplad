//Authorization: Bearer <token>
const verifyToken = (req, res, next) => {
    const { authorization } = req.headers;
    if (typeof authorization == 'undefined') {
        res.status(401).json({
            error: 'Acceso restringido',
            mensaje: 'Inicie sesion para obtener un token.'
        });
    }

    const token = authorization.split(' ')[1];
    req.token = token;
    next();

}

exports.verifyToken = verifyToken;