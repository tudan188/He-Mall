import Vue from 'vue'
import Router from 'vue-router'
import GoodsList from './../views/GoodsList'
import cart from './../views/cart'
import Address from './../views/Address'
import OrderConfirm from './../views/OrderConfirm'
import OrderSuccess from './../views/OrderSuccess'

Vue.use(Router)

export default new Router({
	routes: [
	    {
	      path: '/',
	      name:'GoodsList',
	      components: {
	      	default:GoodsList //,title:Title,img:Image
	    	},
	    },
	    {
	        path: '/cart',
	        name:'cart',
	        component:cart
	    },
	    {
	        path: '/address',
	        name:'Address',
	        component:Address
	    },
	    {
	        path: '/orderConfirm',
	        name:'OrderConfirm',
	        component:OrderConfirm
	    },
	    {
	        path: '/orderSuccess',
	        name:'OrderSuccess',
	        component:OrderSuccess
	    }
	]
})
