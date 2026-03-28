import { environment } from '../../environments/environment';

const BASE_URL = environment.apiUrl;

export const API_ENDPOINTS = {
  MAZE: {
    GENERATE: `${BASE_URL}/generate`,
  },
  SOLVE_MAZE: {
    A_STAR: `${BASE_URL}/solve-a-star`,
  },
};
