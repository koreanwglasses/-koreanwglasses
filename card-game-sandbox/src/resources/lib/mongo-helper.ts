import { Cascade } from "@koreanwglasses/cascade";
import mongoose from "mongoose";

const Class = (_this: MongoRestate<any>) =>
  _this.constructor as typeof MongoRestate;

export abstract class MongoRestate<T> {
  private declare static _instances: Record<string, MongoRestate<any>>;
  declare static _model: mongoose.Model<any>;

  _store!: {
    [K in keyof T]: Cascade<T[K]> & { set(value: T[K]): Promise<void> };
  } & { invalidate(): void };

  constructor(readonly _id: string) {
    // Use interning to maintain consistent refs to
    // cascades`
    if (_id in Class(this)._instances) {
      return Class(this)._instances[_id];
    }

    Class(this)._instances[_id] = this;

    const data = new Cascade(
      () => Class(this)._model.findById(this._id).lean().exec(),
      {
        autoclose: false,
        onClose: () => delete Class(this)._instances[_id],
      }
    ) as Cascade<any>;
    const fields = {} as any;

    this._store = new Proxy(
      {},
      {
        get: (_, p) =>
          p === "invalidate"
            ? () => data.invalidate()
            : (fields[p] ??= new Proxy(
                data.pipe((data) => data[p], {
                  onClose: () => delete fields[p],
                }),
                {
                  get: (target, p2, receiver) =>
                    p2 === "set"
                      ? (value: any) =>
                          Class(this)
                            ._model.findByIdAndUpdate(this._id, { [p]: value })
                            .exec()
                            .then(() => data.invalidate())
                      : Reflect.get(target, p2, receiver),
                }
              )),
      }
    ) as any;
  }
}

export function model<T>(name: string, schema: mongoose.Schema<T>) {
  return function <S extends new (...args: any) => any>(constructor: S) {
    return class extends constructor {
      static _instances: Record<string, MongoRestate<any>> = {};
      static _model: mongoose.Model<T> =
        mongoose.models[name] ?? mongoose.model(name, schema);
    };
  };
}
