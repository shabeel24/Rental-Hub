import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './shared/nav.component';
import { FooterComponent } from './shared/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavComponent, FooterComponent],
  template: `
  @if (splash()) {
    <div class="splash" [class.open]="open()" aria-hidden="true">
      <div class="half l"></div><div class="half r"></div>
      <div class="mark">
        <span class="mask"><span class="word">Rental<b>Hub</b></span></span>
        <i class="line"></i>
        <span class="mask"><em class="slogan">Event equipment, delivered</em></span>
      </div>
    </div>
  }
  <app-nav /><router-outlet /><app-footer />`,
  styles: [`
  .splash{position:fixed;inset:0;z-index:200;pointer-events:all;display:grid;place-items:center;color:var(--bone)}
  .splash.open{pointer-events:none}
  .half{position:absolute;top:0;bottom:0;width:50.5%;background:#1a140e;transition:transform 1.3s cubic-bezier(.76,0,.18,1)}
  .half.l{left:0;background:linear-gradient(90deg,#1a140e,#231a11)} .half.r{right:0;background:linear-gradient(270deg,#1a140e,#231a11)}
  .open .half.l{transform:translateX(-101%)} .open .half.r{transform:translateX(101%)}
  .mark{position:relative;text-align:center;transition:opacity .5s ease,transform 1s cubic-bezier(.2,.7,.1,1)}
  .open .mark{opacity:0;transform:scale(1.06)}
  .mask{display:block;overflow:hidden;padding:.08em 0}
  .word{display:block;font-weight:300;font-size:clamp(40px,7vw,84px);letter-spacing:-.03em;line-height:1.1;transform:translateY(110%);animation:up 1.1s cubic-bezier(.2,.7,.1,1) .25s forwards}
  .word b{font-weight:600}
  .line{display:block;height:1px;width:0;margin:18px auto 16px;background:#9AA68A;animation:grow 1.1s cubic-bezier(.2,.7,.1,1) .7s forwards}
  .slogan{display:block;font-style:normal;font-size:15px;font-weight:300;color:#B6AF9F;transform:translateY(120%);animation:up 1s cubic-bezier(.2,.7,.1,1) 1s forwards}
  @keyframes up{to{transform:none}} @keyframes grow{to{width:min(220px,40vw)}}`]
})
export class App implements OnInit {
  splash = signal(false);
  open = signal(false);

  ngOnInit() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = document.documentElement;
    root.classList.add('intro');
    this.splash.set(true);
    setTimeout(() => this.open.set(true), 2200);
    setTimeout(() => this.splash.set(false), 3700);
    setTimeout(() => root.classList.remove('intro'), 5200);
  }
}
