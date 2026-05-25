import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AccountService } from '@app/_services';

@Component({ standalone: false, templateUrl: 'list.component.html' })
export class ListComponent implements OnInit, OnDestroy {
    accounts?: any[];
    loading = false;
    loadError = '';
    private sub?: Subscription;

    constructor(private accountService: AccountService) { }

    ngOnInit() {
        this.loadAccounts();
    }

    loadAccounts() {
        this.loading = true;
        this.loadError = '';

        this.sub = this.accountService.getAll()
            .subscribe({
                next: (accounts) => {
                    this.accounts = accounts;
                    this.loading = false;
                },
                error: (err) => {
                    console.error(err);
                    this.loading = false;
                    this.loadError = 'error';
                }
            });
    }

    deleteAccount(id: string) {
        const account = this.accounts!.find(x => x.id === id);
        account.isDeleting = true;
        this.accountService.delete(id)
            .subscribe(() => {
                this.accounts = this.accounts!.filter(x => x.id !== id);
            });
    }

    ngOnDestroy() {
        this.sub?.unsubscribe();
    }
}