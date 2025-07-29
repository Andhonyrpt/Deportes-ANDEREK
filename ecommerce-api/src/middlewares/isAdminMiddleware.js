const isAdmin = (req, res, next) => {
    req.userIsAdmin ?
        next() :
        res.status(403).json({ message: 'Forbidden' });
};

export default isAdmin;