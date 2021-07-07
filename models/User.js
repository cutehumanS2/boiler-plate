const mongoose = require('mongoose');

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

//스키마를 모델로 감싸줌
const User = mongoose.model('User', userSchema);

//다른 곳에서도 쓸 수 있게 export
module.exports = { User };