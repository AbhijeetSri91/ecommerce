import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Country } from '../common/country';
import { State } from '../common/state';

@Injectable({
  providedIn: 'root'
})
export class ShopFormService {
  private countriesUrl = 'http://localhost:8080/api/countries';
  private statesUrl = 'http://localhost:8080/api/states';

  constructor(private http: HttpClient) { }

  getCreditCardMonth(startMonth: number): Observable<number[]> {
    let data: number[] = [];
    // for month dropdown list
    //start with current year and show for months till year end
    for (let theMonth = startMonth; theMonth <= 12; theMonth++) {
      data.push(theMonth);
    }
    return of(data);
  }
  getCreditCardYear(): Observable<number[]> {
    let data: number[] = [];
    // for year dropdown list
    //start with current year and show for next 10 years
    const startYear: number = new Date().getFullYear();
    const endYear = startYear + 10;
    for (let theYear = startYear; theYear <= endYear; theYear++) {
      data.push(theYear);
    }
    return of(data);
  }

  getCountries(): Observable<Country[]> {
    return this.http.get<GetResponseCountries>(this.countriesUrl).pipe(
      map(resp => resp._embedded.countries)
    );
  }
  getStates(theCountryCode: string): Observable<State[]> {
    let searchUrl = `${this.statesUrl}/search/findByCountryCode?code=${theCountryCode}`;
    return this.http.get<GetResponseStates>(searchUrl).pipe(map(
      resp => resp._embedded.states
    ));

  }
}
interface GetResponseCountries {
  _embedded: {
    countries: Country[]
  }
}
interface GetResponseStates {
  _embedded: {
    states: State[]
  }
}
