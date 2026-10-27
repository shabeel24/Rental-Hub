import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  template: `
  <footer>
    <div class="wrap grid">
      <div>
        <div class="brand">Rental<b>Hub</b></div>
        <p>Tents, seating, sound and lighting for weddings, college fests and corporate events.</p>
      </div>
      <div>
        <h4>Rent</h4>
        <a routerLink="/catalogue">Catalogue</a>
        <a routerLink="/my-bookings">My bookings</a>
      </div>
      <div>
        <h4>Account</h4>
        <a routerLink="/sign-in">Sign in</a>
        <a routerLink="/sign-up">Register</a>
      </div>
    </div>
    <div class="wrap base">© 2026 RentalHub. Deposits are refunded after the equipment is returned.</div>
  </footer>`,
  styles: [`
  footer{background:var(--ink);color:var(--bone);padding:88px 0 28px;margin-top:0}
  .grid{display:grid;grid-template-columns:1.6fr 1fr 1fr;gap:48px}
  .brand{font-weight:300;font-size:28px;letter-spacing:-.02em;margin-bottom:14px} .brand b{font-weight:600}
  p{color:#A9A496;max-width:34ch;margin:0;font-weight:300}
  h4{margin:0 0 16px;font-weight:400;font-size:14px;color:#8C8778}
  a{display:block;padding:5px 0;opacity:.85;transition:opacity .3s,transform .3s} a:hover{opacity:1;transform:translateX(3px)}
  .base{margin-top:72px;padding-top:24px;border-top:1px solid #34301F;font-size:13px;color:#8C8778}
  @media(max-width:720px){.grid{grid-template-columns:1fr 1fr}.grid>div:first-child{grid-column:1/-1}}`]
})
export class FooterComponent {}
