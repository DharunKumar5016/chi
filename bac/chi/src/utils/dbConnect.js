const connectWithRetry = async () => {
  const maxRetries = 3;
  for (let i = 0; i < maxRetries; i++) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, mongoOptions);
      console.log('MongoDB connected successfully');
      break;
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      console.log('Retrying MongoDB connection...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};
