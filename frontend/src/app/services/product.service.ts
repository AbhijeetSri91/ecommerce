import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../common/product';
import { map } from 'rxjs/operators';
import { ProductCategory } from '../common/product-category';

@Injectable({
  providedIn: 'root'
})
export class ProductService {


  private baseUrl = 'http://localhost:8080/api/products';
  private categoryUrl = 'http://localhost:8080/api/product-category';


  constructor(private httpClient: HttpClient) { }

  getProductCategories(): Observable<ProductCategory[]> {
    return this.httpClient.get<GetResponseProductCategory>(this.categoryUrl).pipe(
      map(response => response._embedded.productCategory)
    );
  }
  getProductListPaginate(thePage: number, thePageSize: number, theCategoryId: number): Observable<GetResponseProducts> {
    //need to build URL based on category ID
    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}`
      + `&page=${thePage}&size=${thePageSize}`;

    return this.httpClient.get<GetResponseProducts>(searchUrl);
  }
  getProductList(theCategoryId: number): Observable<Product[]> {
    //need to build URL based on category ID
    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}`;
    return this.getProducts(searchUrl);
  }
  searchProducts(keyword: string): Observable<Product[]> {
    //search based on Name
    const searchByName = `${this.baseUrl}/search/findByNameContaining?name=${keyword}`;
    return this.getProducts(searchByName);
  }
  searchProductsPaginate(thePage: number, thePageSize: number, theKeyword: string): Observable<GetResponseProducts> {
    //search based on Name
    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}`
      + `&page=${thePage}&size=${thePageSize}`;

    return this.httpClient.get<GetResponseProducts>(searchUrl);
  }

  private getProducts(seachUrl: string): Observable<Product[]> {
    return this.httpClient.get<GetResponseProducts>(seachUrl).pipe(
      map(response => response._embedded.products)
    );
  }
  getProduct(productId: number) {
    let productUrl = `${this.baseUrl}/${productId}`;
    return this.httpClient.get<Product>(productUrl);
  }
}

interface GetResponseProducts {
  _embedded: {
    products: Product[]
  },
  page: {
    size: number,
    totalElements: number,
    totalPages: number,
    number: number
  }
}
interface GetResponseProductCategory {
  _embedded: {
    productCategory: ProductCategory[]
  }
}