import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CartItem } from '../common/cart-item';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem[] = [];
  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

  constructor() {
  }

  addToCart(theCartItem: CartItem) {
    // check if item is already present in cart
    let alreadyExistInCart: boolean = false;
    let exisitingCartItem: CartItem = undefined;

    if (this.cartItems.length > 0) {
      //find item in cart based on item id
      exisitingCartItem = this.cartItems.find(tempCartItem => tempCartItem.id === theCartItem.id);
      //check id we found it 
      alreadyExistInCart = (exisitingCartItem != undefined);
    }
    if (alreadyExistInCart) {
      exisitingCartItem.quantity++;
    } else {
      //just add item in array
      this.cartItems.push(theCartItem);
    }

    //compute cart total price and quantity
    this.computeCartTotal();

  }
  decrementQuantity(theCartItem: CartItem) {
    theCartItem.quantity--;

    if (theCartItem.quantity === 0) {
      this.remove(theCartItem);
    } else {
      this.computeCartTotal();
    }
  }
  remove(theCartItem: CartItem) {
    //get index of the item in the array
    let itemIndex = this.cartItems.findIndex(tempCartitem => tempCartitem.id === theCartItem.id);

    //if found, remove the item fron the array at the given index
    if (itemIndex > -1) {
      this.cartItems.splice(itemIndex, 1);
      this.computeCartTotal();
    }
  }
  computeCartTotal() {
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;
    for (let currentCartItem of this.cartItems) {
      totalPriceValue += currentCartItem.quantity * currentCartItem.unitPrice;
      totalQuantityValue += currentCartItem.quantity;
    }

    //publish new values ... all subscribers will receive the new data;
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    this.logCartData(totalPriceValue, totalQuantityValue);
  }
  logCartData(totalPriceValue: number, totalQuantityValue: number) {
    console.log('contents of cart');
    for (let tempCartItem of this.cartItems) {
      const subTotalPrice = tempCartItem.quantity * tempCartItem.unitPrice;
      console.log(`name: ${tempCartItem.name}, quantity= ${tempCartItem.quantity}, unitPrice=${tempCartItem.unitPrice}, subTotalPrice=${subTotalPrice}`);
    }
    console.log(`totalPrice: ${totalPriceValue.toFixed(2)}`);
    console.log(`totalQuantity: ${totalQuantityValue}`);
    console.log('-----------------------------------');


  }
}
