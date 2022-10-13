class Storage {
  private storage = new Map();
  public getState = from => {
    return this.storage.get(from.id) || {};
  };
  public setState = (from, state, payload = {}) => {
    return this.storage.set(from.id, { ...this.getState(from), state, ...payload });
  };

  public removeState = from => {
    if (this.storage.get(from.id)) {
      this.storage.delete(from.id);
    }
  };
}

export default Storage;
