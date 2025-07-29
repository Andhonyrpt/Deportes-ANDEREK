const logger = (req, res, next) => {
    console.log('📌 Logger ejecutado'); // Esto se debe imprimir en cada petición
  const dateTime = new Date();
  console.log(`${dateTime.toISOString()} | ${req.method} | ${req.url}`);
  next();
};

export default logger;