import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekPagerComponent } from './week-pager.component';

describe('WeekPagerComponent', () => {
  let component: WeekPagerComponent;
  let fixture: ComponentFixture<WeekPagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeekPagerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WeekPagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
