import { Component, Input } from '@angular/core';

// Line drawings for each equipment type, so the catalogue looks designed without photos.
@Component({
  selector: 'app-glyph',
  template: `
  <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    @switch (kind) {
      @case ('chair') { <path d="M38 14h38l-4 46H42z"/><path d="M34 60h50v12H34z"/><path d="M38 72l-6 34M80 72l6 34M44 72v34M74 72v34"/> }
      @case ('table') { <ellipse cx="60" cy="48" rx="44" ry="14"/><path d="M60 62v38M40 104h40"/><path d="M16 48v6c0 8 20 14 44 14s44-6 44-14v-6"/> }
      @case ('tent') { <path d="M10 98L60 20l50 78z"/><path d="M60 20v78M60 98L36 98M60 98h24"/><path d="M60 20c-8 30-8 50 0 78M60 20c8 30 8 50 0 78"/> }
      @case ('sound') { <rect x="30" y="12" width="60" height="96" rx="6"/><circle cx="60" cy="74" r="20"/><circle cx="60" cy="74" r="7"/><circle cx="60" cy="34" r="8"/> }
      @case ('light') { <path d="M42 18h36l8 30H34z"/><path d="M34 48h52"/><path d="M60 48v18M40 108l20-42 20 42"/><path d="M44 30h32" /> }
      @default { <path d="M14 38l46-22 46 22v50L60 110 14 88z"/><path d="M14 38l46 22 46-22M60 60v50"/> }
    }
  </svg>`,
  styles: [`:host{display:block} svg{width:100%;height:100%}`]
})
export class GlyphComponent {
  @Input() name = '';
  @Input() category = '';
  get kind() {
    const t = (this.name + ' ' + this.category).toLowerCase();
    return /chair|seat|sofa|stool/.test(t) ? 'chair'
      : /table|desk/.test(t) ? 'table'
      : /tent|canopy|shamiana|pandal/.test(t) ? 'tent'
      : /speaker|sound|mic/.test(t) ? 'sound'
      : /light|lamp|led/.test(t) ? 'light' : 'box';
  }
}
