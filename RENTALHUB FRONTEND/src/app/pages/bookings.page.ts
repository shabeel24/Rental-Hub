import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../core/data.service';
import { Booking, errorText, rupees } from '../core/api';

const FLOW = ['REQUESTED', 'CONFIRMED', 'PICKED_UP', 'RETURNED', 'CLOSED'];
const LABEL: Record<string, string> = { REQUESTED: 'Requested', CONFIRMED: 'Paid', PICKED_UP: 'Picked up', RETURNED: 'Returned', CLOSED: 'Closed', CANCELLED: 'Cancelled' };

@Component({
  selector: 'app-bookings',
  imports: [RouterLink],
  template: `
  <section class="page wrap">
    <h1 class="display">My bookings</h1>
    @if (error()) { <p class="err">{{ error() }}</p> }
    @if (loading()) { <p class="muted">Loading…</p> }
    @else if (!list().length) {
      <div class="empty"><strong>No bookings yet</strong><a routerLink="/catalogue" class="link">Browse the catalogue</a></div>
    } @else {
      <div class="rows">
        @for (b of list(); track b.id; let i = $index) {
          <article class="b" [style.--i]="i">
            <div class="head">
              <div>
                <h2 class="h3">{{ b.equipmentName || 'Booking #' + b.id }}</h2>
                <p class="small">#{{ b.id }} · {{ b.quantity }} units · {{ b.startDate }} to {{ b.endDate }}</p>
              </div>
              <div class="amt"><b class="num">{{ rupees(b.totalAmount) }}</b><span class="small">incl. {{ rupees(b.depositAmount) }} deposit</span></div>
            </div>

            @if (b.status === 'CANCELLED') {
              <span class="tag bad">Cancelled</span>
            } @else {
              <ol class="track">
                @for (s of flow; track s; let k = $index) {
                  <li [class.done]="k <= idx(b)" [class.now]="k === idx(b)"><i></i><span>{{ label[s] }}</span></li>
                }
              </ol>
            }

            <div class="act">
              @if (b.status === 'REQUESTED') { <a [routerLink]="['/checkout', b.id]" class="btn btn-dark btn-sm">Pay now</a> }
              @if (b.status === 'REQUESTED' || b.status === 'CONFIRMED') {
                <button class="btn btn-line btn-danger btn-sm" (click)="cancel(b)">Cancel booking</button>
              }
              @if (b.status === 'CONFIRMED') { <span class="small">Cancelling a paid booking refunds it in full.</span> }
            </div>
          </article>
        }
      </div>
    }
  </section>`,
  styles: [`
  .page{padding-block:160px 120px;min-height:80vh} .rows{margin-top:48px;display:grid;gap:20px}
  .b{background:#fff;border:1px solid var(--line);border-radius:6px;padding:32px;animation:slideR .9s var(--ease) both;animation-delay:calc(var(--i) * 110ms);transition:transform .6s var(--ease),box-shadow .6s var(--ease),border-color .6s}
  .b:hover{transform:translateY(-4px);box-shadow:0 22px 40px -28px rgba(20,18,14,.5);border-color:#c9c3b3}
  .head{display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap} .head p{margin:4px 0 0}
  .amt{text-align:right} .amt b{display:block;font-weight:500;font-size:26px;letter-spacing:-.02em}
  .track{list-style:none;display:flex;margin:30px 0 8px;padding:0}
  .track li{flex:1;position:relative;font-size:13px;color:var(--stone);padding-top:20px}
  .track li i{position:absolute;top:0;left:0;width:11px;height:11px;border-radius:50%;background:var(--line);transition:background .6s}
  .track li::before{content:"";position:absolute;top:5px;left:11px;right:0;height:1px;background:var(--line)} .track li:last-child::before{display:none}
  .track li.done i{background:var(--moss)} .track li.done::before{background:var(--moss)} .track li.now{color:var(--ink);font-weight:500}
  .track li.now i{box-shadow:0 0 0 5px rgba(47,59,43,.15)}
  .act{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:20px}
  @media(max-width:600px){.track li span{font-size:11px}.b{padding:22px}}`]
})
export class BookingsPage implements OnInit {
  private data = inject(DataService);
  rupees = rupees; flow = FLOW; label = LABEL;
  list = signal<Booking[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit() { this.load(); }
  load() {
    this.data.myBookings().subscribe({
      next: l => { this.list.set([...l].sort((a, b) => b.id - a.id)); this.loading.set(false); },
      error: e => { this.error.set(errorText(e)); this.loading.set(false); }
    });
  }
  idx(b: Booking) { return FLOW.indexOf(b.status); }
  cancel(b: Booking) {
    if (!confirm('Cancel booking #' + b.id + '?')) return;
    this.data.cancel(b.id).subscribe({ next: () => this.load(), error: e => this.error.set(errorText(e)) });
  }
}
