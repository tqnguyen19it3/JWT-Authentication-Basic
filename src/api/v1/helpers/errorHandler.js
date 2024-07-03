function errorHandler(err, req, res, next) {
    // Trả về một thông báo lỗi cho client
    res.json({
        status: err.status || 500,
        message: err.message
    });
  }
  
  module.exports = errorHandler;