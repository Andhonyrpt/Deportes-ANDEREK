import mongoose from "mongoose";
import dotenv from 'dotenv';
import Category from "../models/category.js";
import SubCategory from "../models/subCategory.js";
import Product from "../models/product.js";

dotenv.config();
async function seed() {
    const dbURI = process.env.MONGODB_URI;

    await mongoose.connect(dbURI, {});

    const mainCategories = [
        { name: "LaLiga", description: "Equipos de la Primera División de España" },
        { name: "Selecciones", description: "Jerseys de Selecciones de Fútbol" },
        { name: "Premier League", description: "Equipos de la Primera División de Inglaterra" },
        { name: "Bundesliga", description: "Equipos de la Primera División de Alemania" },
        { name: "Serie A", description: "Equipos de la Primera División de Italia" },
        { name: "Liga MX", description: "Equipos de la Primera División de México" },
        { name: "Ligue 1", description: "Equipos de la Primera División de Francia" }
    ];

    const subCategories = [
        { name: "Real Madrid", description: "Jerseys del Real Madrid", parent: "LaLiga" },
        { name: "Barcelona", description: "Jerseys del Barcelona", parent: "LaLiga" },
        { name: "Selección Nacional de México", description: "Jerseys de la Selección Nacional de México", parent: "Selecciones" },
        { name: "Manchester United", description: "Jerseys del Manchester United", parent: "Premier League" },
        { name: "Liverpool", description: "Jerseys del Liverpool", parent: "Premier League" },
        { name: "Bayern Munich", description: "Jerseys del Bayern Munich", parent: "Bundesliga" },
        { name: "Juventus", description: "Jerseys del Juventus", parent: "Serie A" },
        { name: "América", description: "Jerseys del América", parent: "Liga MX" },
        { name: "Chivas", description: "Jerseys del Chivas", parent: "Liga MX" },
        { name: "PSG", description: "Jerseys del Paris Saint-Germain", parent: "Ligue 1" },
        { name: "Selección de Argentina", description: "Jerseys de la Selección de Argentina", parent: "Selecciones" },
        { name: "Inter de Milán", description: "Jerseys del Inter de Milán", parent: "Serie A" }
    ];

    // Limpiar las colecciones antes de insertar nuevos datos
    await Category.deleteMany({});
    await SubCategory.deleteMany({});
    await Product.deleteMany({});

    // Insertar categorías principales 
    const categoriesDocs = {};
    for (const cat of mainCategories) {
        const category = new Category(cat);
        await category.save();
        categoriesDocs[cat.name] = category;
    }

    // Insertar subcategorías
    const subCatDocs = {};
    for (const sub of subCategories) {
        const parent = categoriesDocs[sub.parent];
        const subCat = new SubCategory({
            name: sub.name,
            description: sub.description,
            imageURL: "https://placehold.co/800x600.png",
            parentCategory: parent._id
        });
        await subCat.save();
        subCatDocs[sub.name] = subCat;
    }

    //Insertar productos de ejemplo
    const productsData = [
        {
            name: "Jersey Real Madrid Local 2024",
            description: "Camiseta oficial del Real Madrid temporada 2024. Diseño clásico blanco con detalles dorados.",
            modelo: "Local", // Enum: 'Local', 'Visitante'
            variants: [ // Tu schema variantSchema: { size, stock }
                { size: 'S', stock: 10 },
                { size: 'M', stock: 15 },
                { size: 'L', stock: 5 },
                { size: 'XL', stock: 2 }
            ],
            genre: "Hombre", // Enum: 'Hombre', 'Mujer', 'Niño'
            price: 1299,
            imagesUrl: ['/img/products/real-madrid-white-home-jersey.jpg', '/img/products/real-madrid-jersey-detail.jpg'],
            category: subCatDocs["Real Madrid"]._id
        },
        {
            name: "Jersey Barcelona Local 2024",
            description: "Camiseta local del FC Barcelona. Diseño blaugrana tradicional con rayas azules y rojas.",
            modelo: "Local", // Enum: 'Local', 'Visitante'
            variants: [ // Tu schema variantSchema: { size, stock }
                { size: 'S', stock: 10 },
                { size: 'M', stock: 15 },
                { size: 'L', stock: 5 },
                { size: 'XL', stock: 2 }
            ],
            genre: "Hombre", // Enum: 'Hombre', 'Mujer', 'Niño'
            price: 1349,
            imagesUrl: ["/img/products/barcelona-blaugrana-home-jersey.jpg", '/img/products/barcelona-jersey-back.jpg'],
            category: subCatDocs["Barcelona"]._id
        },
        {
            name: "Jersey Seleccion de México 2024",
            description: "Camiseta oficial de la Selección Mexicana. Verde tradicional con diseño moderno.",
            modelo: "Local", // Enum: 'Local', 'Visitante'
            variants: [ // Tu schema variantSchema: { size, stock }
                { size: 'S', stock: 10 },
                { size: 'M', stock: 15 },
                { size: 'L', stock: 5 },
                { size: 'XL', stock: 2 }
            ],
            genre: "Hombre", // Enum: 'Hombre', 'Mujer', 'Niño'
            price: 1199,
            imagesUrl: ["/img/products/mexico-national-team-green-jersey.jpg", '/img/products/mexico-jersey-back.jpg'],
            category: subCatDocs["Selección Nacional de México"]._id
        },
        {
            name: "Jersey Manchester United Local 2024",
            description: "Camiseta del Manchester United. Rojo característico con detalles negros.",
            modelo: "Local", // Enum: 'Local', 'Visitante'
            variants: [ // Tu schema variantSchema: { size, stock }
                { size: 'S', stock: 10 },
                { size: 'M', stock: 15 },
                { size: 'L', stock: 5 },
                { size: 'XL', stock: 2 }
            ],
            genre: "Hombre", // Enum: 'Hombre', 'Mujer', 'Niño'
            price: 1249,
            imagesUrl: ["/img/products/manchester-united-red-home-jersey.jpg", '/img/products/manchester-united-jersey-back.jpg'],
            category: subCatDocs["Manchester United"]._id
        },
        {
            name: "Jersey Liverpool Visitante 2024",
            description: "Camiseta visitante del Liverpool FC. Diseño menta elegante y moderno.",
            modelo: "Visitante", // Enum: 'Local', 'Visitante'
            variants: [ // Tu schema variantSchema: { size, stock }
                { size: 'S', stock: 10 },
                { size: 'M', stock: 15 },
                { size: 'L', stock: 5 },
                { size: 'XL', stock: 2 }
            ],
            genre: "Hombre", // Enum: 'Hombre', 'Mujer', 'Niño'
            price: 1199,
            imagesUrl: ["/img/products/liverpool-mint-away-jersey.jpg", '/img/products/liverpool-away-jersey-back.jpg'],
            category: subCatDocs["Liverpool"]._id
        },
        {
            name: "Jersey Bayern Munich Local 2024",
            description: "Camiseta del Bayern Munich. Rojo intenso con detalles blancos y dorados.",
            modelo: "Local", // Enum: 'Local', 'Visitante'
            variants: [ // Tu schema variantSchema: { size, stock }
                { size: 'S', stock: 10 },
                { size: 'M', stock: 15 },
                { size: 'L', stock: 5 },
                { size: 'XL', stock: 2 }
            ],
            genre: "Hombre", // Enum: 'Hombre', 'Mujer', 'Niño'
            price: 1249,
            imagesUrl: ["/img/products/bayern-munich-red-home-jersey.jpg", '/img/products/bayern-munich-jersey-detail.jpg'],
            category: subCatDocs["Bayern Munich"]._id
        },
        {
            name: "Jersey Juventus Local 2024",
            description: "Camiseta de la Juventus. Rayas blancas y negras icónicas.",
            modelo: "Local", // Enum: 'Local', 'Visitante'
            variants: [ // Tu schema variantSchema: { size, stock }
                { size: 'S', stock: 10 },
                { size: 'M', stock: 15 },
                { size: 'L', stock: 5 },
                { size: 'XL', stock: 2 }
            ],
            genre: "Hombre", // Enum: 'Hombre', 'Mujer', 'Niño'
            price: 1299,
            imagesUrl: ["/img/products/juventus-striped-home-jersey.jpg", '/img/products/juventus-jersey-detail.jpg'],
            category: subCatDocs["Juventus"]._id
        },
        {
            name: "Jersey América Local 2024",
            description: "Camiseta del Club América. Amarillo tradicional con detalles azules.",
            modelo: "Local", // Enum: 'Local', 'Visitante'
            variants: [ // Tu schema variantSchema: { size, stock }
                { size: 'S', stock: 10 },
                { size: 'M', stock: 15 },
                { size: 'L', stock: 5 },
                { size: 'XL', stock: 2 }
            ],
            genre: "Hombre", // Enum: 'Hombre', 'Mujer', 'Niño'
            price: 1099,
            imagesUrl: ["/img/products/club-america-yellow-home-jersey.jpg", '/img/products/america-jersey-detail.jpg'],
            category: subCatDocs["América"]._id
        },
        {
            name: "Jersey Chivas Guadalajara Local 2024",
            description: "Camiseta de las Chivas. Rayas rojas y blancas clásicas.",
            modelo: "Local", // Enum: 'Local', 'Visitante'
            variants: [ // Tu schema variantSchema: { size, stock }
                { size: 'S', stock: 10 },
                { size: 'M', stock: 15 },
                { size: 'L', stock: 5 },
                { size: 'XL', stock: 2 }
            ],
            genre: "Hombre", // Enum: 'Hombre', 'Mujer', 'Niño'
            price: 1099,
            imagesUrl: ["/img/products/chivas-guadalajara-striped-jersey.jpg", '/img/products/chivas-jersey-back.jpg'],
            category: subCatDocs["Chivas"]._id
        },
        {
            name: "Jersey PSG Local 2024",
            description: "Camiseta del Paris Saint-Germain. Azul marino con franja roja central.",
            modelo: "Local", // Enum: 'Local', 'Visitante'
            variants: [ // Tu schema variantSchema: { size, stock }
                { size: 'S', stock: 10 },
                { size: 'M', stock: 15 },
                { size: 'L', stock: 5 },
                { size: 'XL', stock: 2 }
            ],
            genre: "Hombre", // Enum: 'Hombre', 'Mujer', 'Niño'
            price: 1399,
            imagesUrl: ["/img/products/psg-paris-blue-home-jersey.jpg", '/img/products/psg-jersey-back.jpg'],
            category: subCatDocs["PSG"]._id
        },
        {
            name: "Jersey Argentina Campeón Mundial 2022",
            description: "Camiseta de la selección argentina. Diseño con las tres estrellas de campeón mundial.",
            modelo: "Local", // Enum: 'Local', 'Visitante'
            variants: [ // Tu schema variantSchema: { size, stock }
                { size: 'S', stock: 10 },
                { size: 'M', stock: 15 },
                { size: 'L', stock: 5 },
                { size: 'XL', stock: 2 }
            ],
            genre: "Hombre", // Enum: 'Hombre', 'Mujer', 'Niño'
            price: 1499,
            imagesUrl: ["/img/products/argentina-world-cup-champion-jersey.jpg", '/img/products/argentina-jersey-stars.jpg'],
            category: subCatDocs["Selección de Argentina"]._id
        },
        {
            name: "Jersey Inter de Milán Local 2024",
            description: "Camiseta del Inter de Milán. Rayas azules y negras legendarias.",
            modelo: "Local", // Enum: 'Local', 'Visitante'
            variants: [ // Tu schema variantSchema: { size, stock }
                { size: 'S', stock: 10 },
                { size: 'M', stock: 15 },
                { size: 'L', stock: 5 },
                { size: 'XL', stock: 2 }
            ],
            genre: "Hombre", // Enum: 'Hombre', 'Mujer', 'Niño'
            price: 1249,
            imagesUrl: ["/img/products/inter-milan-striped-home-jersey.jpg", '/img/products/inter-milan-jersey-detail.jpg'],
            category: subCatDocs["Inter de Milán"]._id
        },
    ];

    for (const prod of productsData) {
        const product = new Product(prod);
        await product.save();
    }

    console.log("Datos de prueba insertados correctamente.");
    await mongoose.disconnect();
};

seed();