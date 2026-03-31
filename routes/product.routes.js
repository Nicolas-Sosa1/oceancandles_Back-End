import { Router } from "express";
import multer from 'multer'; 
import productController from "../controllers/product.controller.js";
import isAdmin from '../middleware/validateAdmin.js';
import validateToken from '../middleware/validateToken.js';


const upload = multer({ storage: multer.memoryStorage() });

const productsRoutes = Router();


productsRoutes.get('/all', productController.getAllProduct);
productsRoutes.get('/category/velas', productController.getVelas);
productsRoutes.get('/category/difusores', productController.getDifusores);
productsRoutes.get('/category/apagavelas', productController.getApagavelas);
productsRoutes.post('/new', validateToken, isAdmin, upload.single('image'), productController.createOneProduct);
productsRoutes.get('/:id', validateToken, productController.getOneProduct);
productsRoutes.delete('/destroy/:id',validateToken, isAdmin, productController.deleteOneProduct);
productsRoutes.put('/update/:id', validateToken, isAdmin, upload.single('image'),productController.updateOneProduct);

export default productsRoutes;