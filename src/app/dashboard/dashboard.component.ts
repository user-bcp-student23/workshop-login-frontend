import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TasksService } from '../services/tasks.service';
import { SessionService } from '../services/session.service';
import { getHttpErrorMessage } from '../utils/http-error-message';
import { formatTaskLabel } from '../utils/legacy-format';

const STATUS_LABELS: Record<string, string> = {
  TODO: 'Por hacer',
  IN_PROGRESS: 'En progreso',
  DONE: 'Completado',
  RESUELTO: 'Resuelto',
  COMPLETED: 'Completado'
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  tasks: any[] = [];
  visibleTasks: any[] = [];
  user: any = {};
  loading: any = true;
  error: any = '';

  constructor(
    private router: Router,
    private tasksService: TasksService,
    private session: SessionService,
    private changeDetector: ChangeDetectorRef
  ) {}

  statusLabel(status: string): string {
    return STATUS_LABELS[(status || '').toUpperCase()] || status;
  }

  async ngOnInit(): Promise<void> {
    try {
      const session = this.session.read();
      if (!session) {
        await this.router.navigate(['/login']);
        return;
      }
      this.user = session.user;
      const tasks = await this.tasksService.getTasks(this.user.username || '', session.token);
      if (!Array.isArray(tasks)) {
        throw new Error('La respuesta de tareas no es un arreglo valido.');
      }
      const tmp: any[] = [];
      for (let i = 0; i < tasks.length; i++) {
        if (typeof tasks[i]?.status !== 'string') {
          throw new Error('La respuesta de tareas contiene un estado no valido.');
        }
        if (tasks[i].status !== 'ARCHIVED') {
          tasks[i].label = formatTaskLabel(tasks[i]);
          tmp.push(tasks[i]);
        }
      }
      tmp.sort((a: any, b: any) => a.priority > b.priority ? -1 : 1);
      this.tasks = tasks;
      this.visibleTasks = tmp;
    } catch (error: unknown) {
      this.error = getHttpErrorMessage(error, 'detail', 'No se pudo cargar el dashboard');
    } finally {
      this.loading = false;
      this.changeDetector.markForCheck();
    }
  }

  async logout(): Promise<void> {
    try {
      this.session.clear();
      await this.router.navigate(['/login']);
    } catch (error: unknown) {
      this.error = getHttpErrorMessage(error, 'detail', 'No se pudo cerrar la sesion');
      this.loading = false;
      this.changeDetector.markForCheck();
    }
  }
}
