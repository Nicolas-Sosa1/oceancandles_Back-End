import { User } from "../models/users.model.js";

const isAdmin = async (req, res, next) => {
    try {

        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Usuario no identificado en el token" });
        }
        const userFound = await User.findById(req.user.id); 
        
        if (userFound && userFound.role === true) {
            next(); 
        } else {
            return res.status(403).json({ message: "Acceso denegado: Se requieren permisos de administrador" });
        }
    } catch (error) {
        console.error("Error en isAdmin:", error);
        res.status(500).json({ message: "Error al verificar permisos" });
    }
};

export default isAdmin