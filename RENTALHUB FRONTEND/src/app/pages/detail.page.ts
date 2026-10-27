import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataService } from '../core/data.service';
import { AuthService } from '../core/auth.service';
import { Equipment, errorText, rupees } from '../core/api';
import { SAMPLE } from '../core/sample';
import { quote, todayIso } from '../core/pricing';
import { GlyphComponent } from '../shared/glyph.component';

@Component({
  selector: 'app-detail',
  imports: [FormsModule, RouterLink, GlyphComponent],
  template: `
  @if (item(); as e) {
  <section class="page wrap">
    <a routerLink="/catalogue" class="back small">‹ Catalogue</a>
    <div class="split">
      <div class="left sl">
        <div class="art"><app-glyph [name]="e.name" [category]="e.category" /></div>
        <p class="small cat">{{ e.category }}</p>
        <h1 class="display">{{ e.name }}</h1>
        <p class="lede">{{ e.description }}</p>
        <dl>
          <div><dt>Per day</dt><dd class="num">{{ rupees(e.pricePerDay) }}</dd></div>
          <div><dt>Refundable deposit</dt><dd class="num">{{ rupees(e.depositAmount) }}</dd></div>
          <div><dt>In stock</dt><dd class="num">{{ e.totalStock }}</dd></div>
        </dl>
        <p class="small">Rent 3 days or more and save 10%. Rent 7 days or more and save 15%.</p>
      </div>

      <form class="panel sr" (ngSubmit)="reserve()" #f="ngForm">
        <h2 class="h3">Reserve</h2>
        <label class="field"><span>Start date</span><input class="input" type="date" name="s" [min]="today" [ngModel]="start()" (ngModelChange)="start.set($event)" required></label>
        <label class="field"><span>End date</span><input class="input" type="date" name="e" [min]="start() || today" [ngModel]="end()" (ngModelChange)="end.set($event)" required></label>
        <div class="field"><span>Quantity</span>
          <div class="step">
            <button type="button" (click)="qty.set(Math.max(1, qty() - 1))" aria-label="Fewer">−</button>
            <input class="num" type="number" name="q" min="1" [max]="e.totalStock" [ngModel]="qty()" (ngModelChange)="qty.set($event || 1)">
            <button type="button" (click)="qty.set(Math.min(e.totalStock, qty() + 1))" aria-label="More">+</button>
          </div>
        </div>

        @if (q(); as q) {
          <div class="quote">
            <div><span>{{ q.days }} {{ q.days === 1 ? 'day' : 'days' }} × {{ qty() }}</span><b class="num">{{ rupees(e.pricePerDay * qty() * q.days) }}</b></div>
            @if (q.discountPct) { <div class="save"><span>{{ q.discountPct }}% long-rental discount</span><b class="num">− {{ rupees(e.pricePerDay * qty() * q.days - q.rent) }}</b></div> }
            <div><span>Refundable deposit</span><b class="num">{{ rupees(q.deposit) }}</b></div>
            <div class="total"><span>Total to pay</span><b class="num">{{ rupees(q.total) }}</b></div>
          </div>
        } @else {
          <p class="small hint">Choose your dates to see the price.</p>
        }

        @if (error()) { <p class="err">{{ error() }}</p> }
        <button class="btn btn-dark full" [disabled]="!q() || busy()">
          {{ auth.loggedIn() ? (busy() ? 'Reserving…' : 'Reserve and continue to payment') : 'Sign in to reserve' }}
        </button>
      </form>
    </div>
  </section>
  } @else if (missing()) {
    <div class="wrap page empty"><strong>We could not find that item</strong><a routerLink="/catalogue" class="link">Back to the catalogue</a></div>
  }`,
  styles: [`
  .page{padding-block:150px 120px;min-height:80vh}
  .back{display:inline-block;margin-bottom:28px} .back:hover{color:var(--moss)}
  .split{display:grid;grid-template-columns:1.15fr 1fr;gap:80px;align-items:start}
  .art{width:min(220px,50%);aspect-ratio:1;color:var(--moss);margin-bottom:34px}
  .cat{margin:0 0 10px} .left .display{font-size:clamp(40px,5vw,72px)} .left .lede{margin:20px 0 40px}
  dl{display:grid;grid-template-columns:repeat(3,auto);gap:12px 44px;margin:0 0 28px;justify-content:start}
  dt{font-size:14px;color:var(--stone)} dd{margin:0;font-weight:300;font-size:30px;letter-spacing:-.02em}
  .panel{background:#fff;padding:40px;border:1px solid var(--line);border-radius:6px;position:sticky;top:110px}
  .panel .h3{margin-bottom:28px}
  .step{display:flex;align-items:center;border-bottom:1px solid var(--ink);height:48px}
  .step button{background:none;border:0;width:40px;height:40px;font-size:22px;border-radius:50%;transition:background .3s} .step button:hover{background:var(--bone)}
  .step input{flex:1;text-align:center;border:0;background:none;font:inherit;font-size:18px;outline:none;-moz-appearance:textfield}
  .step input::-webkit-inner-spin-button{appearance:none}
  .quote{border-top:1px solid var(--line);padding-top:18px;margin-bottom:26px;animation:rise .6s var(--ease)}
  .quote div{display:flex;justify-content:space-between;padding:6px 0;font-size:15px;color:var(--stone)} .quote b{font-weight:400;color:var(--ink)}
  .quote .save b,.quote .save{color:var(--ok)}
  .quote .total{margin-top:10px;padding-top:16px;border-top:1px solid var(--ink);color:var(--ink);font-size:17px} .quote .total b{font-weight:500;font-size:24px}
  .hint{margin:0 0 24px} .full{width:100%}
  @media(max-width:900px){.split{grid-template-columns:1fr;gap:48px}.panel{position:static;padding:28px}}`]
})
export class DetailPage implements OnInit {
  private data = inject(DataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  auth = inject(AuthService);
  rupees = rupees; Math = Math;
  today = todayIso();
  item = signal<Equipment | null>(null);
  missing = signal(false);
  error = signal('');
  busy = signal(false);
  qty = signal(1);
  start = signal(''); end = signal('');

  q = computed(() => { const e = this.item();
    return e ? quote(e.pricePerDay, e.depositAmount, this.qty(), this.start(), this.end()) : null; });

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.data.equipmentById(id).subscribe({
      next: e => this.item.set(e),
      error: err => {
        const s = SAMPLE.find(x => x.id === id);
        if (err.status === 0 && s) this.item.set(s); else this.missing.set(true);
      }
    });
  }

  reserve() {
    const e = this.item(); if (!e || !this.q()) return;
    if (!this.auth.loggedIn()) { this.router.navigate(['/sign-in'], { queryParams: { returnUrl: this.router.url } }); return; }
    this.busy.set(true); this.error.set('');
    this.data.createBooking({ equipmentId: e.id, quantity: this.qty(), startDate: this.start(), endDate: this.end() }).subscribe({
      next: b => this.router.navigate(['/checkout', b.id]),
      error: err => { this.error.set(errorText(err)); this.busy.set(false); }
    });
  }
}
