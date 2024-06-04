import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewShiftComponent } from './new-shift.component';

describe('NewShiftComponent', () => {
  let component: NewShiftComponent;
  let fixture: ComponentFixture<NewShiftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewShiftComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewShiftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
