var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  "userName":String,
  "userPwd":String,
  "orderList":Array,
  "cartList":[
    {
      productImage:String,
      salePrice:Number,
      productName:String,
      productId:Number,
      productNum:Number,
      checked:{
        type:Boolean, // 默认商品是被选中的
        default:'true'
      }
    }
  ],
  "addressList":[
    {
      "addressId": String,
      "userName": String,
      "streetName": String,
      "postCode": Number,
      "tel": Number,
      "isDefault": Boolean
    }
  ]
});

module.exports = mongoose.model("User",userSchema);