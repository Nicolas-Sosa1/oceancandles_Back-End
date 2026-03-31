import mongoose from "mongoose";

const productSchema = mongoose.Schema(
    {
        name:{
            type: String,
            required: [true, "Debe agregar el nombre del productoes q"]
        },
        description: { 
            type: String, 
            trim: true,
            required: [true, "La descripcion es obligatoria"] 
        },
        price: { 
            type: Number, 
            required: [true, "El precio es obligatorio"] 
        },
        category: { 
            type: String, 
            required: true,
            enum: ['velas', 'apagavelas', 'difusores'],
            lowercase: true
        },
        stock: { 
            type: Number, 
            default: 0 
        },
        images: [{ 
            type: String
        }],
        details: {
            scent: { type: String },   
            material: { type: String }, 
            size: { type: String },     
        }
    },{timestamps:true}
)


const Product  = mongoose.model("product", productSchema);

export { Product, productSchema };