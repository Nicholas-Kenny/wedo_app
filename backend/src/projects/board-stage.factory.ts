export class BoardStageFactory {
  static createDefaultStages(projectId: string) {
    return [
      { projectId, title: 'To Do', position: 1 },
      { projectId, title: 'In Progress', position: 2 },
      { projectId, title: 'Done', position: 3 },
    ];
  }
}