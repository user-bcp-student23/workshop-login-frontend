import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Task } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TasksService {
  constructor(private readonly http: HttpClient) {}

  getTasks(owner: string, token: string): Promise<Task[]> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const url = `${environment.tasksApiUrl}/api/tasks?owner=${owner}`;
    return firstValueFrom(this.http.get<Task[]>(url, { headers }));
  }
}
