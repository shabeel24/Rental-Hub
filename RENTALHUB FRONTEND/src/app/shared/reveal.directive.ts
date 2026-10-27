import { Directive, ElementRef, OnDestroy, OnInit, inject } from '@angular/core';

// Adds the class "in" once the element scrolls into view. Used sparingly.
@Directive({ selector: '[appReveal]' })
export class RevealDirective implements OnInit, OnDestroy {
  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  private io?: IntersectionObserver;
  ngOnInit() {
    const node = this.el.nativeElement;
    if (typeof IntersectionObserver === 'undefined') { node.classList.add('in'); return; }
    this.io = new IntersectionObserver(es => {
      if (es.some(e => e.isIntersecting)) { node.classList.add('in'); this.io?.disconnect(); }
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    this.io.observe(node);
  }
  ngOnDestroy() { this.io?.disconnect(); }
}
