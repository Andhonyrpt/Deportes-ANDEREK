import { validationResult } from 'express-validator';

const validate = (req, res, next) => {

    const errors = validationResult(req);

    if (!errors) {
        return res.status(422).json({ errors: errors.array() });
    }

    next();
}

export default validate;