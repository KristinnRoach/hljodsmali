// LoopHoldManager.ts
export class LoopHoldManager {
  private static instance: LoopHoldManager;
  private _globalLoop: boolean = false;
  private _hold: boolean = false;

  private constructor() {}

  static getInstance(): LoopHoldManager {
    if (!LoopHoldManager.instance) {
      LoopHoldManager.instance = new LoopHoldManager();
    }
    return LoopHoldManager.instance;
  }

  get globalLoop(): boolean {
    return this._globalLoop;
  }

  set globalLoop(value: boolean) {
    this._globalLoop = value;
  }

  get hold(): boolean {
    return this._hold;
  }

  set hold(value: boolean) {
    this._hold = value;
  }

  toggleLoop(): boolean {
    this._globalLoop = !this._globalLoop;
    return this._globalLoop;
  }

  toggleHold(): boolean {
    this._hold = !this._hold;
    return this._hold;
  }
}
