import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-nav',
  imports: [RouterLink, RouterLinkActive],
  template: `
  <header class="bar" [class.solid]="solid()">
    <a routerLink="/" class="brand">Rental<b>Hub</b></a>
    <nav class="links" [class.open]="open()">
      <a routerLink="/" routerLinkActive="on" [routerLinkActiveOptions]="{exact:true}" (click)="open.set(false)">Home</a>
      <a routerLink="/catalogue" routerLinkActive="on" (click)="open.set(false)">Catalogue</a>
      @if (auth.loggedIn()) {
        <a routerLink="/my-bookings" routerLinkActive="on" (click)="open.set(false)">My bookings</a>
      }
      @if (auth.role() === 'ADMIN') {
        <a routerLink="/admin" routerLinkActive="on" (click)="open.set(false)">Admin</a>
      }
    </nav>
    <div class="end">
      @if (auth.loggedIn()) {
        <span class="who">{{ auth.email() }}</span>
        <button class="cta" (click)="out()">Sign out</button>
      } @else {
        <a routerLink="/sign-in" class="plain">Sign in</a>
        <a routerLink="/sign-up" class="cta">Register</a>
      }
      <button class="burger" aria-label="Menu" (click)="open.set(!open())"><i></i><i></i></button>
    </div>
  </header>`,
  styles: [`
  .bar{view-transition-name:nav;position:fixed;z-index:50;top:18px;left:50%;transform:translateX(-50%);width:min(1100px,calc(100% - 32px));
    display:flex;align-items:center;gap:28px;padding:10px 12px 10px 28px;border-radius:999px;
    background:rgba(24,20,14,.8);backdrop-filter:blur(18px) saturate(1.2);-webkit-backdrop-filter:blur(18px) saturate(1.2);
    border:1px solid rgba(237,234,226,.12);color:var(--bone);transition:background .5s var(--ease)}
  .bar.solid{background:rgba(24,20,14,.88)}
  .brand{font-weight:300;font-size:20px;letter-spacing:-.02em} .brand b{font-weight:600}
  .links{display:flex;gap:26px;margin-left:12px;flex:1}
  .links a{font-size:14px;opacity:.7;transition:opacity .3s;position:relative;padding:4px 0}
  .links a:hover,.links a.on{opacity:1}
  .links a::after{content:"";position:absolute;left:0;right:0;bottom:-2px;height:1px;background:var(--sage);transform:scaleX(0);transform-origin:right;transition:transform .55s var(--ease)}
  .links a:hover::after,.links a.on::after{transform:scaleX(1);transform-origin:left}
  .end{display:flex;align-items:center;gap:16px}
  .who{font-size:13px;opacity:.6;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .plain{font-size:14px;opacity:.85}
  .cta{position:relative;overflow:hidden;isolation:isolate;background:var(--bone);color:var(--ink);border:0;border-radius:999px;padding:9px 20px;font-size:14px;font-weight:500;transition:color .4s var(--ease)}
  .cta::before{content:"";position:absolute;inset:0;z-index:-1;background:var(--sage);transform:translateX(-101%);transition:transform .55s var(--ease)}
  .cta:hover::before{transform:none}
  .burger{display:none;background:none;border:0;width:36px;height:36px;position:relative}
  .burger i{position:absolute;left:8px;right:8px;height:1.5px;background:var(--bone)} .burger i:first-child{top:14px} .burger i:last-child{top:21px}
  @media(max-width:820px){
    .bar{padding-left:20px;gap:12px} .who{display:none}
    .burger{display:block}
    .links{position:absolute;top:calc(100% + 10px);left:0;right:0;flex-direction:column;gap:0;margin:0;padding:12px 24px;border-radius:24px;
      background:rgba(24,20,14,.96);display:none}
    .links.open{display:flex} .links a{padding:14px 0;font-size:16px}
    .links{flex:none} .end{margin-left:auto}
  }`]
})
export class NavComponent {
  auth = inject(AuthService);
  private router = inject(Router);
  solid = signal(false);
  open = signal(false);
  @HostListener('window:scroll') onScroll() {
    this.solid.set(window.scrollY > 40);
  }
  out() { this.auth.logout(); this.router.navigate(['/']); }
}
