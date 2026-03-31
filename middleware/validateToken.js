import jwt, { decode } from 'jsonwebtoken'

const SECRET= process.env.SECRET;



const validateToken = (req, res, next) => {
    const token = req.headers.token_user; 

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Token inválido" });
        }

        req.user = decoded; 
        next();
    });
};

export default validateToken;