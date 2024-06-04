import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectHourComponent } from './select-hour.component';

describe('SelectHourComponent', () => {
  let component: SelectHourComponent;
  let fixture: ComponentFixture<SelectHourComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectHourComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectHourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
