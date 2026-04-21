import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Pack } from 'src/app/models';
import { API_URL } from 'src/app/shared/api.config';

@Injectable({ providedIn: 'root' })
export class PacksService {
  private http = inject(HttpClient);

  getAllPacks(): Observable<Pack[]> {
    return this.http.get<Pack[]>(`${API_URL}/packs`);
  }
}
