import { Component, OnInit } from '@angular/core';
import { OktaAuthService } from '@okta/okta-angular';
import myAppConfig from '../../config/my-app-config';
import * as OktaSignIn from '@okta/okta-signin-widget';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  oktaSignIn: any;

  constructor(private oktaAuthService: OktaAuthService) {
    this.oktaSignIn = new OktaSignIn({
      logo: 'assets/images/logo.png',
      features: {
        registration: true
      },
      baseUrl: myAppConfig.oidc.issuer.split('/oauth2')[0],
      clientId: myAppConfig.oidc.clientId,
      redirectUri: myAppConfig.oidc.redirectUri,
      authParams: {
        pkce: true,
        issuer: myAppConfig.oidc.issuer,
        scopes: myAppConfig.oidc.scopes
      },
    });
  }

  ngOnInit(): void {
    this.oktaSignIn.remove();
    this.oktaSignIn.renderEl({
      el: '#okta-sign-in-widget'
    },
      resp => {
        if (resp.status === 'SUCCESS') {
          this.oktaAuthService.signInWithRedirect();
        }
      }, (err) => {
        throw err;
      });
  }

}
