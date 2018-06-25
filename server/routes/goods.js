var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')
var Goods = require('../models/goods')
var User = require('../models/user')



mongoose.connect('mongodb://127.0.0.1:27017/mall')

mongoose.connection.on('connected',function(){
	console.log('db success')
})

mongoose.connection.on('error',function(){
	console.log('db error')
})

mongoose.connection.on('disconnected',function(){
	console.log('db disconnected')
})

//查询商品列表
router.get('/list', (req, res) => {
	var page = parseInt(req.param('page'));//接收页数
	var pageSize = parseInt(req.param('pageSize'));
	var priceLevel = req.param('priceLevel');
	var sort = req.param('sort');//接收排序参数
	let skip = (page-1)*pageSize;
	var priceGt,priceLte;
	let params = {};
	if(priceLevel!='all'){
		switch (priceLevel){
			case '0':priceGt=0;priceLte=100;break;
			case '1':priceGt=100;priceLte=500;break;
			case '2':priceGt=500;priceLte=1000;break;
			case '3':priceGt=1000;priceLte=5000;break;
		}
		params = {
			salePrice:{
				$gt:priceGt,
				$lte:priceLte
			}
		}
	}
	let goodsModel = Goods.find(params).skip(skip).limit(pageSize);
	goodsModel.sort({'salePrice':sort})
	goodsModel.exec(function(err,doc){
		if(err){
			res.json({
				status:'1',
				msg:err.message
			})
		}else{
			res.json({
				status:0,
				msg:'',
				result:{
					count:doc.length,
					list:doc
				}
			})
		}
	})
});

//提交购物车
router.post('/addCart',function(req,res,next){
	let userId = req.cookies.userId;
	var productId = req.body.productId;
	
	//查询用户
	User.findOne({_id:userId},function(err,userDoc){
		if(err){
			res.json({
				status:'1',
				msg:err.message
			})
		}else{
			if(userDoc){
				let goodsItem = '';
				//查询商品是否存在
				userDoc.cartList.forEach(function(item){
					if(item.productId == productId){
						goodsItem = item;
						item.productNum++;
					}
				})
				if(goodsItem){
					userDoc.save(function(err2,doc2){
						if(err2){
							res.json({
								status:'1',
								msg:err2.message
							})
						}else{
							res.json({
								status:0,
								msg:'',
								result:''
							})
						}
					})
				}else{
					Goods.findOne({productId:productId},function(err,gdsDoc){
						if(err){
							res.json({
								status:'1',
								msg:'is~3'+err.message
							})
						}else{
							if(gdsDoc){
								gdsDoc._doc.productNum = 1;
								userDoc.cartList.push(gdsDoc);
								userDoc.save(function(err2,doc2){
									if(err2){
										res.json({
											status:'1',
											msg:err2.message
										})
									}else{
										res.json({
											status:0,
											msg:'',
											result:''
										})
									}
								})
							}
						}
					})
				}
			}
		}
	})
})

module.exports = router;