import { Product } from "../models/product.model.js";
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

const productController = {

    getAllProduct: async (req, res) => {
        try {
            const products = await Product.find().sort({ name: 1 });
            res.status(200).json(products);
        } catch (e) {
            console.error("Error al obtener productos:", e.message);
            res.status(500).json({ message: "Error al obtener productos" });
        }
    },
    createOneProduct: async (req, res) => {
        try {
            let imageUrl = "";

            if (req.file) {
                imageUrl = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { 
                            folder: "oceancandles",
                            resource_type: "image" 
                        },
                        (error, result) => {
                            if (result) resolve(result.secure_url);
                            else reject(error);
                        }
                    );

                    streamifier.createReadStream(req.file.buffer).pipe(stream);
                });
            }

            const productData = {
                ...req.body,
                images: imageUrl ? [imageUrl] : [] 
            };

            const newProduct = await Product.create(productData);
            return res.status(201).json(newProduct);

        } catch (e) {
            console.error("Error al crear producto:", e.message);

            const messages = {};
            if (e.name === "ValidationError") {
                Object.keys(e.errors).forEach(key => {
                    messages[key] = e.errors[key].message;
                });
                return res.status(400).json({ errors: messages });
            }

            return res.status(500).json({ message: "Error interno del servidor", error: e.message });
        }
    },
    deleteOneProduct: async (req, res) => {
        try {
            const deleted = await Product.findByIdAndDelete(req.params.id);

            if (!deleted) {
                return res.status(404).json({ message: "Producto no encontrado" });
            }

            res.status(200).json({ message: "Producto eliminadp correctamente" });
        } catch (e) {
            console.error("Error el eliminar Producto:", e.message);
            res.status(500).json({ message: "Error al eliminar el Producto" });
        }
    },
    getOneProduct: async (req, res) => {
        try {
            const product = await Product.findById(req.params.id);

            if (!product) {
                return res.status(404).json({ message: "Producto no encontrado" });
            }

            res.status(200).json(product);

        } catch (e) {
            console.error("Error al obtener el producto:", e.message);

            if (e.name === "CastError") {
                return res.status(400).json({ message: "El ID proporcionado no tiene un formato válido" });
            }

            res.status(500).json({ message: "Error interno del servidor" });
        }
    },
    updateOneProduct: async (req, res) => {
        try {
            let updateData = { ...req.body };

            if (req.file) {
                const imageUrl = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { 
                            folder: "oceancandles", 
                            resource_type: "image" 
                        },
                        (error, result) => {
                            if (result) resolve(result.secure_url);
                            else reject(error);
                        }
                    );
                    streamifier.createReadStream(req.file.buffer).pipe(stream);
                });

                updateData.images = [imageUrl];
            }

            const updatedProduct = await Product.findByIdAndUpdate(
                req.params.id, 
                updateData, 
                { new: true, runValidators: true }
            );

            if (!updatedProduct) {
                return res.status(404).json({ message: "Producto no encontrado" });
            }

            res.status(200).json(updatedProduct);

        } catch (e) {
            console.error("Error al actualizar:", e.message);
            
            if (e.name === "ValidationError") {
                const messages = {};
                Object.keys(e.errors).forEach(key => {
                    messages[key] = e.errors[key].message;
                });
                return res.status(400).json({ errors: messages });
            }

            res.status(500).json({ message: "Error al actualizar datos", error: e.message });
        }
    },
    getVelas: async (req, res) => {
        try {
            const velas = await Product.find({ category: 'velas' }).sort({ name: 1 });
            res.status(200).json(velas);
        } catch (e) {
            console.error("Error al obtener velas:", e.message);
            res.status(500).json({ message: "Error al obtener las velas" });
        }
    },

    getApagavelas: async (req, res) => {
        try {
            const apagavelas = await Product.find({ category: 'apagavelas' }).sort({ name: 1 });
            res.status(200).json(apagavelas);
        } catch (e) {
            console.error("Error al obtener apagavelas:", e.message);
            res.status(500).json({ message: "Error al obtener los apagavelas" });
        }
    },

    getDifusores: async (req, res) => {
        try {
            const difusores = await Product.find({ category: 'difusores' }).sort({ name: 1 });
            res.status(200).json(difusores);
        } catch (e) {
            console.error("Error al obtener difusores:", e.message);
            res.status(500).json({ message: "Error al obtener los difusores" });
        }
    },
    
};

export default productController;