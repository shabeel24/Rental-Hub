import { AfterViewInit, Directive, ElementRef, OnDestroy, inject } from '@angular/core';

const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Splits a heading into words that slide up one by one when it scrolls into view. */
@Directive({ selector: '[appSplit]' })
export class SplitDirective implements AfterViewInit, OnDestroy {
  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  private io?: IntersectionObserver;
  ngAfterViewInit() {
    const host = this.el.nativeElement;
    if (reduced() || typeof IntersectionObserver === 'undefined') return;
    host.setAttribute('aria-label', host.textContent?.replace(/\s+/g, ' ').trim() ?? '');
    let n = 0;
    const frag = document.createDocumentFragment();
    host.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        (node.textContent ?? '').split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(' '); return; }
          const w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
          const inner = document.createElement('span'); inner.style.setProperty('--i', String(n++)); inner.textContent = part;
          w.append(inner); frag.append(w);
        });
      } else frag.append(node.cloneNode(true));
    });
    host.replaceChildren(frag);
    host.classList.add('split');
    this.io = new IntersectionObserver(es => {
      if (es.some(e => e.isIntersecting)) { host.classList.add('in'); this.io?.disconnect(); }
    }, { threshold: 0.3 });
    this.io.observe(host);
  }
  ngOnDestroy() { this.io?.disconnect(); }
}
