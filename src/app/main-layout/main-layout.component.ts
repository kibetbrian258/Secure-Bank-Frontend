import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../Services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  customerName: string = '';
  currentPage: string = 'dashboard';
  
  // Responsive design properties
  sidebarOpen: boolean = false;
  isMobileView: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    // Track route changes to highlight the correct sidebar item
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.url;
      
      if (url.includes('/dashboard')) {
        this.currentPage = 'dashboard';
      } else if (url.includes('/account-information')) {
        this.currentPage = 'account-information';
      } else if (url.includes('/transactions')) {
        this.currentPage = 'transactions';
      } else if (url.includes('/help')) {
        this.currentPage = 'help';
      }
    });
  }

  ngOnInit(): void {
    this.checkScreenSize();
    this.loadCustomerName();
  }

  loadCustomerName(): void {
    this.authService.getCustomerProfile().subscribe({
      next: (profile) => {
        this.customerName = profile.fullName;
      },
      error: (error) => {
        console.error('Could not load customer profile', error);
      }
    });
  }

  // Check screen size on init and window resize
  @HostListener('window:resize', ['$event'])
  checkScreenSize(): void {
    this.isMobileView = window.innerWidth <= 768;
    if (!this.isMobileView) {
      this.sidebarOpen = false;
    }
  }

  // Toggle sidebar on mobile
  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;

    // Prevent scrolling when sidebar is open
    if (this.sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  // Close sidebar
  closeSidebar(): void {
    this.sidebarOpen = false;
    document.body.style.overflow = '';
  }
  
  // Navigation function
  navigateTo(page: string): void {
    this.currentPage = page;
    this.closeSidebar();
    
    switch (page) {
      case 'dashboard':
        this.router.navigate(['/dashboard']);
        break;
      case 'account-information':
        this.router.navigate(['/account-information']);
        break;
      case 'transactions':
        this.router.navigate(['/transactions']);
        break;
      case 'help':
        this.router.navigate(['/help']);
        break;
      default:
        this.router.navigate(['/dashboard']);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}