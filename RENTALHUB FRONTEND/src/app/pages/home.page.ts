import { Component, ElementRef, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../core/data.service';
import { Equipment, rupees } from '../core/api';
import { SAMPLE } from '../core/sample';
import { CountUpDirective } from '../shared/countup.directive';
import { RevealDirective } from '../shared/reveal.directive';
import { GlyphComponent } from '../shared/glyph.component';
import { SplitDirective } from '../shared/motion.directives';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CountUpDirective, RevealDirective, GlyphComponent, SplitDirective],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss'
})
export class HomePage implements OnInit {
  private data = inject(DataService);
  items = signal<Equipment[]>(SAMPLE);
  offline = signal(false);
  rupees = rupees;

  units = computed(() => this.items().reduce((n, i) => n + i.totalStock, 0));
  categories = computed(() => {
    const map = new Map<string, Equipment[]>();
    for (const i of this.items()) map.set(i.category, [...(map.get(i.category) ?? []), i]);
    return [...map.entries()].map(([name, list]) => ({ name, count: list.length, sample: list[0] }));
  });
  featured = computed(() => this.items());
  startDelay = document.documentElement.classList.contains('intro') ? 1900 : 0;
  @ViewChild('track') track?: ElementRef<HTMLElement>;
  progress = signal(25);
  slide(dir: number) {
    const t = this.track?.nativeElement; if (!t) return;
    const card = t.querySelector<HTMLElement>('.slide'); const step = (card?.offsetWidth ?? 300) + 28;
    t.scrollBy({ left: dir * step * 2, behavior: 'smooth' });
  }
  onSlide() {
    const t = this.track?.nativeElement; if (!t) return;
    const max = t.scrollWidth - t.clientWidth;
    this.progress.set(max > 0 ? 25 + 75 * (t.scrollLeft / max) : 100);
  }

  steps = [
    { n: '1', t: 'Choose', d: 'Pick what you need and the dates. The price and deposit are shown before you commit.' },
    { n: '2', t: 'Reserve', d: 'Send the request in one step. Longer rentals earn a discount automatically.' },
    { n: '3', t: 'Pay', d: 'Pay the rent and the refundable deposit together, securely online.' },
    { n: '4', t: 'Return', d: 'Hand the equipment back. Your deposit returns, less any written damage deduction.' },
  ];

  ngOnInit() {
    this.data.equipment().subscribe({
      next: list => { if (list.length) this.items.set(list); },
      error: () => this.offline.set(true)
    });
  }
}
