const express = require('express');
const app = express();
const port = 5000;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config/key');

//만들어둔 User 모델 가져옴
const { User } = require("./models/User");

//application/x-www-form-urlencoded 
//타입으로된 데이터 가져와서 분석할 수 있게
app.use(bodyParser.urlencoded({extended: true}));
//application/json 타입으로 된 데이터 가져와서 분석할 수 있게
app.use(bodyParser.json());

mongoose.connect(config.mongoURI,
    {
        useNewUrlParser: true, 
        useUnifiedTopology: true, 
        useFindAndModify: false
    }).then(() => console.log('MongoDB Connected...')) //DB 잘 연결됐는지
    .catch(err => console.log(err)); //에러 처리

app.get('/', (req, res) => {
    res.send('Hello World!');
});


app.post('/api/users/register', (req, res) => {
    //회원가입할 때 필요한 정보들을 client에서 가져오면
    //그것들을 DB에 넣어줌
    const user = new User(req.body);
    user.save((err, userInfo) => { //몽고DB의 메소드
        if(err) return res.json({success: false, err});
        return res.status(200).json({ //200은 성공했다는 뜻
            success: true
        });
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

