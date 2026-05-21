import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';
import { MustMatch } from '@app/_helpers';

@Component({
    standalone: false,
    templateUrl: 'register.component.html',
    styles: [`
        :host ::ng-deep .form-control,
        :host ::ng-deep .form-select {
            background-color: #242424 !important;
            border: 1px solid #333 !important;
            color: #ffffff !important;
            border-radius: 10px !important;
        }
        :host ::ng-deep .form-control::placeholder {
            color: #555 !important;
        }
        :host ::ng-deep .form-control:focus,
        :host ::ng-deep .form-select:focus {
            background-color: #2c2c2c !important;
            border-color: #C1121F !important;
            box-shadow: 0 0 0 3px rgba(193, 18, 31, 0.2) !important;
        }
        :host ::ng-deep .form-label {
            color: #888 !important;
        }
        :host ::ng-deep .form-check-label {
            color: #888 !important;
        }
    `]
})
export class RegisterComponent implements OnInit {
    form!: FormGroup;
    submitting = false;
    submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.form = this.formBuilder.group({
            title: ['', Validators.required],
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required],
            acceptTerms: [false, Validators.requiredTrue]
        }, {
            validator: MustMatch('password', 'confirmPassword')
        });
    }

    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;
        this.alertService.clear();

        if (this.form.invalid) {
            return;
        }

        this.submitting = true;
        this.accountService.register(this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Registration successful, please check your email for verification instructions', { keepAfterRouteChange: true });
                    this.router.navigate(['../login'], { relativeTo: this.route });
                },
                error: error => {
                    this.alertService.error(error);
                    this.submitting = false;
                }
            });
    }
}