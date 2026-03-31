import {Router} from "express"
import userController from "../controllers/users.controller.js"

const usersRoutes = Router();

usersRoutes.post('/register', userController.createOne);
usersRoutes.post('/login', userController.login);
usersRoutes.post("/google-login", userController.googleLogin);
usersRoutes.post("/google-register", userController.googleRegister);

export default usersRoutes
