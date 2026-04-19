export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    if (field === 'phone' || (err.keyPattern?.phone && err.keyPattern?.date)) {
      message = 'A booking already exists for this phone number on the selected date.';
    } else {
      message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
    }
    statusCode = 400;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map(e => e.message).join(', ');
    statusCode = 400;
  }

  // Mongoose CastError
  if (err.name === 'CastError') {
    message = `Invalid ${err.path}: ${err.value}`;
    statusCode = 400;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
