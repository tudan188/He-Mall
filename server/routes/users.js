var express = require('express');
var router = express.Router();
var User = require('./../models/user')
require('./../util/util')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


//登录接口
router.post('/login', (req, res) => {
  let {userName, userPwd} = {...req.body};//
  User.findOne({userName, userPwd}, (err, userDoc) => {
    if (err) {
      res.json({
        status: 1,
        msg: '系统错误 登录失败',
        data: ''
      });
    } else {
      if (userDoc) {
        res.cookie('userId', userDoc._id, {
          path: '/', //设置cookie在主域名下
          maxAge: 60000000
        });
        res.cookie('userName', userDoc.userName, {
          path: '/', //设置cookie在主域名下
          maxAge: 60000000
        });
        res.json({
          status: 0,
          msg: "登录成功",
          result: {userName:userDoc.userName}
        });
      } else {
        res.json({
          status: 1001,
          msg: "密码或者账号错误",
          result:''
        });
      }
    }
  })
});


//退出登录接口
router.post('/logout',(req,res)=>{
	res.cookie('userId',' ',{
		path:'/',//设置cookie在主域名下
		maxAge:-1
	})
  res.cookie('userName',' ',{
    path:'/',//设置cookie在主域名下
    maxAge:-1
  })
	res.json({
		status:'0',
		msg:'',
		result:''
	})
})

//校验登录状态接口
router.get('/checkLogin',(req,res)=>{
  if(req.cookies.userId){
    res.json({
      status: '0',
      msg: "",
      result: req.cookies.userName || ''
    });
  }else{
    res.json({
      status: '1',
      msg: "未登录",
      result: ''
    });
  }
})

router.post('/checklogin', (req, res) => {
  if (req.cookies.userId) {
    res.json({
         status: '0',
         msg: "",
         result: req.cookies.userName || ''
       });
  } else {
    res.json({
      code: 1,
      msg: '不存在登录信息',
      result: [],
      kk: "456"
    });
  }
});

//查询用户购物车数据接口 req 请求 res 往客服端写入
router.get('/cartList',(req,res)=>{
  let userId = req.cookies.userId;
  User.findOne( {_id:userId} , (err,CartListDoc)=>{
    if(err){
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    }else{
      if(CartListDoc){
        res.json({
          status: '0',
          msg: "",
          result: CartListDoc.cartList
        })
      }
    }
  })
})

//购物车删除接口
router.post('/cartDel',(req,res)=>{
  let userId = req.cookies.userId;
  let productId = req.body.productId;
  User.update({_id: userId}, {$pull: {cartList: {productId}}}, (err, doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: "系统错误",
        result: ''
      });
    } else {
      res.json({
        status: '0',
        msg: "删除成功",
        result: 'suc'
      });
    }
  });
})

//查询购物车数量
router.get('/getCartCount',(req,res)=>{
  if(req.cookies && req.cookies.userId){
      let userId = req.cookies.userId;
      User.findOne({_id:userId},(err,doc)=>{
          if(err){
            res.json({
              status: '1',
              msg: err.message,
              result: ''
            })
          }else{
            let cartList = doc.cartList;
            let cartCount=0;
            cartList.map(item=>{
              cartCount+= parseInt(item.productNum);
            })
            res.json({
              status: '0',
              msg: "",
              result: cartCount
            })
          }
      })
  }else{
    res.json({
      status: '1',
      msg: "err",
      result: ''
    })
  }
})

//修改购物车数量接口
router.post('/cartEdit', (req, res) => {
  let userId = req.cookies.userId;
  let {productId,productNum,checked} = {...req.body};
  User.update({_id: userId, 'cartList.productId': productId}, {'cartList.$.productNum': productNum,'cartList.$.checked': checked},(err,doc)=>{
      if (err) {
        res.json({
          status: '1',
          msg: "",
          result: ''
        });
      } else {
        res.json({
          status: '0',
          msg: "",
          result: 'suc'
        });
      }
  })
});


//全选接口
router.post('/editCheckAll',(req,res)=>{
  let userId = req.cookies.userId;
  let checkAll = req.body.checkAll;
  User.findOne({_id: userId}, (err, doc) => {
      if (err) {
        res.json({
          status: 1,
          msg: '系统错误501',
          result: []
        });
      } else {
        doc.cartList.map(v => {
          v.checked = checkAll;
        });
        doc.save((err1, doc1) => {
          if (err) {
            res.json({
              status: 1,
              msg: '系统错误501',
              result: []
            });
          } else {
            res.json({
              status: 0,
              msg: '修改商品数量成功',
              result: doc
            });
          }
        })
      }
    });
})


//查询用户地址接口
router.get('/addressList',(req,res)=>{
  let userId = req.cookies.userId;
  User.findOne({_id:userId},(err,doc)=>{
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    } else {
      res.json({
        status: '0',
        msg: "",
        result: doc.addressList
      });
    }
  })
})

