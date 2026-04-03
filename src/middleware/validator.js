exports.validatefood = (req, res, next) => {
  const { name, price } = req.body;
  if (!name || price <= 0) {
    return res.status(400).json({
      success: false,
      message: "name is required and price must be grrater than 0",
    });
  }
  next();
};
