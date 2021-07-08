//User 모델 불러옴
const { User } = require("../models/User");

let auth = (req, res, next) => {//인증 처리 하는 곳
    
    //클라이언트 쿠키에서 토큰 가져옴 ~> cookie-parser 이용
    let token = req.cookies.x_auth;

    //토큰을 복호화 한 후 유저를 찾음
    User.findByToken(token, (err, user) => {
        if(err) throw err;
        
        //클라이언트에 유저가 없으면 인증 X
        if(!user) return res.json({isAuth: false, error: true});
        
        //클라이언트에 유저가 있으면 인증 O
        //~>auth route에서 req 통해 token, user를 사용할 수 있게
        //req에 넣어줌
        req.token = token;
        req.user = user;
        next(); //미들웨어에 갇히지 않게
    });
}

module.exports = { auth };
