<template>
	<div>
		<NavHader></NavHader>
		<NavBread>
			<span class="">Goods</span>
		</NavBread>
		  <div class="accessory-result-page accessory-page">
		    <div class="container">
		      <div class="filter-nav">
		        <span class="sortby">排序:</span>
		        <a href="javascript:void(0)" class="default cur">默认</a>
		        <a @click="sortGoods" href="javascript:void(0)" class="price">价格<svg class="icon icon-arrow-short" :class="{'sort-up':!sortFlag,'sort-down':sortFlag}"><use xlink:href="#icon-arrow-short"></use></svg></a>
		        <a href="javascript:void(0)" class="filterby stopPop" @click="showFilterby">Filter by</a>
		      </div>
		      <div class="accessory-result">
		        <!-- filter -->
		        <div class="filter stopPop" id="filter" :class="{'filterby-show':Filterby}">
		          <dl class="filter-price">
		            <dt>价格:</dt>
		            <dd><a href="javascript:void(0)" @click="allGetGoods(),priceCheckd='all'" :class="{'cur':priceCheckd==='all'}">All</a></dd>
		            <dd v-for="(price,index) in priceFilter" @click="setPriceCheckd(index)">
		              <a href="javascript:void(0)" :class="{'cur':priceCheckd===index}">{{price.startPrice}} - {{price.endPrice}}</a>
		            </dd>
		          </dl>
		        </div>
		        <!-- search result accessories list -->
		        <div class="accessory-list-wrap">
		          <div class="accessory-list col-4">
		            <ul>
		              <li class="" v-show="goodsLists" v-for="item in goodsLists">
	              		<div class="pic">
	              		  <a href="#"><img v-lazy="'static/'+item.productImage" alt=""></a>
	              		</div>
	              		<div class="main">
	              		  <div class="name">{{item.productName}}</div>
	              		  <div class="price">$ {{item.salePrice}}</div>
	              		  <div class="btn-area">
	              		    <a href="javascript:;" class="btn btn--m" @click='addCart(item.productId)'>加入购物车</a>
	              		  </div>
	              		</div>
		              </li>
		            </ul>
		            <div v-infinite-scroll="loadMore" infinite-scroll-disabled="busy" infinite-scroll-distance="10">
		              <img src="../../static/loading-svg/loading-spinning-bubbles.svg" alt="" class="" v-show='loading'>
		            </div>
		          </div>
		        </div>
		      </div>
		    </div>
		  </div>
		  <div class="md-overlay" v-show="stopPop" @click="toggleStopPop"></div>
		  <Modal :mdShow="mdShow" :close='closeModal'>
		  	<p slot="msg">请先登录，不然无法使用购物车</p>
		  	<div class="" slot="btnGroup">
		  		<a href="javascript:;" class="btn btn--m" @click="closeModal">关闭</a>
		  	</div>
		  </Modal>
		  <!-- 加入购物车弹窗 -->
		  <Modal :mdShow="mdShowCart" v-on:close='closeModal'>
		  	<p slot="msg">
				<svg class="icon icon-status-ok">
					<use xlink:href="#icon-arrow-short"></use>
				</svg>
				<span class="">加入购物车成功</span>
		  	</p>
		  	<div class="" slot="btnGroup">
		  		<a href="javascript:;" class="btn btn--m" @click="mdShowCart=false">继续购物</a>
		  		<router-link href="javascript:;" class="btn btn--m" to="/cart">查看购物车</router-link>
		  	</div>
		  </Modal>
		  <NavFooter></NavFooter>
	</div>
</template>

<script>
	import Vue from 'vue'
	import './../assets/css/base.css'
	import './../assets/css/product.css' 
	import NavHader from './../views/Header'
	import NavFooter from './../views/NavFooter'
	import NavBread from './../views/NavBread'
	import Modal from './../views/Modal'
	import axios from 'axios'
	import VueLazyLoad from 'vue-lazyload' //图片懒加载
	const ERR_OK = 0;

	Vue.use(VueLazyLoad,{
		loading:'static/loading-svg/loading-bars.svg'
	})

	export default{
		name:"GoodsList",
		data(){
			return {
				goodsLists:[],
				priceFilter:[
				{
					startPrice:'0.00',
					endPrice:'100.00'
				},
				{
					startPrice:'100.00',
					endPrice:'500.00'
				},
				{
					startPrice:'500.00',
					endPrice:'1000.00'
				},
				{
					startPrice:'1000.00',
					endPrice:'5000.00'
				}
				],
				priceCheckd:'all',
				Filterby:false,
				stopPop:false,
				sortFlag:true,
				page:1,
				pageSize:8,
				busy:true,
				loading:false,
				mdShow:false,
				mdShowCart:false
			}
		},
		created(){
			this.getGoodsList();
		},
		methods:{
			getGoodsList(flag){
				var param={
					page:this.page,
					pageSize:this.pageSize,
					sort:this.sortFlag?1:-1,
					priceLevel:this.priceCheckd
				};
				this.loading = true;
				axios.get('/goods/list',{params:param}).then((result)=>{
					let res = result.data;
					this.loading = false
					if(res.status === ERR_OK){
						if(flag){
							this.goodsLists = this.goodsLists.concat(res.result.list);//concat 深度克隆
							if(res.result.count===0){
								this.busy=true
							}else{
								this.busy=false
							}
						}else{	
							this.goodsLists = res.result.list;
							this.busy = false
						}
					}else{
						this.goodsLists = [];
					}

				})
			},
			showFilterby(){
				this.Filterby=true,
				this.stopPop=true
			},
			toggleStopPop(){
				this.Filterby=false,
				this.stopPop=false
			},
			setPriceCheckd(index){
				this.goodsLists = [];
				this.priceCheckd = index;
				this.page =1;
				this.toggleStopPop();
				this.getGoodsList(true);
			},
			sortGoods(){
				this.sortFlag = ! this.sortFlag;
				this.page =1;
				this.getGoodsList();
			},
			loadMore(){
				this.busy = true;
				setTimeout(() => {
				this.page++;
				this.getGoodsList(true);
				}, 500);
			},
			//加入购物车
			addCart(productId){
				axios.post('/goods/addCart',{productId:productId}).then((res)=>{
					if(res.data.status === 0){
						this.mdShowCart = true;
						this.$store.commit('updateCartCount',1)
					}else{
						this.mdShow = true;
					}
				})
			},
			allGetGoods(){
				this.goodsLists = [];
				this.page = 1;
				this.getGoodsList();
			},
			closeModal(){
				this.mdShow = false ;
				this.mdShowCart = false ;
			}
		},
		components:{
			NavHader,NavFooter,NavBread,Modal
		}
	}
</script>

<style>

</style>