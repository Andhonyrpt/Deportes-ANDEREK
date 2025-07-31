const isAdmin = (req, res, next) => {

    if (!req.user) {
        return res.status(401).json({ message: 'Authetication required' });
    }

    if (req.user.role !== 'admin') {
        return res.status.json({ message: 'Admin access required' });
    }

    next();

};

export default isAdmin;