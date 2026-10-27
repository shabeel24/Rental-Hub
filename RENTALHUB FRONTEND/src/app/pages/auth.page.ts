import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { errorText } from '../core/api';

@Component({
  selector: 'app-auth',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
  <main class="split">
    <section class="art sl">
      <div class="shaft"></div>
      <div class="art-in">
        <p class="big">Welcome to a calmer way to plan.</p>
        <p class="note">Tents, seating, sound and lighting for weddings, college fests and corporate events.</p>
      </div>
    </section>
    <section class="form-side">
      <form [formGroup]="form" (ngSubmit)="submit()" class="box sr">
        <h1 class="title">{{ up() ? 'Create your account' : 'Sign in' }}</h1>
        <p class="small intro">{{ up() ? 'Customers can book straight away. Vendors are approved by an admin first.' : 'Use the email and password you registered with.' }}</p>

        @if (up()) {
          <label class="field"><span>Full name</span><input class="input" formControlName="fullName" autocomplete="name"></label>
        }
        <label class="field"><span>Email</span><input class="input" type="email" formControlName="email" autocomplete="email"></label>
        <label class="field"><span>Password{{ up() ? ' (at least 8 characters)' : '' }}</span><input class="input" type="password" formControlName="password" [autocomplete]="up() ? 'new-password' : 'current-password'"></label>
        @if (up()) {
          <label class="field"><span>I am a</span>
            <select class="input" formControlName="role"><option value="CUSTOMER">Customer</option><option value="VENDOR">Vendor</option></select>
          </label>
        }

        @if (error()) { <p class="err" role="alert">{{ error() }}</p> }
        @if (info()) { <p class="ok" role="status">{{ info() }}</p> }

        <button class="btn btn-dark full" [disabled]="busy()">{{ busy() ? 'Please wait…' : (up() ? 'Create account' : 'Sign in') }}</button>
        <p class="small switch">
          @if (up()) { Already registered? <a class="link" routerLink="/sign-in">Sign in</a> }
          @else { New here? <a class="link" routerLink="/sign-up">Create an account</a> }
        </p>
      </form>
    </section>
  </main>`,
  styles: [`
  .split{display:grid;grid-template-columns:1fr 1fr;min-height:100vh}
  .art{position:relative;background:linear-gradient(180deg,#3a2e20,#1a140e);color:var(--bone);display:flex;align-items:flex-end;padding:64px;overflow:hidden}
  .shaft{position:absolute;top:-10%;left:-10%;width:90%;height:120%;background:linear-gradient(105deg,transparent 5%,rgba(255,224,168,.24) 40%,transparent 80%);filter:blur(28px);transform:skewX(-12deg);animation:d 14s ease-in-out infinite alternate}
  @keyframes d{to{transform:skewX(-8deg) translateX(12%)}}
  .art-in{position:relative;max-width:460px}
  .big{font-weight:300;font-size:clamp(34px,4vw,56px);line-height:1.08;letter-spacing:-.03em;margin:0 0 18px}
  .note{color:#B6AF9F;margin:0;font-weight:300}
  .form-side{display:flex;align-items:center;justify-content:center;padding:130px 32px 64px}
  .box{width:100%;max-width:400px}
  .title{font-size:clamp(32px,3.4vw,44px);margin-bottom:10px} .intro{margin:0 0 36px}
  .full{width:100%;margin-top:8px} .switch{text-align:center;margin-top:24px}
  @media(max-width:860px){.split{grid-template-columns:1fr}.art{display:none}.form-side{padding-top:140px}}`]
})
export class AuthPage implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  up = signal(false);
  busy = signal(false);
  error = signal('');
  info = signal('');

  form = this.fb.nonNullable.group({
    fullName: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['CUSTOMER' as 'CUSTOMER' | 'VENDOR']
  });

  ngOnInit() {
    this.route.data.subscribe(d => { this.up.set(d['mode'] === 'up'); this.error.set(''); this.info.set(''); });
  }

  submit() {
    this.error.set(''); this.info.set('');
    const v = this.form.getRawValue();
    if (this.form.invalid || (this.up() && !v.fullName.trim())) { this.error.set('Enter a valid email, your name (when registering) and a password.'); return; }
    this.busy.set(true);
    if (this.up()) {
      this.auth.register(v.fullName.trim(), v.email.trim(), v.password, v.role).subscribe({
        next: () => {
          this.busy.set(false);
          if (v.role === 'VENDOR') { this.info.set('Account created. An admin must approve your vendor account before you can sign in.'); return; }
          this.auth.login(v.email.trim(), v.password).subscribe({ next: () => this.done(), error: e => { this.error.set(errorText(e)); } });
        },
        error: e => { this.error.set(errorText(e)); this.busy.set(false); }
      });
    } else {
      this.auth.login(v.email.trim(), v.password).subscribe({
        next: () => this.done(),
        error: e => { this.error.set(e?.status === 401 ? 'Email or password is wrong.' : errorText(e)); this.busy.set(false); }
      });
    }
  }

  private done() {
    this.busy.set(false);
    const back = this.route.snapshot.queryParamMap.get('returnUrl');
    this.router.navigateByUrl(back || (this.auth.role() === 'ADMIN' ? '/admin' : '/catalogue'));
  }
}
