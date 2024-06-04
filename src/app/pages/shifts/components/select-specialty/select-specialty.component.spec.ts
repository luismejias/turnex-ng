import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectSpecialtyComponent } from './select-specialty.component';

describe('SelectSpecialtyComponent', () => {
  let component: SelectSpecialtyComponent;
  let fixture: ComponentFixture<SelectSpecialtyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectSpecialtyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectSpecialtyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
