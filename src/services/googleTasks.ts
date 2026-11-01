/**
 * Crabdeck Quantum Omni-Layer - Google Tasks API Service
 * Handles Google Tasks integration for multi-agent sprint orchestration,
 * to-do checklists, status toggling, and tasklist management.
 */

export interface GoogleTaskList {
  id: string;
  title: string;
  updated?: string;
  selfLink?: string;
}

export interface GoogleTask {
  id: string;
  title: string;
  updated?: string;
  selfLink?: string;
  position?: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
  completed?: string;
  deleted?: boolean;
  hidden?: boolean;
}

const TASKS_API_BASE = 'https://tasks.googleapis.com/tasks/v1';

/**
 * List all task lists for the authenticated user
 */
export async function listTaskLists(accessToken: string): Promise<GoogleTaskList[]> {
  const response = await fetch(`${TASKS_API_BASE}/users/@me/lists?maxResults=50`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to list task lists: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  const data = await response.json();
  return data.items || [];
}

/**
 * Create a new task list
 */
export async function createTaskList(accessToken: string, title: string): Promise<GoogleTaskList> {
  const response = await fetch(`${TASKS_API_BASE}/users/@me/lists`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to create task list: ${response.status} ${errorBody}`);
  }

  return response.json();
}

/**
 * Delete a task list
 */
export async function deleteTaskList(accessToken: string, tasklistId: string): Promise<void> {
  const response = await fetch(`${TASKS_API_BASE}/users/@me/lists/${tasklistId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to delete task list: ${response.status} ${errorBody}`);
  }
}

/**
 * List tasks in a given task list
 */
export async function listTasks(
  accessToken: string,
  tasklistId: string,
  showCompleted = true
): Promise<GoogleTask[]> {
  const url = new URL(`${TASKS_API_BASE}/lists/${encodeURIComponent(tasklistId)}/tasks`);
  url.searchParams.set('maxResults', '100');
  url.searchParams.set('showCompleted', showCompleted ? 'true' : 'false');
  url.searchParams.set('showHidden', 'false');

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to list tasks: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  return data.items || [];
}

/**
 * Create a new task inside a task list
 */
export async function createTask(
  accessToken: string,
  tasklistId: string,
  task: { title: string; notes?: string; due?: string }
): Promise<GoogleTask> {
  const payload: Record<string, any> = {
    title: task.title,
    status: 'needsAction',
  };
  if (task.notes) payload.notes = task.notes;
  if (task.due) payload.due = task.due;

  const response = await fetch(`${TASKS_API_BASE}/lists/${encodeURIComponent(tasklistId)}/tasks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to create task: ${response.status} ${errorBody}`);
  }

  return response.json();
}

/**
 * Update task status (toggle between completed and needsAction)
 */
export async function toggleTaskStatus(
  accessToken: string,
  tasklistId: string,
  taskId: string,
  completed: boolean
): Promise<GoogleTask> {
  const payload: Record<string, any> = {
    id: taskId,
    status: completed ? 'completed' : 'needsAction',
  };
  if (completed) {
    payload.completed = new Date().toISOString();
  } else {
    payload.completed = null;
  }

  const response = await fetch(
    `${TASKS_API_BASE}/lists/${encodeURIComponent(tasklistId)}/tasks/${encodeURIComponent(taskId)}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to toggle task: ${response.status} ${errorBody}`);
  }

  return response.json();
}

/**
 * Delete a task
 */
export async function deleteTask(
  accessToken: string,
  tasklistId: string,
  taskId: string
): Promise<void> {
  const response = await fetch(
    `${TASKS_API_BASE}/lists/${encodeURIComponent(tasklistId)}/tasks/${encodeURIComponent(taskId)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to delete task: ${response.status} ${errorBody}`);
  }
}
