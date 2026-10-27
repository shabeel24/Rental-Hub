import { Directive, ElementRef, Input, OnChanges, OnDestroy, inject } from '@angular/core';

// Counts up to the given number when it first becomes visible.
@Directive({ selector: '[appCountUp]' })
export class CountUpDirective implements OnChanges, OnDestroy {
  @Input('appCountUp') target = 0;
  @Input() delay = 0;
  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  private raf = 0;
  private timer?: any;

  ngOnChanges() {
    cancelAnimationFrame(this.raf); clearTimeout(this.timer);
    const node = this.el.nativeElement;
    const to = Number(this.target) || 0;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || to === 0) { node.textContent = String(to); return; }
    node.textContent = '0';
    this.timer = setTimeout(() => {
      const t0 = performance.now(), dur = 1600;
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        node.textContent = Math.round(to * (1 - Math.pow(1 - p, 4))).toLocaleString('en-IN');
        if (p < 1) this.raf = requestAnimationFrame(tick);
      };
      this.raf = requestAnimationFrame(tick);
    }, this.delay);
  }
  ngOnDestroy() { cancelAnimationFrame(this.raf); clearTimeout(this.timer); }
}
