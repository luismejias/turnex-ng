import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewShiftSummaryComponent } from './new-shift-summary.component';

describe('NewShiftSummaryComponent', () => {
  let component: NewShiftSummaryComponent;
  let fixture: ComponentFixture<NewShiftSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewShiftSummaryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewShiftSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
