import '@angular/compiler';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  it('gets the documented owner URL and sends the bearer token', async () => {
    const tasks = [{ title: 'Requirement', status: 'TODO', priority: 'HIGH', owner: 'student', description: '' }];
    const get = vi.fn().mockReturnValue(of(tasks));
    const service = new TasksService({ get } as unknown as HttpClient);

    await expect(service.getTasks('student', 'test-token')).resolves.toEqual(tasks);

    expect(get).toHaveBeenCalledTimes(1);
    const [url, options] = get.mock.calls[0] as [string, { headers: HttpHeaders }];
    expect(url).toBe('http://localhost:8000/api/tasks?owner=student');
    expect(options.headers.get('Authorization')).toBe('Bearer test-token');
  });
});
