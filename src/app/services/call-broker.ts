import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '../constants/endpoints';

@Injectable({
  providedIn: 'root',
})
export class CallBroker {
  constructor(private http: HttpClient) {}

  getAllPosts() {
    return this.http.get(API_ENDPOINTS.MAZE.GENERATE);
  }
}
