import { LosslessNumber, isLosslessNumber, parse } from 'lossless-json';
import { InvalidMessage } from '../_components/message';
import { ContentComponentFn } from './chat-factory';

export type Long = number | LosslessNumber;

export function parseObject(json: string): Record<string, unknown> {
  try {
    const obj = parse(json);

    if (obj != null && typeof obj === 'object' && !Array.isArray(obj)) {
      return obj as Record<string, unknown>;
    }
  } catch (e) {
    throw new FactoryMethodError(`Invalid JSON. ${e}`);
  }

  throw new FactoryMethodError('JSON is not an object');
}

export function factoryMethod(name: string) {
  return function <This, Args extends unknown[]>(
    originalMethod: (this: This, ...args: Args) => Promise<ContentComponentFn>,
    context: unknown,
  ) {
    context;

    return async function Wrapper(this: This, ...args: Args) {
      try {
        return await originalMethod.call(this, ...args);
      } catch (e) {
        if (e instanceof FactoryMethodError) {
          const message = e.message;

          return () => <InvalidMessage
            name={name}
            message={message}
          />;
        }

        throw e;
      }
    };
  };
}

type TypeTable = {
  'string': string,
  'number': number,
  'object': Record<string, unknown>,
  'long': Long,
}

class FactoryMethodError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export function expectOr<T extends keyof TypeTable, V>(
  obj: Record<string, unknown>,
  key: string,
  ty: T,
  defaultValue: V,
): TypeTable[T] | V {
  const val = obj[key];

  if (
    ty === 'long' && (typeof ty === 'number' || isLosslessNumber(val)) ||
    typeof val === ty
  ) {
    return val as TypeTable[T];
  }

  return defaultValue;
}

export function expect<T extends keyof TypeTable>(
  obj: Record<string, unknown>,
  key: string,
  ty: T,
): TypeTable[T] {
  const val = expectOr(obj, key, ty, null);
  if (val != null) {
    return val;
  }

  throw new FactoryMethodError(
    `Error while reading '${key}'. expected: ${ty}, actual: ${typeof val}`,
  );
}
