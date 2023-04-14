export const up = async function (db: any): Promise<any> {
  return db.runSql(`
      CALL modificarTablaClips();
  `)
};

export const down = async function (db: any): Promise<any> {
  return db.runSql(`ALTER TABLE clips DROP COLUMN duration`);
};
