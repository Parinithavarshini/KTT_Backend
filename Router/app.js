require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

const db = require('./models');
console.log(Object.keys(db));

const userRoutes = require('./routes/user');

app.use('/user', userRoutes);

db.sequelize.authenticate()
  .then(() => {
    console.log('Database Connected');
  })
  .catch(err => {
    console.log(err);
  });

db.sequelize.sync()
  .then(() => {
    console.log('Tables Created');
  });

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});