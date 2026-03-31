import { User } from '../models/users.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const SECRET = process.env.SECRET;

const userController = {

    googleLogin: async (req, res) => {
        try {
            const { access_token } = req.body;

            const googleResponse = await axios.get(
                `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
            );
            
            const { email } = googleResponse.data;
            let user = await User.findOne({ email });

            if (!user) {
                return res.status(404).json({ 
                    message: "Usuario no encontrado", 
                    code: "USER_NOT_FOUND",
                    email: email 
                });
            }

            const token_user = jwt.sign({ id: user._id, email: user.email }, SECRET, { expiresIn: "1h" });

            return res.json({ 
                user: {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role
                }, 
                token: token_user 
            });

        } catch (error) {
            return res.status(400).json({ 
                message: "Error en validación de Google", 
                detail: error.response?.data || error.message 
            });
        }
    },

    googleRegister: async (req, res) => {
        try {
            const { access_token } = req.body;

            const googleResponse = await axios.get(
                `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
            );
            
            const { email, given_name, family_name } = googleResponse.data;
            let user = await User.findOne({ email });

            if (user) {
                return res.status(400).json({ message: "El usuario ya existe, por favor inicia sesión." });
            }

            const tempPassword = "GoogleAuthUser123!"; 
            
            user = await User.create({
                firstName: given_name,
                lastName: family_name,
                email: email,
                password: tempPassword,
                passwordConfirmation: tempPassword,
                role: false 
            });

            const token_user = jwt.sign({ id: user._id, email: user.email }, SECRET, { expiresIn: "1h" });

            return res.status(201).json({ 
                user: {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role || false 
                }, 
                token: token_user 
            });

        } catch (error) {
            return res.status(400).json({ message: "Error al registrar con Google" });
        }
    },


    createOne: async (req, res) => {
        const { firstName, lastName, email, password, passwordConfirmation } = req.body;

        try {
            const newUser = await User.create({ firstName, lastName, email, password, passwordConfirmation });

            const saveToken = { id: newUser._id, email: newUser.email };
            
            jwt.sign(saveToken, SECRET, { expiresIn: "1h" }, (err, token) => {
                return res.status(201).json({
                    token,
                    user: {
                        _id: newUser._id,
                        firstName: newUser.firstName,
                        lastName: newUser.lastName,
                        email: newUser.email,
                        role: newUser.role
                    }
                });
            });

        } catch (e) {
            const messages = {};
            if (e.name === "ValidationError") {
                Object.keys(e.errors).forEach((key) => {
                    messages[key] = e.errors[key].message;
                });
            }
            if (e.code === 11000) {
                messages.email = "El correo ya está registrado";
            }           
            return res.status(400).json({ errors: messages });
        }
    },

    login: async (req, res) => {
        const { email, password } = req.body;
        const errors = {};

        if (!email) errors.email = "El correo es obligatorio";
        if (!password) errors.password = "La contraseña es obligatoria";

        if (Object.keys(errors).length > 0) return res.status(400).json({ errors });
        
        try {
            const currentUser = await User.findOne({ email });
            if (!currentUser) {
                return res.status(404).json({ errors: { email: "El correo no está registrado" } });
            }

            const bcryptResponse = await bcrypt.compare(password, currentUser.password);
            if (!bcryptResponse) {
                return res.status(400).json({ errors: { password: "La contraseña es incorrecta" } });
            }

            const saveToken = { id: currentUser._id, email: currentUser.email };

            jwt.sign(saveToken, SECRET, { expiresIn: "1h" }, (err, token) => {
                return res.status(200).json({
                    token,
                    user: {
                        _id: currentUser._id,
                        firstName: currentUser.firstName,
                        lastName: currentUser.lastName,
                        email: currentUser.email,
                        role: currentUser.role
                    }
                });
            });
        } catch (error) {
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    }
};

export default userController;