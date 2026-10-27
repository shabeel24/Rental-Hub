import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../core/data.service';
import { Booking, Equipment, UserRow, errorText, rupees } from '../core/api';

type Tab = 'items' | 'bookings' | 'users';
const NEXT: Record<string, { to: string; label: string }> = {
  CONFIRMED: { to: 'PICKED_UP', label: 'Mark picked up' },
  PICKED_UP: { to: 'RETURNED', label: 'Mark returned' },
};

@Component({
  selector: 'app-admin',
  imports: [ReactiveFormsModule],
  templateUrl: './admin.page.html',
  styleUrl: './admin.page.scss'
})
export class AdminPage implements OnInit {
  private data = inject(DataService);
  private fb = inject(FormBuilder);
  rupees = rupees; next = NEXT;
  tab = signal<Tab>('items');
  items = signal<Equipment[]>([]);
  bookings = signal<Booking[]>([]);
  users = signal<UserRow[]>([]);
  error = signal(''); msg = signal('');
  editing = signal<boolean>(false);
  settling = signal<number | null>(null);

  active = computed(() => this.items().filter(i => i.active).length);
  pendingVendors = computed(() => this.users().filter(u => u.role === 'VENDOR' && !u.enabled).length);

  form = this.fb.nonNullable.group({
    id: [0], name: ['', Validators.required], description: [''], category: ['', Validators.required],
    pricePerDay: [0, [Validators.required, Validators.min(0)]], depositAmount: [0, [Validators.required, Validators.min(0)]],
    totalStock: [1, [Validators.required, Validators.min(0)]], imageUrl: [''], active: [true]
  });
  settleForm = this.fb.nonNullable.group({ deduction: [0, [Validators.min(0)]], reason: [''] });

  ngOnInit() { this.loadAll(); }
  loadAll() {
    this.data.adminEquipment().subscribe({ next: l => this.items.set(l), error: e => this.fail(e) });
    this.data.adminBookings().subscribe({ next: l => this.bookings.set([...l].sort((a, b) => b.id - a.id)), error: e => this.fail(e) });
    this.data.users().subscribe({ next: l => this.users.set(l), error: e => this.fail(e) });
  }
  private fail(e: any) { this.error.set(errorText(e)); this.msg.set(''); }
  private ok(m: string) { this.msg.set(m); this.error.set(''); setTimeout(() => this.msg.set(''), 3500); }

  // items
  newItem() { this.form.reset({ id: 0, name: '', description: '', category: '', pricePerDay: 0, depositAmount: 0, totalStock: 1, imageUrl: '', active: true }); this.editing.set(true); }
  edit(i: Equipment) { this.form.reset({ ...i, imageUrl: i.imageUrl ?? '' } as any); this.editing.set(true); }
  save() {
    if (this.form.invalid) { this.error.set('Name, category, price, deposit and stock are required, and none can be negative.'); return; }
    const v = this.form.getRawValue();
    const body: Partial<Equipment> = { ...v, id: v.id || undefined };
    this.data.saveEquipment(body).subscribe({
      next: () => { this.editing.set(false); this.ok(v.id ? 'Item updated' : 'Item added'); this.loadAll(); },
      error: e => this.fail(e)
    });
  }
  remove(i: Equipment) {
    if (!confirm(`Remove ${i.name} from the catalogue? You can restore it later.`)) return;
    this.data.removeEquipment(i.id).subscribe({ next: () => { this.ok('Item removed'); this.loadAll(); }, error: e => this.fail(e) });
  }
  restore(i: Equipment) {
    this.data.saveEquipment({ ...i, active: true }).subscribe({ next: () => { this.ok('Item restored'); this.loadAll(); }, error: e => this.fail(e) });
  }

  // bookings
  advance(b: Booking) {
    const n = NEXT[b.status]; if (!n) return;
    this.data.setStatus(b.id, n.to).subscribe({ next: () => { this.ok('Booking ' + b.id + ' is now ' + n.to.toLowerCase().replace('_', ' ')); this.loadAll(); }, error: e => this.fail(e) });
  }
  openSettle(b: Booking) { this.settleForm.reset({ deduction: 0, reason: '' }); this.settling.set(b.id); }
  settle(b: Booking) {
    const v = this.settleForm.getRawValue();
    if (v.deduction > 0 && !v.reason.trim()) { this.error.set('Write a reason when you deduct from the deposit.'); return; }
    this.data.settle(b.id, v.deduction, v.reason.trim()).subscribe({
      next: () => { this.settling.set(null); this.ok('Deposit settled. Booking closed.'); this.loadAll(); }, error: e => this.fail(e)
    });
  }

  // users
  approve(u: UserRow) {
    this.data.approveVendor(u.id).subscribe({ next: () => { this.ok(u.fullName + ' can now sign in'); this.loadAll(); }, error: e => this.fail(e) });
  }
  tagClass(s: string) { return s === 'CLOSED' || s === 'CONFIRMED' ? 'good' : s === 'CANCELLED' ? 'bad' : 'wait'; }
}
