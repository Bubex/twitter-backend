const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const authConfig = require('../config/auth');

module.exports = {
    main: async function(req, res, next) {
        const authHeader = req.headers.authorization;

        if(!authHeader) {
            return res.json({ error: 'Token não encontrado.' });
        }

        const [, token] = authHeader.split(' ');

        try {
            const decoded = await promisify(jwt.verify)(token, authConfig.secret);

            req.userId = decoded.id;
            
            return next();
        } catch (err) {
            return res.json({ error: 'Token inválido.' });
        }
    }
}