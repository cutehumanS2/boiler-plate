const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://gahing:costmcostm2@boilerplate.nh4x2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
    {
        useNewUrlParser: true, useUnifiedTopology: true, 
        useFindAndModify: false
    }).then(() => console.log('MongoDB Connected...')) //DB 잘 연결됐는지
    .catch(err => console.log(err)); //에러 처리

