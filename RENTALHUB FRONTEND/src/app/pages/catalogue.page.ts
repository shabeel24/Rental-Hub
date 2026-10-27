import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DataService } from '../core/data.service';
import { Equipment, errorText, rupees } from '../core/api';
import { SAMPLE } from '../core/sample';
import { GlyphComponent } from '../shared/glyph.component';

@Component({
  selector: 'app-catalogue',
  imports: [RouterLink, GlyphComponent],
  template: `
  <section class="top">
    <div class="wrap">
      <h1 class="display">The collection</h1>
      <p class="lede">Everything is priced per day. Deposits are refundable.</p>
      <div class="tools">
        <input class="input" type="search" placeholder="Search tents, chairs, speakers" [value]="q()" (input)="onSearch($any($event.target).value)" aria-label="Search equipment">
        <div class="chips">
          <button [class.on]="!cat()" (click)="pick('')">All</button>
          @for (c of cats(); track c) { <button [class.on]="cat() === c" (click)="pick(c)">{{ c }}</button> }
        </div>
      </div>
    </div>
  </section>

  <section class="wrap list">
    @if (offline()) { <p class="notice">{{ error() }} Showing sample items.</p> }
    @if (loading()) {
      <div class="grid">@for (n of [1,2,3,4]; track n) { <div class="ghost"></div> }</div>
    } @else if (!shown().length) {
      <div class="empty"><strong>Nothing matches that search</strong>Try a different word or clear the category filter.</div>
    } @else {
      <p class="small count">{{ shown().length }} {{ shown().length === 1 ? 'item' : 'items' }}</p>
      <div class="grid">
        @for (e of shown(); track e.id; let i = $index) {
          <a [routerLink]="['/catalogue', e.id]" class="card" [style.--i]="i">
            <div class="art"><app-glyph [name]="e.name" [category]="e.category" /><span class="cat">{{ e.category }}</span><span class="peek">Reserve</span></div>
            <h3 class="h3">{{ e.name }}</h3>
            <p class="small">{{ e.description }}</p>
            <div class="row">
              <span><b class="num">{{ rupees(e.pricePerDay) }}</b> <i>per day</i></span>
              
            </div>
            <p class="small dep">Refundable deposit {{ rupees(e.depositAmount) }} · {{ e.totalStock }} in stock</p>
          </a>
        }
      </div>
    }
  </section>`,
  styles: [`
  .top{background:var(--umber);color:var(--bone);padding:170px 0 64px}
  .top .lede{color:#B6AF9F;margin:18px 0 44px}
  .tools{display:grid;grid-template-columns:minmax(260px,1fr) auto;gap:32px;align-items:end}
  .top .input{border-bottom-color:#6b6455;color:var(--bone)} .top .input::placeholder{color:#8f8979} .top .input:focus{border-bottom-color:var(--sage);box-shadow:0 1px 0 var(--sage)}
  .chips{display:flex;gap:8px;flex-wrap:wrap}
  .chips button{position:relative;overflow:hidden;isolation:isolate;background:transparent;border:1px solid #5a5345;color:#cfc8b8;padding:8px 18px;border-radius:999px;font-size:14px;transition:color .45s var(--ease),border-color .45s var(--ease)}
  .chips button::before{content:"";position:absolute;inset:0;z-index:-1;background:var(--bone);transform:translateY(101%);transition:transform .5s var(--ease)}
  .chips button:hover::before,.chips button.on::before{transform:none} .chips button:hover,.chips button.on{color:var(--ink)}
  .chips button:hover,.chips button.on{border-color:var(--bone)}
  .list{padding-block:56px 120px;min-height:50vh}
  .count{margin:0 0 24px}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:44px 28px}
  .card{display:block;animation:rise .9s var(--ease) both;animation-delay:calc(var(--i) * 70ms)}
  .art{position:relative;overflow:hidden;aspect-ratio:1;background:var(--bone);display:grid;place-items:center;padding:23%;margin-bottom:20px;border-radius:4px;transition:background .7s var(--ease),color .7s var(--ease)}
  app-glyph{transition:transform .9s var(--ease)} .card:hover app-glyph{transform:scale(1.08)}
  .peek{position:absolute;left:0;right:0;bottom:0;padding:14px 0;text-align:center;font-size:14px;background:var(--bone);color:var(--ink);transform:translateY(101%);transition:transform .6s var(--ease)} .card:hover .peek{transform:none}
  .card h3{transition:transform .6s var(--ease)} .card:hover h3{transform:translateX(6px)}
  .card:hover .art{background:var(--moss);color:var(--bone)}
  .cat{position:absolute;left:16px;top:14px;font-size:13px;color:var(--stone);transition:color .5s} .card:hover .cat{color:#B6C0A9}
  .card p{margin:4px 0 16px}
  .row{display:flex;justify-content:space-between;align-items:baseline}
  .row b{font-weight:500;font-size:22px} .row i{font-style:normal;color:var(--stone);font-size:14px}
  
  .dep{margin:10px 0 0!important}
  .ghost{aspect-ratio:1;background:linear-gradient(100deg,var(--bone) 30%,#f3f1ea 50%,var(--bone) 70%);background-size:300% 100%;animation:sh 1.6s linear infinite;border-radius:4px}
  @keyframes sh{to{background-position:-100% 0}}
  @media(max-width:720px){.tools{grid-template-columns:1fr}}`]
})
export class CataloguePage implements OnInit {
  private data = inject(DataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  rupees = rupees;
  all = signal<Equipment[]>([]);
  loading = signal(true);
  offline = signal(false);
  error = signal('');
  q = signal('');
  cat = signal('');
  private t?: any;

  cats = computed(() => [...new Set(this.all().map(i => i.category))].sort());
  shown = computed(() => {
    const q = this.q().trim().toLowerCase();
    return this.all().filter(i =>
      (!this.cat() || i.category.toLowerCase() === this.cat().toLowerCase()) &&
      (!q || (i.name + ' ' + i.description).toLowerCase().includes(q)));
  });

  ngOnInit() {
    this.route.queryParamMap.subscribe(p => { this.cat.set(p.get('category') ?? ''); });
    this.data.equipment().subscribe({
      next: l => { this.all.set(l); this.loading.set(false); },
      error: e => { this.all.set(SAMPLE); this.offline.set(true); this.error.set(errorText(e)); this.loading.set(false); }
    });
  }
  onSearch(v: string) { clearTimeout(this.t); this.t = setTimeout(() => this.q.set(v), 150); }
  pick(c: string) { this.router.navigate([], { queryParams: { category: c || null }, queryParamsHandling: 'merge' }); }
}
