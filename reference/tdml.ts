export enum TaskStatus {
  PENDING = ' ',
  IN_PROGRESS = 'w',
  DONE = 'x',
}

export interface Task {
  id: string;
  rawLine: string;
  indentLevel: number;
  status: TaskStatus;
  startTimeRaw?: string;
  endTimeRaw?: string;
  description: string;
  contextDateRaw?: string;
  children: Task[];
}

export interface TDMLTimestamp {
  raw: string;
  parsedDate?: Date;
}

const generateId = () => Math.random().toString(36).slice(2, 11);

/**
 * Canonical TDML task line:
 * <indent>- [<status>] [<start>,<end> ]<description>[ (start: <YYYYMMDD>)]
 */
export const TDML_REGEX =
  /^(\s*)- \[([ xw])\]\s*(?:([0-9]{4}|[0-9]{8}|[0-9]{12}),([0-9]{4}|[0-9]{8}|[0-9]{12}|yyyy)\s+)?(.*?)(?:\s+\(start: ([0-9]{8})\))?$/;

export const parseTDML = (text: string): Task[] => {
  const lines = text.split('\n');
  const rootTasks: Task[] = [];
  const stack: Array<{ task: Task; indent: number }> = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    const match = line.match(TDML_REGEX);

    if (!match) {
      const fallbackTask: Task = {
        id: generateId(),
        rawLine: line,
        indentLevel: 0,
        status: TaskStatus.PENDING,
        description: line,
        children: [],
      };

      rootTasks.push(fallbackTask);
      stack.length = 0;
      stack.push({ task: fallbackTask, indent: 0 });
      continue;
    }

    const [, indentStr, statusChar, startRaw, endRaw, desc, contextDate] = match;
    const indentLevel = indentStr.length;

    const newTask: Task = {
      id: generateId(),
      rawLine: line,
      indentLevel,
      status: statusChar as TaskStatus,
      startTimeRaw: startRaw,
      endTimeRaw: endRaw,
      description: desc.trim(),
      contextDateRaw: contextDate,
      children: [],
    };

    while (stack.length > 0 && stack[stack.length - 1].indent >= indentLevel) {
      stack.pop();
    }

    if (stack.length === 0) {
      rootTasks.push(newTask);
    } else {
      stack[stack.length - 1].task.children.push(newTask);
    }

    stack.push({ task: newTask, indent: indentLevel });
  }

  return rootTasks;
};

export const stringifyTDML = (tasks: Task[]): string => {
  const lines: string[] = [];

  const processTask = (task: Task) => {
    const indent = ' '.repeat(task.indentLevel);
    const timeString =
      task.startTimeRaw && task.endTimeRaw ? ` ${task.startTimeRaw},${task.endTimeRaw}` : '';
    const contextString = task.contextDateRaw ? ` (start: ${task.contextDateRaw})` : '';

    lines.push(`${indent}- [${task.status}]${timeString} ${task.description}${contextString}`);

    for (const child of task.children) {
      processTask(child);
    }
  };

  for (const task of tasks) {
    processTask(task);
  }

  return lines.join('\n');
};

export const formatTimeDisplay = (raw?: string): string => {
  if (!raw || raw === 'yyyy') return '...';

  if (raw.length === 4) {
    return `${raw.slice(0, 2)}:${raw.slice(2)}`;
  }

  if (raw.length === 8) {
    const month = raw.slice(0, 2);
    const day = raw.slice(2, 4);
    const hour = raw.slice(4, 6);
    const minute = raw.slice(6, 8);
    return `${month}/${day} ${hour}:${minute}`;
  }

  if (raw.length === 12) {
    const year = raw.slice(0, 4);
    const month = raw.slice(4, 6);
    const day = raw.slice(6, 8);
    const hour = raw.slice(8, 10);
    const minute = raw.slice(10, 12);
    return `${year}/${month}/${day} ${hour}:${minute}`;
  }

  return raw;
};

export const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.DONE:
      return 'text-emerald-400';
    case TaskStatus.IN_PROGRESS:
      return 'text-amber-400';
    default:
      return 'text-slate-400';
  }
};

const updateIndentRecursive = (task: Task, delta: number) => {
  task.indentLevel = Math.max(0, task.indentLevel + delta);
  task.children.forEach((child) => updateIndentRecursive(child, delta));
};

export const adjustTaskIndent = (
  tasks: Task[],
  taskId: string,
  direction: 'in' | 'out'
): Task[] => {
  const root = JSON.parse(JSON.stringify(tasks)) as Task[];

  const findListContext = (
    list: Task[],
    targetId: string
  ): { list: Task[]; index: number } | null => {
    const index = list.findIndex((task) => task.id === targetId);
    if (index > -1) return { list, index };

    for (const task of list) {
      const result = findListContext(task.children, targetId);
      if (result) return result;
    }

    return null;
  };

  const findNodeWithParent = (
    list: Task[],
    parent: Task | null
  ): { list: Task[]; index: number; parent: Task | null } | null => {
    const index = list.findIndex((task) => task.id === taskId);
    if (index > -1) return { list, index, parent };

    for (const task of list) {
      const result = findNodeWithParent(task.children, task);
      if (result) return result;
    }

    return null;
  };

  const nodeCtx = findNodeWithParent(root, null);
  if (!nodeCtx) return root;

  const { list, index, parent } = nodeCtx;
  const task = list[index];

  if (direction === 'in') {
    if (index === 0) return root;

    const previousSibling = list[index - 1];
    list.splice(index, 1);
    previousSibling.children.push(task);
    updateIndentRecursive(task, 1);
    return root;
  }

  if (!parent) return root;

  const parentCtx = findListContext(root, parent.id);
  if (!parentCtx) return root;

  list.splice(index, 1);
  parentCtx.list.splice(parentCtx.index + 1, 0, task);
  updateIndentRecursive(task, -1);

  return root;
};
