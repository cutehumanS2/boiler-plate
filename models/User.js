const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10; //salt가 10자리
const jwt = require('jsonwebtoken');

//스키마 정의
const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email:{
        type: String,
        trim: true, //trim은 space를 없애주는 역할
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type:Number,
        default:0
    },
    image: String,
    token: { //유효성 등 관리
        type: String
    },
    tokenExp: { //토큰 사용할 수 있는 기간
        type: Number
    }
});

userSchema.pre('save', function(next){ //save하기 전에 비번 암호화
    let user = this; //userSchema 가리킴
    //비밀번호를 바꿀 때에만 암호화하도록 조건 걺
    if(user.isModified('password')){
        //비밀번호 암호화
        bcrypt.genSalt(saltRounds, function(err, salt){
            if(err) return next(err);
            bcrypt.hash(user.password, salt, function(err, hash){
                //Store hash on your password DB.
                //hash가 암호화된 비밀번호
                if(err) return next(err);
                user.password = hash;
                next();
            });
        });
    }else{
        next();
    }
});

//cb: callback
userSchema.methods.comparePassword = function(plainPassword, cb){
    //plainPassword를 암호화해서 DB에 있는 비번과 같은지 확인
    //(암호화된 비번을 복호화할 수는 없음)
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if(err) return cb(err);
        cb(null, isMatch);//이 isMatch가 index.js의 comparePassword의 인자로 들어감

    });
}

userSchema.methods.generateToken = function(cb){
    let user = this;
    //jsonwebtoken을 이용해서 token 생성
    //user._id + 'secretToken' = token
    let token = jwt.sign(user._id.toHexString(), 'secretToken');
    //userSchema의 token에 넣어줌
    user.token = token;
    user.save(function(err, user){ //DB에 저장
        if(err) return cb(err);
        cb(null, user); //이 user가 index.js의 generateToken의 인자로 들어감
    });
}

userSchema.statics.findByToken = function(token, cb){
    let user = this; 

    //토큰을 decode(복호화)
    //verify(): 토큰 유효성 확인
    jwt.verify(token, 'secretToken', function(err, decoded){
        //유저 아이디를 이용해서 유저를 찾은 다음에
        //클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인
        //findOne(): 배열의 첫 번째 데이터 추출
        user.findOne({"_id": decoded, "token":token}, function(err, user){
            if(err) return cb(err);
            cb(null, user);
        });
    });
}

//스키마를 모델로 감싸줌
const User = mongoose.model('User', userSchema);

//다른 곳에서도 쓸 수 있게 export
module.exports = { User };