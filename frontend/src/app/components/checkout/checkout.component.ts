import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { ShopFormService } from 'src/app/services/shop-form.service';
import { WhiteSpaceValidators } from 'src/app/validators/white-space-validators';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup: FormGroup;
  totalPrice: number = 0.0;
  totalQuantity: number = 0;
  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];
  countries: Country[] = [];
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];
  constructor(private formBuilder: FormBuilder, private formService: ShopFormService, private cartService: CartService, private checkoutService: CheckoutService,
    private router: Router) { }

  ngOnInit(): void {

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required, Validators.minLength(2), WhiteSpaceValidators.notOnlyWhiteSpace]),
        lastName: new FormControl('', [Validators.required, Validators.minLength(2), WhiteSpaceValidators.notOnlyWhiteSpace]),
        email: new FormControl('', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), WhiteSpaceValidators.notOnlyWhiteSpace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), WhiteSpaceValidators.notOnlyWhiteSpace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), WhiteSpaceValidators.notOnlyWhiteSpace]),
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), WhiteSpaceValidators.notOnlyWhiteSpace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), WhiteSpaceValidators.notOnlyWhiteSpace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), WhiteSpaceValidators.notOnlyWhiteSpace]),
      }),
      creditCard: this.formBuilder.group({
        cardType: new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('', [Validators.required, Validators.minLength(2), WhiteSpaceValidators.notOnlyWhiteSpace]),
        cardNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}')]),
        expirationMonth: [''],
        expirationYear: [''],
      }),
    });

    //populate credit card months
    const startMonth: number = new Date().getMonth() + 1;
    console.log('startMonth: ' + startMonth);
    this.formService.getCreditCardMonth(startMonth).subscribe(
      data => {
        console.log("retrieved credit card months: " + JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );
    //subscribe to credit card years
    this.formService.getCreditCardYear().subscribe(
      data => {
        console.log("retrieved credit card years: " + JSON.stringify(data));
        this.creditCardYears = data;
      }
    );
    this.populateCountries();
    this.reviewCartDetails();
  }

  get firstName() { return this.checkoutFormGroup.get('customer.firstName') }
  get lastName() { return this.checkoutFormGroup.get('customer.lastName') }
  get email() { return this.checkoutFormGroup.get('customer.email') }

  get ShipingAddressCountry() { return this.checkoutFormGroup.get('shippingAddress.country') }
  get ShipingAddressStreet() { return this.checkoutFormGroup.get('shippingAddress.street') }
  get ShipingAddressCity() { return this.checkoutFormGroup.get('shippingAddress.city') }
  get ShipingAddressState() { return this.checkoutFormGroup.get('shippingAddress.state') }
  get ShipingAddressZipCode() { return this.checkoutFormGroup.get('shippingAddress.zipCode') }

  get BillingAddressCountry() { return this.checkoutFormGroup.get('billingAddress.country') }
  get BillingAddressStreet() { return this.checkoutFormGroup.get('billingAddress.street') }
  get BillingAddressCity() { return this.checkoutFormGroup.get('billingAddress.city') }
  get BillingAddressState() { return this.checkoutFormGroup.get('billingAddress.state') }
  get BillingAddressZipCode() { return this.checkoutFormGroup.get('billingAddress.zipCode') }

  get creditCardType() { return this.checkoutFormGroup.get('creditCard.cardType') }
  get creditNameOnCard() { return this.checkoutFormGroup.get('creditCard.nameOnCard') }
  get creditCardNumber() { return this.checkoutFormGroup.get('creditCard.cardNumber') }
  get creditSecurityCode() { return this.checkoutFormGroup.get('creditCard.securityCode') }



  reviewCartDetails() {
    this.cartService.totalPrice.subscribe(data => this.totalPrice = data);
    this.cartService.totalQuantity.subscribe(data => this.totalQuantity = data);
  }




  copyShippingToBillingAddr(event) {
    if (event.target.checked) {
      this.checkoutFormGroup.controls.billingAddress.setValue(this.checkoutFormGroup.controls.shippingAddress.value);
      this.billingAddressStates = this.shippingAddressStates;
    } else {
      this.checkoutFormGroup.controls.billingAddress.reset();
      this.billingAddressStates = []
    }
  }

  onSubmit() {
    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }
    //setup order
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    //get cartItems
    const cartItems = this.cartService.cartItems;

    //create orderItems from cartItems
    let orderItems: OrderItem[] = cartItems.map(tempCartItems => new OrderItem(tempCartItems));

    //setup purchase
    let purchase = new Purchase();

    //populate purchase customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;
    //populate purchase shippingAddress
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state))
    const shippingCountry: State = JSON.parse(JSON.stringify(purchase.shippingAddress.country))
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;
    //populate purchase billingAddress
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state))
    const billingCountry: State = JSON.parse(JSON.stringify(purchase.billingAddress.country))
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;
    //populate purchase order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems
    //call rest API via checkout service

    this.checkoutService.placeOrder(purchase).subscribe({
      next: response => {
        alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);
        //reset cart
        this.resetCart();
      },
      error: err => {
        alert(`There was an error: ${err.message}`)
      }
    }
    )

  }
  resetCart() {
    //reset cart Data
    this.cartService.cartItems = [];
    this.cartService.totalQuantity.next(0);
    this.cartService.totalPrice.next(0);
    //reset formData
    this.checkoutFormGroup.reset();

    //navigate back to products page
    this.router.navigateByUrl('/products');
  }
  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    const currentYear = new Date().getFullYear();
    const selectedYear = Number(creditCardFormGroup.value.expirationYear);

    let startMonth: number;
    if (currentYear === selectedYear) {
      //if the currentyear and selected year are same start with current month
      startMonth = new Date().getMonth() + 1;
    } else {
      //if the currentyear and selected year are different start with 1
      startMonth = 1;
    }
    this.formService.getCreditCardMonth(startMonth).subscribe(
      data => {
        console.log(data);

        this.creditCardMonths = data;
      });
  }
  populateCountries() {
    this.formService.getCountries().subscribe(data => this.countries = data);
  }
  populateStates(theCountryCode: string) {
    this.formService.getStates(theCountryCode)
  }
  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGroup.value.country.code;
    const countryName = formGroup.value.country.name;
    console.log(countryCode, countryName);
    this.formService.getStates(countryCode).subscribe(
      data => {
        if (formGroupName === 'shippingAddress') {
          this.shippingAddressStates = data;
        }
        else {
          this.billingAddressStates = data;
        }
        //select first state as default
        formGroup.get('state').setValue(data[0]);
      }
    )

  }

}
