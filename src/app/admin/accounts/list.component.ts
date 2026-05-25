import { Component, OnInit, OnDestroy } from '@angular/core';
import { first, timeout } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { AccountService } from '@app/_services';

@Component({ standalone: false, templateUrl: 'list.component.html' })
export class ListComponent implements OnInit, OnDestroy {
    accounts?: any[];
    loading = false;
    loadError = '';
    slowLoad = false;
    private slowTimer?: any;
    private sub?: Subscription;

    constructor(private accountService: AccountService) { }

    ngOnInit() {
        this.loadAccounts();
    }

    loadAccounts() {
        this.loading = true;
        this.loadError = '';
        this.slowLoad = false;

        // Show a "taking longer than usual" hint after 8 seconds
        this.slowTimer = setTimeout(() => {
            if (this.loading) this.slowLoad = true;
        }, 8000);

        this.sub = this.accountService.getAll()
            .pipe(
                first(),
                timeout(30000)   // 30-second hard timeout (Render cold-start can be ~20-25s)
            )
            .subscribe({
                next: (accounts) => {
                    this.accounts = accounts;
                    this.loading = false;
                    this.slowLoad = false;
                    clearTimeout(this.slowTimer);
                },
                error: (err) => {
                    console.error(err);
                    this.loading = false;
                    this.slowLoad = false;
                    clearTimeout(this.slowTimer);
                    if (err?.name === 'TimeoutError') {
                        this.loadError = 'timeout';
                    } else {
                        this.loadError = 'error';
                    }
                }
            });
    }

    deleteAccount(id: string) {
        const account = this.accounts!.find(x => x.id === id);
        account.isDeleting = true;
        this.accountService.delete(id)
            .pipe(first())
            .subscribe(() => {
                this.accounts = this.accounts!.filter(x => x.id !== id);
            });
    }

    ngOnDestroy() {
        this.sub?.unsubscribe();
        clearTimeout(this.slowTimer);
    }
}