import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftSchedulingResultComponent } from './shift-scheduling-result.component';

describe('ShiftSchedulingResultComponent', () => {
  let component: ShiftSchedulingResultComponent;
  let fixture: ComponentFixture<ShiftSchedulingResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShiftSchedulingResultComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShiftSchedulingResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
