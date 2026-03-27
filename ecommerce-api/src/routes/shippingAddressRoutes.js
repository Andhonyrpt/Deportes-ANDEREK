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
import authMiddleware from '../middlewares/authMiddleware.js';
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

// Validaciones comunes
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

/**
 * @openapi
 * /shipping-addresses/new-address:
 *   post:
 *     summary: Crear nueva dirección
 *     tags: [ShippingAddresses]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Dirección creada }
 */
router.post('/shipping-addresses/new-address', authMiddleware, addressValidations, validate, createShippingAddress);

/**
 * @openapi
 * /shipping-addresses/user-addresses:
 *   get:
 *     summary: Obtener todas las direcciones del usuario
 *     tags: [ShippingAddresses]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de direcciones }
 */
router.get('/shipping-addresses/user-addresses', authMiddleware, getUserAddresses);

/**
 * @openapi
 * /shipping-addresses/default:
 *   get:
 *     summary: Obtener dirección por defecto
 *     tags: [ShippingAddresses]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Dirección por defecto }
 */
router.get('/shipping-addresses/default', authMiddleware, getDefaultAddress);

/**
 * @openapi
 * /shipping-addresses/user-address/{addressId}:
 *   get:
 *     summary: Obtener dirección específica
 *     tags: [ShippingAddresses]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Detalle dirección }
 */
router.get('/shipping-addresses/user-address/:addressId', authMiddleware, [
    mongoIdValidation('addressId', 'Address ID')
], validate, getAddressById);

/**
 * @openapi
 * /shipping-addresses/user-address/{addressId}:
 *   put:
 *     summary: Actualizar dirección
 *     tags: [ShippingAddresses]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Actualizada }
 */
router.put('/shipping-addresses/user-address/:addressId', authMiddleware, [
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

/**
 * @openapi
 * /shipping-addresses/default/{addressId}:
 *   patch:
 *     summary: Establecer dirección como default
 *     tags: [ShippingAddresses]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Actualizada }
 */
router.patch('/shipping-addresses/default/:addressId', authMiddleware, [
    mongoIdValidation('addressId', 'Address ID')
], validate, setDefaultAddress);

/**
 * @openapi
 * /shipping-addresses/delete-address/{addressId}:
 *   delete:
 *     summary: Eliminar dirección
 *     tags: [ShippingAddresses]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Eliminada }
 */
router.delete('/shipping-addresses/delete-address/:addressId', authMiddleware, [
    mongoIdValidation('addressId', 'Address ID')
], validate, deleteShippingAddress);

export default router;