//添加新地址
router.post('/upAddress',(req,res)=>{
  let userId = req.cookies.userId;
  let {userName,tel,postCode,streetName} = {...req.body};
  if(userName!=""&&tel!=""&&postCode!=""&&streetName!=""){
    User.findOne({_id:userId},(err,userDoc)=>{
      if (err) {
        res.json({
          status: '1',
          msg: err.message,
          result: ''
        });
      }else{

        let address = {
          userName:userName,
          tel:tel,
          postCode:postCode,
          streetName:streetName,
          isDefault:false
        };
        userDoc.addressList.push(address);

        userDoc.save( (err1,doc1) => {
          if (err1) {
            res.json({
              status: '1',
              msg: err.message,
              result: ''
            });
          }else{
            res.json({
              status: '0',
              msg: '',
              result: 'suc'
            });
          }
        })
      }
    })
  }else{
    res.json({
      status: '1001',
      msg: '参数错误',
      result: ''
    });
    return false
  }

})

//设置默认地址
router.post('/setDefault',(req,res)=>{
  let userId = req.cookies.userId;
  let addressId = req.body.addressId;
  if(!addressId){
    res.json({
      status: '1003',
      msg: 'addressId is null',
      result: ''
    });
  }
  User.findOne({_id:userId},(err,doc)=>{
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    } else {
      let addressList = doc.addressList;
      addressList.forEach((item) => {
        if(item.addressId == addressId){
            item.isDefault = true;
        }else{
          item.isDefault = false;
        }
      })
      doc.save((err1,doc1)=>{
        if(err1){
          res.json({
            status: '1',
            msg: err.message,
            result: ''
          });
        }else{
          res.json({
            status: '0',
            msg: "默认地址设置成功",
            result: ''
          });
        }
      })
    }
  })
})


//删除默认地址
router.post('/delAddress', (req, res) => {
  let userId = req.cookies.userId;
  let addressId = req.body.addressId;
  User.update({_id: userId}, {$pull: {addressList: {addressId:addressId}}}, (err, doc) => {
    if (err) {
      res.json({
        status:1,
        msg:"系统错误",
        result:''
      });
    }else {
      res.json({
        status:0,
        msg:"地址删除成功",
        result:doc
      });
    }
  });
});


//订单支付
router.post('/payMent' ,(req,res) => {
  let userId = req.cookies.userId;
  let addressId = req.body.addressId;
  let orderTotal = req.body.orderTotal;
  User.findOne({_id:userId},(err,doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    }else{
      //获取当前用户的地址信息
      let address = '',goodsList = [];
      let addressList = doc.addressList;
      addressList.forEach((item) => {
        // Todo...
        if(addressId==item.addressId){
          address = item;
        }
      })
      //获取用户购物车的购买商品
      doc.cartList.filter( item =>{
        if(item.checked){
          goodsList.push(item)
        }
      })

      //订单ID 生成
      var platForm = '688'
      var r1 = Math.floor(Math.random()*10);
      var r2 = Math.floor(Math.random()*10);
      var sysDate = new Date().Format('yyyyMMddhhmmss');
      var vreateDate = new Date().Format('YYYY-MM-dd hh:mm:ss');

      var orderId = platForm+r1+sysDate+r2

      let order = {
        orderId:orderId,
        orderTotal:orderTotal,
        addressInfo:address,
        goodsList:goodsList,
        orderStatus:1,
        createDate:vreateDate
      };
      doc.orderList.push(order);
      doc.save( (err1,doc1) => {
        if (err1) {
          res.json({
            status: '1',
            msg: err1.message,
            result: ''
          });
        }else{
          res.json({
            status: '0',
            msg: '',
            result: {
              orderId:order.orderId,
              orderTotal:order.orderTotal
            }
          });
        }
      })
    }
  })
})


//查询订单信息
router.get('/orderDetail', (req,res) => {
  let userId = req.cookies.userId;
  let orderId = req.param('orderId');
  User.findOne({_id:userId}, (err,userInfo)=> {
    if (err) {
      res.json({
        status:1,
        msg:"系统错误",
        result:''
      });
    }else {
      let orderList = userInfo.orderList;
      if(orderList.length>0){
        let orderTotal;
        orderList.forEach((item) => {
          // Todo...
          if(item.orderId == orderId){
            orderTotal = item.orderTotal;
          }
        })
          if(orderTotal){
            res.json({
              status:0,
              msg:"",
              result:{
                orderId:orderId,
                orderTotal:orderTotal
              }
            });
          }else{
            res.json({
              status:120002,
              msg:"无此订单",
              result:''
            });
          }
      }else{
        res.json({
          status:120001,
          msg:"当前订单没创建",
          result:''
        });
      }
    }
  })
})

// 用户注册
router.post('/reg',(req,res)=>{
  let {userName,userPwd} = {...req.body};
  if(userName!=""&&userPwd!=""){
   User.create({userName: userName, userPwd: userPwd}, (err, doc) => {
     if (err) {
       res.json({
         status: 1,
         msg: '系统错误',
         result: ''
       });
     } else {
       res.json({
         status: 0,
         msg: '注册成功',
         result: 'suc'
       });
     }
   });
  }else{
    res.json({
      status: '1001',
      msg: '参数错误',
      result: ''
    });
    return false
  }
})

// 查询用户名
router.get('/getUserName',(req,res)=>{
  let userName = req.param("userName");
  User.count({userName: userName}, (err, doc) => {
    if (err) {
      res.json({
        status:1,
        msg:"系统错误",
        result:[]
      });
    }else{
      if (doc>0) {
        res.json({
          status:11,
          msg:'用户名已经被注册',
          result:[]
        });
      }else{
        res.json({
          status:0,
          msg:"",
          result:[]
        });
      }
    }
  })
})

module.exports = router;
