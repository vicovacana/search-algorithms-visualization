import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '../constants/endpoints';
import { MazeData } from '../models/maze.models';
import { Observable } from 'rxjs';
import { Solution } from '../models/solution.models';

@Injectable({
  providedIn: 'root',
})
export class CallBroker {
  constructor(private http: HttpClient) {}

  getMaze(): Observable<MazeData> {
    return this.http.post<MazeData>(API_ENDPOINTS.MAZE.GENERATE, { size: 7 });
  }

  solveMaze(data: any): Observable<Solution> {
    return this.http.post<Solution>(API_ENDPOINTS.MAZE.SOLVE, data);
  }
}
