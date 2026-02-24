import express from 'express';
import { body, param } from 'express-validator';
import {
    createShippingAddress,
    getUserAddresses,
    getAddressById,
    getDefaultAddress,
    updateShippingAddress,
    setDefaultAddress,
    deleteShippingAddress
} from '../controllers/shippingAddressController.js';
import authMiddleware from '../middlewares/authMiddleware.js'; // Middleware de autenticación
import validate from '../middlewares/validations.js';
import {
    nameValidation,
    addressLineValidation,
    cityValidation,
    stateValidation,
    postalCodeValidation,
    countryValidation,
    addressPhoneValidation,
    booleanValidation,
    addressTypeValidation,
    mongoIdValidation,
    nameOptionalValidation,
    addressLineOptionalValidation,
    cityOptionalValidation,
    stateOptionalValidation,
    postalCodeOptionalValidation,
    addressPhoneOptionalValidation
} from '../middlewares/validators.js';

const router = express.Router();

// Validaciones comunes para crear/actualizar dirección
const addressValidations = [
    nameValidation(),
    addressLineValidation(),
    cityValidation(),
    stateValidation(),
    postalCodeValidation(),
    countryValidation(),
    addressPhoneValidation(),
    booleanValidation('isDefault'),
    addressTypeValidation(),
];


// Crear una nueva dirección
router.post('/new-address', authMiddleware, addressValidations, validate, createShippingAddress);

// Obtener todas las direcciones del usuario
router.get('/user-addresses', authMiddleware, getUserAddresses);

// Obtener la dirección por defecto
router.get('/default', authMiddleware, getDefaultAddress);

// Obtener una dirección específica (requiere autenticación)
router.get('/user-address/:addressId', authMiddleware, [
    mongoIdValidation('addressId', 'Address ID')
], validate, getAddressById);

// Actualizar una dirección (requiere autenticación)
router.put('/user-address/:addressId', authMiddleware, [
    mongoIdValidation('addressId', 'Address ID'),
    nameOptionalValidation(),
    addressLineOptionalValidation(),
    cityOptionalValidation(),
    stateOptionalValidation(),
    postalCodeOptionalValidation(),
    countryValidation(),
    addressPhoneOptionalValidation(),
    booleanValidation('isDefault'),
    addressTypeValidation(),
], validate, updateShippingAddress);

// Marcar dirección como default
router.patch('/default/:addressId',authMiddleware, [
    mongoIdValidation('addressId', 'Address ID')
], validate,  setDefaultAddress);

// Eliminar una dirección
router.delete('/delete-address/:addressId',authMiddleware, [
    mongoIdValidation('addressId', 'Address ID')
], validate,  deleteShippingAddress);

export default router;