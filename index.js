const express = require('express');
const app = express();
const port = 5000;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/key');

//만들어둔 User 모델 가져옴
const { User } = require("./models/User");
const { auth } = require("./middleware/auth");

//application/x-www-form-urlencoded 
//타입으로된 데이터 가져와서 분석할 수 있게
app.use(bodyParser.urlencoded({extended: true}));
//application/json 타입으로 된 데이터 가져와서 분석할 수 있게
app.use(bodyParser.json());
app.use(cookieParser());

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

app.post('/api/users/login', (req, res) => {
    //요청된 이메일이 DB에 있는지 찾음
    User.findOne({email: req.body.email}, (err, user) => {
        console.log(req.body.email);
        if(!user){
            return res.json({
                loginSuccess: false,
                message: "이메일에 해당하는 유저 정보x"
            });
        }//요청된 이메일이 DB에 있으면 맞는 비번 입력했는지 확인
        user.comparePassword(req.body.password, (err, isMatch) => {
            if(!isMatch) 
                return res.json({
                    loginSuccess: false,
                    message: "비밀번호가 틀렸습니다."
                });
            //비밀번호까지 맞다면 토큰 생성
            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err);
                //토큰을 쿠키에 저장
                //+) 토큰은 쿠키나 로컬스토리지 등에 저장할 수 있음
                //f12 > Application > Storage > Cookies 또는 LocalStorage
                res.cookie("x_auth", user.token) //'x_auth'라는 이름으로 쿠키에 저장됨
                    .status(200)
                    .json({loginSuccess: true, userId: user._id});
            });
        });
    });
});

//role 1: 어드민    role 2: 특정부서 어드민
//role===0: 일반 유저   role!=0: 관리자라고 가정
app.get('/api/users/auth', auth, (req, res) => {
    //여기까지 왔다면 미들웨어 통과해온 것
    //: Authentication이 True라는 뜻
    //=> 클라이언트에게 user 정보 전달해줘야 함
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false: true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    });
});

app.get('/api/users/logout', auth, (req, res) => {
    User.findOneAndUpdate({_id: req.user._id},
        {token: ""},
        (err ,user) => {
            if(err) return res.json({success: false, err});
            return res. status(200).send({
                success: true
            });
        });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

