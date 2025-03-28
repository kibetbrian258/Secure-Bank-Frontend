import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankingGuideComponent } from './banking-guide.component';

describe('BankingGuideComponent', () => {
  let component: BankingGuideComponent;
  let fixture: ComponentFixture<BankingGuideComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BankingGuideComponent]
    });
    fixture = TestBed.createComponent(BankingGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
