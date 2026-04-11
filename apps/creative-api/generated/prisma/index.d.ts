
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Template
 * 
 */
export type Template = $Result.DefaultSelection<Prisma.$TemplatePayload>
/**
 * Model Creative
 * 
 */
export type Creative = $Result.DefaultSelection<Prisma.$CreativePayload>
/**
 * Model Export
 * 
 */
export type Export = $Result.DefaultSelection<Prisma.$ExportPayload>
/**
 * Model DeviceFrame
 * 
 */
export type DeviceFrame = $Result.DefaultSelection<Prisma.$DeviceFramePayload>
/**
 * Model AiCopyResult
 * 
 */
export type AiCopyResult = $Result.DefaultSelection<Prisma.$AiCopyResultPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Templates
 * const templates = await prisma.template.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Templates
   * const templates = await prisma.template.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.template`: Exposes CRUD operations for the **Template** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Templates
    * const templates = await prisma.template.findMany()
    * ```
    */
  get template(): Prisma.TemplateDelegate<ExtArgs>;

  /**
   * `prisma.creative`: Exposes CRUD operations for the **Creative** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Creatives
    * const creatives = await prisma.creative.findMany()
    * ```
    */
  get creative(): Prisma.CreativeDelegate<ExtArgs>;

  /**
   * `prisma.export`: Exposes CRUD operations for the **Export** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Exports
    * const exports = await prisma.export.findMany()
    * ```
    */
  get export(): Prisma.ExportDelegate<ExtArgs>;

  /**
   * `prisma.deviceFrame`: Exposes CRUD operations for the **DeviceFrame** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DeviceFrames
    * const deviceFrames = await prisma.deviceFrame.findMany()
    * ```
    */
  get deviceFrame(): Prisma.DeviceFrameDelegate<ExtArgs>;

  /**
   * `prisma.aiCopyResult`: Exposes CRUD operations for the **AiCopyResult** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AiCopyResults
    * const aiCopyResults = await prisma.aiCopyResult.findMany()
    * ```
    */
  get aiCopyResult(): Prisma.AiCopyResultDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Template: 'Template',
    Creative: 'Creative',
    Export: 'Export',
    DeviceFrame: 'DeviceFrame',
    AiCopyResult: 'AiCopyResult'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "template" | "creative" | "export" | "deviceFrame" | "aiCopyResult"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Template: {
        payload: Prisma.$TemplatePayload<ExtArgs>
        fields: Prisma.TemplateFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TemplateFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TemplatePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TemplateFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TemplatePayload>
          }
          findFirst: {
            args: Prisma.TemplateFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TemplatePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TemplateFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TemplatePayload>
          }
          findMany: {
            args: Prisma.TemplateFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TemplatePayload>[]
          }
          create: {
            args: Prisma.TemplateCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TemplatePayload>
          }
          createMany: {
            args: Prisma.TemplateCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TemplateCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TemplatePayload>[]
          }
          delete: {
            args: Prisma.TemplateDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TemplatePayload>
          }
          update: {
            args: Prisma.TemplateUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TemplatePayload>
          }
          deleteMany: {
            args: Prisma.TemplateDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TemplateUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TemplateUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TemplatePayload>
          }
          aggregate: {
            args: Prisma.TemplateAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTemplate>
          }
          groupBy: {
            args: Prisma.TemplateGroupByArgs<ExtArgs>
            result: $Utils.Optional<TemplateGroupByOutputType>[]
          }
          count: {
            args: Prisma.TemplateCountArgs<ExtArgs>
            result: $Utils.Optional<TemplateCountAggregateOutputType> | number
          }
        }
      }
      Creative: {
        payload: Prisma.$CreativePayload<ExtArgs>
        fields: Prisma.CreativeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CreativeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CreativePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CreativeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CreativePayload>
          }
          findFirst: {
            args: Prisma.CreativeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CreativePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CreativeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CreativePayload>
          }
          findMany: {
            args: Prisma.CreativeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CreativePayload>[]
          }
          create: {
            args: Prisma.CreativeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CreativePayload>
          }
          createMany: {
            args: Prisma.CreativeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CreativeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CreativePayload>[]
          }
          delete: {
            args: Prisma.CreativeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CreativePayload>
          }
          update: {
            args: Prisma.CreativeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CreativePayload>
          }
          deleteMany: {
            args: Prisma.CreativeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CreativeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CreativeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CreativePayload>
          }
          aggregate: {
            args: Prisma.CreativeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCreative>
          }
          groupBy: {
            args: Prisma.CreativeGroupByArgs<ExtArgs>
            result: $Utils.Optional<CreativeGroupByOutputType>[]
          }
          count: {
            args: Prisma.CreativeCountArgs<ExtArgs>
            result: $Utils.Optional<CreativeCountAggregateOutputType> | number
          }
        }
      }
      Export: {
        payload: Prisma.$ExportPayload<ExtArgs>
        fields: Prisma.ExportFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ExportFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExportPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ExportFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExportPayload>
          }
          findFirst: {
            args: Prisma.ExportFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExportPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ExportFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExportPayload>
          }
          findMany: {
            args: Prisma.ExportFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExportPayload>[]
          }
          create: {
            args: Prisma.ExportCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExportPayload>
          }
          createMany: {
            args: Prisma.ExportCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ExportCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExportPayload>[]
          }
          delete: {
            args: Prisma.ExportDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExportPayload>
          }
          update: {
            args: Prisma.ExportUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExportPayload>
          }
          deleteMany: {
            args: Prisma.ExportDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ExportUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ExportUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExportPayload>
          }
          aggregate: {
            args: Prisma.ExportAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateExport>
          }
          groupBy: {
            args: Prisma.ExportGroupByArgs<ExtArgs>
            result: $Utils.Optional<ExportGroupByOutputType>[]
          }
          count: {
            args: Prisma.ExportCountArgs<ExtArgs>
            result: $Utils.Optional<ExportCountAggregateOutputType> | number
          }
        }
      }
      DeviceFrame: {
        payload: Prisma.$DeviceFramePayload<ExtArgs>
        fields: Prisma.DeviceFrameFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DeviceFrameFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeviceFramePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DeviceFrameFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeviceFramePayload>
          }
          findFirst: {
            args: Prisma.DeviceFrameFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeviceFramePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DeviceFrameFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeviceFramePayload>
          }
          findMany: {
            args: Prisma.DeviceFrameFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeviceFramePayload>[]
          }
          create: {
            args: Prisma.DeviceFrameCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeviceFramePayload>
          }
          createMany: {
            args: Prisma.DeviceFrameCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DeviceFrameCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeviceFramePayload>[]
          }
          delete: {
            args: Prisma.DeviceFrameDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeviceFramePayload>
          }
          update: {
            args: Prisma.DeviceFrameUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeviceFramePayload>
          }
          deleteMany: {
            args: Prisma.DeviceFrameDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DeviceFrameUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DeviceFrameUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeviceFramePayload>
          }
          aggregate: {
            args: Prisma.DeviceFrameAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDeviceFrame>
          }
          groupBy: {
            args: Prisma.DeviceFrameGroupByArgs<ExtArgs>
            result: $Utils.Optional<DeviceFrameGroupByOutputType>[]
          }
          count: {
            args: Prisma.DeviceFrameCountArgs<ExtArgs>
            result: $Utils.Optional<DeviceFrameCountAggregateOutputType> | number
          }
        }
      }
      AiCopyResult: {
        payload: Prisma.$AiCopyResultPayload<ExtArgs>
        fields: Prisma.AiCopyResultFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AiCopyResultFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiCopyResultPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AiCopyResultFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiCopyResultPayload>
          }
          findFirst: {
            args: Prisma.AiCopyResultFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiCopyResultPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AiCopyResultFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiCopyResultPayload>
          }
          findMany: {
            args: Prisma.AiCopyResultFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiCopyResultPayload>[]
          }
          create: {
            args: Prisma.AiCopyResultCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiCopyResultPayload>
          }
          createMany: {
            args: Prisma.AiCopyResultCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AiCopyResultCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiCopyResultPayload>[]
          }
          delete: {
            args: Prisma.AiCopyResultDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiCopyResultPayload>
          }
          update: {
            args: Prisma.AiCopyResultUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiCopyResultPayload>
          }
          deleteMany: {
            args: Prisma.AiCopyResultDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AiCopyResultUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AiCopyResultUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiCopyResultPayload>
          }
          aggregate: {
            args: Prisma.AiCopyResultAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAiCopyResult>
          }
          groupBy: {
            args: Prisma.AiCopyResultGroupByArgs<ExtArgs>
            result: $Utils.Optional<AiCopyResultGroupByOutputType>[]
          }
          count: {
            args: Prisma.AiCopyResultCountArgs<ExtArgs>
            result: $Utils.Optional<AiCopyResultCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type TemplateCountOutputType
   */

  export type TemplateCountOutputType = {
    creatives: number
  }

  export type TemplateCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    creatives?: boolean | TemplateCountOutputTypeCountCreativesArgs
  }

  // Custom InputTypes
  /**
   * TemplateCountOutputType without action
   */
  export type TemplateCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TemplateCountOutputType
     */
    select?: TemplateCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TemplateCountOutputType without action
   */
  export type TemplateCountOutputTypeCountCreativesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CreativeWhereInput
  }


  /**
   * Count Type CreativeCountOutputType
   */

  export type CreativeCountOutputType = {
    exports: number
  }

  export type CreativeCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    exports?: boolean | CreativeCountOutputTypeCountExportsArgs
  }

  // Custom InputTypes
  /**
   * CreativeCountOutputType without action
   */
  export type CreativeCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CreativeCountOutputType
     */
    select?: CreativeCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CreativeCountOutputType without action
   */
  export type CreativeCountOutputTypeCountExportsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ExportWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Template
   */

  export type AggregateTemplate = {
    _count: TemplateCountAggregateOutputType | null
    _avg: TemplateAvgAggregateOutputType | null
    _sum: TemplateSumAggregateOutputType | null
    _min: TemplateMinAggregateOutputType | null
    _max: TemplateMaxAggregateOutputType | null
  }

  export type TemplateAvgAggregateOutputType = {
    width: number | null
    height: number | null
  }

  export type TemplateSumAggregateOutputType = {
    width: number | null
    height: number | null
  }

  export type TemplateMinAggregateOutputType = {
    id: string | null
    name: string | null
    category: string | null
    width: number | null
    height: number | null
    layers: string | null
    thumbnail: string | null
    isSystem: boolean | null
    tenantId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TemplateMaxAggregateOutputType = {
    id: string | null
    name: string | null
    category: string | null
    width: number | null
    height: number | null
    layers: string | null
    thumbnail: string | null
    isSystem: boolean | null
    tenantId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TemplateCountAggregateOutputType = {
    id: number
    name: number
    category: number
    width: number
    height: number
    layers: number
    thumbnail: number
    isSystem: number
    tenantId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TemplateAvgAggregateInputType = {
    width?: true
    height?: true
  }

  export type TemplateSumAggregateInputType = {
    width?: true
    height?: true
  }

  export type TemplateMinAggregateInputType = {
    id?: true
    name?: true
    category?: true
    width?: true
    height?: true
    layers?: true
    thumbnail?: true
    isSystem?: true
    tenantId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TemplateMaxAggregateInputType = {
    id?: true
    name?: true
    category?: true
    width?: true
    height?: true
    layers?: true
    thumbnail?: true
    isSystem?: true
    tenantId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TemplateCountAggregateInputType = {
    id?: true
    name?: true
    category?: true
    width?: true
    height?: true
    layers?: true
    thumbnail?: true
    isSystem?: true
    tenantId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TemplateAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Template to aggregate.
     */
    where?: TemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Templates to fetch.
     */
    orderBy?: TemplateOrderByWithRelationInput | TemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Templates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Templates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Templates
    **/
    _count?: true | TemplateCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TemplateAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TemplateSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TemplateMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TemplateMaxAggregateInputType
  }

  export type GetTemplateAggregateType<T extends TemplateAggregateArgs> = {
        [P in keyof T & keyof AggregateTemplate]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTemplate[P]>
      : GetScalarType<T[P], AggregateTemplate[P]>
  }




  export type TemplateGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TemplateWhereInput
    orderBy?: TemplateOrderByWithAggregationInput | TemplateOrderByWithAggregationInput[]
    by: TemplateScalarFieldEnum[] | TemplateScalarFieldEnum
    having?: TemplateScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TemplateCountAggregateInputType | true
    _avg?: TemplateAvgAggregateInputType
    _sum?: TemplateSumAggregateInputType
    _min?: TemplateMinAggregateInputType
    _max?: TemplateMaxAggregateInputType
  }

  export type TemplateGroupByOutputType = {
    id: string
    name: string
    category: string
    width: number
    height: number
    layers: string
    thumbnail: string | null
    isSystem: boolean
    tenantId: string | null
    createdAt: Date
    updatedAt: Date
    _count: TemplateCountAggregateOutputType | null
    _avg: TemplateAvgAggregateOutputType | null
    _sum: TemplateSumAggregateOutputType | null
    _min: TemplateMinAggregateOutputType | null
    _max: TemplateMaxAggregateOutputType | null
  }

  type GetTemplateGroupByPayload<T extends TemplateGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TemplateGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TemplateGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TemplateGroupByOutputType[P]>
            : GetScalarType<T[P], TemplateGroupByOutputType[P]>
        }
      >
    >


  export type TemplateSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    category?: boolean
    width?: boolean
    height?: boolean
    layers?: boolean
    thumbnail?: boolean
    isSystem?: boolean
    tenantId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    creatives?: boolean | Template$creativesArgs<ExtArgs>
    _count?: boolean | TemplateCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["template"]>

  export type TemplateSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    category?: boolean
    width?: boolean
    height?: boolean
    layers?: boolean
    thumbnail?: boolean
    isSystem?: boolean
    tenantId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["template"]>

  export type TemplateSelectScalar = {
    id?: boolean
    name?: boolean
    category?: boolean
    width?: boolean
    height?: boolean
    layers?: boolean
    thumbnail?: boolean
    isSystem?: boolean
    tenantId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TemplateInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    creatives?: boolean | Template$creativesArgs<ExtArgs>
    _count?: boolean | TemplateCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TemplateIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $TemplatePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Template"
    objects: {
      creatives: Prisma.$CreativePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      category: string
      width: number
      height: number
      layers: string
      thumbnail: string | null
      isSystem: boolean
      tenantId: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["template"]>
    composites: {}
  }

  type TemplateGetPayload<S extends boolean | null | undefined | TemplateDefaultArgs> = $Result.GetResult<Prisma.$TemplatePayload, S>

  type TemplateCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TemplateFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TemplateCountAggregateInputType | true
    }

  export interface TemplateDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Template'], meta: { name: 'Template' } }
    /**
     * Find zero or one Template that matches the filter.
     * @param {TemplateFindUniqueArgs} args - Arguments to find a Template
     * @example
     * // Get one Template
     * const template = await prisma.template.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TemplateFindUniqueArgs>(args: SelectSubset<T, TemplateFindUniqueArgs<ExtArgs>>): Prisma__TemplateClient<$Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Template that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TemplateFindUniqueOrThrowArgs} args - Arguments to find a Template
     * @example
     * // Get one Template
     * const template = await prisma.template.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TemplateFindUniqueOrThrowArgs>(args: SelectSubset<T, TemplateFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TemplateClient<$Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Template that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TemplateFindFirstArgs} args - Arguments to find a Template
     * @example
     * // Get one Template
     * const template = await prisma.template.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TemplateFindFirstArgs>(args?: SelectSubset<T, TemplateFindFirstArgs<ExtArgs>>): Prisma__TemplateClient<$Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Template that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TemplateFindFirstOrThrowArgs} args - Arguments to find a Template
     * @example
     * // Get one Template
     * const template = await prisma.template.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TemplateFindFirstOrThrowArgs>(args?: SelectSubset<T, TemplateFindFirstOrThrowArgs<ExtArgs>>): Prisma__TemplateClient<$Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Templates that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TemplateFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Templates
     * const templates = await prisma.template.findMany()
     * 
     * // Get first 10 Templates
     * const templates = await prisma.template.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const templateWithIdOnly = await prisma.template.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TemplateFindManyArgs>(args?: SelectSubset<T, TemplateFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Template.
     * @param {TemplateCreateArgs} args - Arguments to create a Template.
     * @example
     * // Create one Template
     * const Template = await prisma.template.create({
     *   data: {
     *     // ... data to create a Template
     *   }
     * })
     * 
     */
    create<T extends TemplateCreateArgs>(args: SelectSubset<T, TemplateCreateArgs<ExtArgs>>): Prisma__TemplateClient<$Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Templates.
     * @param {TemplateCreateManyArgs} args - Arguments to create many Templates.
     * @example
     * // Create many Templates
     * const template = await prisma.template.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TemplateCreateManyArgs>(args?: SelectSubset<T, TemplateCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Templates and returns the data saved in the database.
     * @param {TemplateCreateManyAndReturnArgs} args - Arguments to create many Templates.
     * @example
     * // Create many Templates
     * const template = await prisma.template.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Templates and only return the `id`
     * const templateWithIdOnly = await prisma.template.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TemplateCreateManyAndReturnArgs>(args?: SelectSubset<T, TemplateCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Template.
     * @param {TemplateDeleteArgs} args - Arguments to delete one Template.
     * @example
     * // Delete one Template
     * const Template = await prisma.template.delete({
     *   where: {
     *     // ... filter to delete one Template
     *   }
     * })
     * 
     */
    delete<T extends TemplateDeleteArgs>(args: SelectSubset<T, TemplateDeleteArgs<ExtArgs>>): Prisma__TemplateClient<$Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Template.
     * @param {TemplateUpdateArgs} args - Arguments to update one Template.
     * @example
     * // Update one Template
     * const template = await prisma.template.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TemplateUpdateArgs>(args: SelectSubset<T, TemplateUpdateArgs<ExtArgs>>): Prisma__TemplateClient<$Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Templates.
     * @param {TemplateDeleteManyArgs} args - Arguments to filter Templates to delete.
     * @example
     * // Delete a few Templates
     * const { count } = await prisma.template.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TemplateDeleteManyArgs>(args?: SelectSubset<T, TemplateDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Templates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TemplateUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Templates
     * const template = await prisma.template.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TemplateUpdateManyArgs>(args: SelectSubset<T, TemplateUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Template.
     * @param {TemplateUpsertArgs} args - Arguments to update or create a Template.
     * @example
     * // Update or create a Template
     * const template = await prisma.template.upsert({
     *   create: {
     *     // ... data to create a Template
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Template we want to update
     *   }
     * })
     */
    upsert<T extends TemplateUpsertArgs>(args: SelectSubset<T, TemplateUpsertArgs<ExtArgs>>): Prisma__TemplateClient<$Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Templates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TemplateCountArgs} args - Arguments to filter Templates to count.
     * @example
     * // Count the number of Templates
     * const count = await prisma.template.count({
     *   where: {
     *     // ... the filter for the Templates we want to count
     *   }
     * })
    **/
    count<T extends TemplateCountArgs>(
      args?: Subset<T, TemplateCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TemplateCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Template.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TemplateAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TemplateAggregateArgs>(args: Subset<T, TemplateAggregateArgs>): Prisma.PrismaPromise<GetTemplateAggregateType<T>>

    /**
     * Group by Template.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TemplateGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TemplateGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TemplateGroupByArgs['orderBy'] }
        : { orderBy?: TemplateGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TemplateGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTemplateGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Template model
   */
  readonly fields: TemplateFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Template.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TemplateClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    creatives<T extends Template$creativesArgs<ExtArgs> = {}>(args?: Subset<T, Template$creativesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CreativePayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Template model
   */ 
  interface TemplateFieldRefs {
    readonly id: FieldRef<"Template", 'String'>
    readonly name: FieldRef<"Template", 'String'>
    readonly category: FieldRef<"Template", 'String'>
    readonly width: FieldRef<"Template", 'Int'>
    readonly height: FieldRef<"Template", 'Int'>
    readonly layers: FieldRef<"Template", 'String'>
    readonly thumbnail: FieldRef<"Template", 'String'>
    readonly isSystem: FieldRef<"Template", 'Boolean'>
    readonly tenantId: FieldRef<"Template", 'String'>
    readonly createdAt: FieldRef<"Template", 'DateTime'>
    readonly updatedAt: FieldRef<"Template", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Template findUnique
   */
  export type TemplateFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Template
     */
    select?: TemplateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TemplateInclude<ExtArgs> | null
    /**
     * Filter, which Template to fetch.
     */
    where: TemplateWhereUniqueInput
  }

  /**
   * Template findUniqueOrThrow
   */
  export type TemplateFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Template
     */
    select?: TemplateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TemplateInclude<ExtArgs> | null
    /**
     * Filter, which Template to fetch.
     */
    where: TemplateWhereUniqueInput
  }

  /**
   * Template findFirst
   */
  export type TemplateFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Template
     */
    select?: TemplateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TemplateInclude<ExtArgs> | null
    /**
     * Filter, which Template to fetch.
     */
    where?: TemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Templates to fetch.
     */
    orderBy?: TemplateOrderByWithRelationInput | TemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Templates.
     */
    cursor?: TemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Templates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Templates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Templates.
     */
    distinct?: TemplateScalarFieldEnum | TemplateScalarFieldEnum[]
  }

  /**
   * Template findFirstOrThrow
   */
  export type TemplateFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Template
     */
    select?: TemplateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TemplateInclude<ExtArgs> | null
    /**
     * Filter, which Template to fetch.
     */
    where?: TemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Templates to fetch.
     */
    orderBy?: TemplateOrderByWithRelationInput | TemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Templates.
     */
    cursor?: TemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Templates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Templates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Templates.
     */
    distinct?: TemplateScalarFieldEnum | TemplateScalarFieldEnum[]
  }

  /**
   * Template findMany
   */
  export type TemplateFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Template
     */
    select?: TemplateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TemplateInclude<ExtArgs> | null
    /**
     * Filter, which Templates to fetch.
     */
    where?: TemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Templates to fetch.
     */
    orderBy?: TemplateOrderByWithRelationInput | TemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Templates.
     */
    cursor?: TemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Templates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Templates.
     */
    skip?: number
    distinct?: TemplateScalarFieldEnum | TemplateScalarFieldEnum[]
  }

  /**
   * Template create
   */
  export type TemplateCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Template
     */
    select?: TemplateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TemplateInclude<ExtArgs> | null
    /**
     * The data needed to create a Template.
     */
    data: XOR<TemplateCreateInput, TemplateUncheckedCreateInput>
  }

  /**
   * Template createMany
   */
  export type TemplateCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Templates.
     */
    data: TemplateCreateManyInput | TemplateCreateManyInput[]
  }

  /**
   * Template createManyAndReturn
   */
  export type TemplateCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Template
     */
    select?: TemplateSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Templates.
     */
    data: TemplateCreateManyInput | TemplateCreateManyInput[]
  }

  /**
   * Template update
   */
  export type TemplateUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Template
     */
    select?: TemplateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TemplateInclude<ExtArgs> | null
    /**
     * The data needed to update a Template.
     */
    data: XOR<TemplateUpdateInput, TemplateUncheckedUpdateInput>
    /**
     * Choose, which Template to update.
     */
    where: TemplateWhereUniqueInput
  }

  /**
   * Template updateMany
   */
  export type TemplateUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Templates.
     */
    data: XOR<TemplateUpdateManyMutationInput, TemplateUncheckedUpdateManyInput>
    /**
     * Filter which Templates to update
     */
    where?: TemplateWhereInput
  }

  /**
   * Template upsert
   */
  export type TemplateUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Template
     */
    select?: TemplateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TemplateInclude<ExtArgs> | null
    /**
     * The filter to search for the Template to update in case it exists.
     */
    where: TemplateWhereUniqueInput
    /**
     * In case the Template found by the `where` argument doesn't exist, create a new Template with this data.
     */
    create: XOR<TemplateCreateInput, TemplateUncheckedCreateInput>
    /**
     * In case the Template was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TemplateUpdateInput, TemplateUncheckedUpdateInput>
  }

  /**
   * Template delete
   */
  export type TemplateDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Template
     */
    select?: TemplateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TemplateInclude<ExtArgs> | null
    /**
     * Filter which Template to delete.
     */
    where: TemplateWhereUniqueInput
  }

  /**
   * Template deleteMany
   */
  export type TemplateDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Templates to delete
     */
    where?: TemplateWhereInput
  }

  /**
   * Template.creatives
   */
  export type Template$creativesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Creative
     */
    select?: CreativeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CreativeInclude<ExtArgs> | null
    where?: CreativeWhereInput
    orderBy?: CreativeOrderByWithRelationInput | CreativeOrderByWithRelationInput[]
    cursor?: CreativeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CreativeScalarFieldEnum | CreativeScalarFieldEnum[]
  }

  /**
   * Template without action
   */
  export type TemplateDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Template
     */
    select?: TemplateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TemplateInclude<ExtArgs> | null
  }


  /**
   * Model Creative
   */

  export type AggregateCreative = {
    _count: CreativeCountAggregateOutputType | null
    _avg: CreativeAvgAggregateOutputType | null
    _sum: CreativeSumAggregateOutputType | null
    _min: CreativeMinAggregateOutputType | null
    _max: CreativeMaxAggregateOutputType | null
  }

  export type CreativeAvgAggregateOutputType = {
    width: number | null
    height: number | null
    fileSize: number | null
  }

  export type CreativeSumAggregateOutputType = {
    width: number | null
    height: number | null
    fileSize: number | null
  }

  export type CreativeMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    templateId: string | null
    name: string | null
    type: string | null
    status: string | null
    inputData: string | null
    outputPath: string | null
    outputUrl: string | null
    format: string | null
    width: number | null
    height: number | null
    fileSize: number | null
    errorMsg: string | null
    jobId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CreativeMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    templateId: string | null
    name: string | null
    type: string | null
    status: string | null
    inputData: string | null
    outputPath: string | null
    outputUrl: string | null
    format: string | null
    width: number | null
    height: number | null
    fileSize: number | null
    errorMsg: string | null
    jobId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CreativeCountAggregateOutputType = {
    id: number
    tenantId: number
    templateId: number
    name: number
    type: number
    status: number
    inputData: number
    outputPath: number
    outputUrl: number
    format: number
    width: number
    height: number
    fileSize: number
    errorMsg: number
    jobId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CreativeAvgAggregateInputType = {
    width?: true
    height?: true
    fileSize?: true
  }

  export type CreativeSumAggregateInputType = {
    width?: true
    height?: true
    fileSize?: true
  }

  export type CreativeMinAggregateInputType = {
    id?: true
    tenantId?: true
    templateId?: true
    name?: true
    type?: true
    status?: true
    inputData?: true
    outputPath?: true
    outputUrl?: true
    format?: true
    width?: true
    height?: true
    fileSize?: true
    errorMsg?: true
    jobId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CreativeMaxAggregateInputType = {
    id?: true
    tenantId?: true
    templateId?: true
    name?: true
    type?: true
    status?: true
    inputData?: true
    outputPath?: true
    outputUrl?: true
    format?: true
    width?: true
    height?: true
    fileSize?: true
    errorMsg?: true
    jobId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CreativeCountAggregateInputType = {
    id?: true
    tenantId?: true
    templateId?: true
    name?: true
    type?: true
    status?: true
    inputData?: true
    outputPath?: true
    outputUrl?: true
    format?: true
    width?: true
    height?: true
    fileSize?: true
    errorMsg?: true
    jobId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CreativeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Creative to aggregate.
     */
    where?: CreativeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Creatives to fetch.
     */
    orderBy?: CreativeOrderByWithRelationInput | CreativeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CreativeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Creatives from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Creatives.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Creatives
    **/
    _count?: true | CreativeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CreativeAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CreativeSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CreativeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CreativeMaxAggregateInputType
  }

  export type GetCreativeAggregateType<T extends CreativeAggregateArgs> = {
        [P in keyof T & keyof AggregateCreative]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCreative[P]>
      : GetScalarType<T[P], AggregateCreative[P]>
  }




  export type CreativeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CreativeWhereInput
    orderBy?: CreativeOrderByWithAggregationInput | CreativeOrderByWithAggregationInput[]
    by: CreativeScalarFieldEnum[] | CreativeScalarFieldEnum
    having?: CreativeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CreativeCountAggregateInputType | true
    _avg?: CreativeAvgAggregateInputType
    _sum?: CreativeSumAggregateInputType
    _min?: CreativeMinAggregateInputType
    _max?: CreativeMaxAggregateInputType
  }

  export type CreativeGroupByOutputType = {
    id: string
    tenantId: string
    templateId: string | null
    name: string
    type: string
    status: string
    inputData: string
    outputPath: string | null
    outputUrl: string | null
    format: string
    width: number | null
    height: number | null
    fileSize: number | null
    errorMsg: string | null
    jobId: string | null
    createdAt: Date
    updatedAt: Date
    _count: CreativeCountAggregateOutputType | null
    _avg: CreativeAvgAggregateOutputType | null
    _sum: CreativeSumAggregateOutputType | null
    _min: CreativeMinAggregateOutputType | null
    _max: CreativeMaxAggregateOutputType | null
  }

  type GetCreativeGroupByPayload<T extends CreativeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CreativeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CreativeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CreativeGroupByOutputType[P]>
            : GetScalarType<T[P], CreativeGroupByOutputType[P]>
        }
      >
    >


  export type CreativeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    templateId?: boolean
    name?: boolean
    type?: boolean
    status?: boolean
    inputData?: boolean
    outputPath?: boolean
    outputUrl?: boolean
    format?: boolean
    width?: boolean
    height?: boolean
    fileSize?: boolean
    errorMsg?: boolean
    jobId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    template?: boolean | Creative$templateArgs<ExtArgs>
    exports?: boolean | Creative$exportsArgs<ExtArgs>
    _count?: boolean | CreativeCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["creative"]>

  export type CreativeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    templateId?: boolean
    name?: boolean
    type?: boolean
    status?: boolean
    inputData?: boolean
    outputPath?: boolean
    outputUrl?: boolean
    format?: boolean
    width?: boolean
    height?: boolean
    fileSize?: boolean
    errorMsg?: boolean
    jobId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    template?: boolean | Creative$templateArgs<ExtArgs>
  }, ExtArgs["result"]["creative"]>

  export type CreativeSelectScalar = {
    id?: boolean
    tenantId?: boolean
    templateId?: boolean
    name?: boolean
    type?: boolean
    status?: boolean
    inputData?: boolean
    outputPath?: boolean
    outputUrl?: boolean
    format?: boolean
    width?: boolean
    height?: boolean
    fileSize?: boolean
    errorMsg?: boolean
    jobId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CreativeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    template?: boolean | Creative$templateArgs<ExtArgs>
    exports?: boolean | Creative$exportsArgs<ExtArgs>
    _count?: boolean | CreativeCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CreativeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    template?: boolean | Creative$templateArgs<ExtArgs>
  }

  export type $CreativePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Creative"
    objects: {
      template: Prisma.$TemplatePayload<ExtArgs> | null
      exports: Prisma.$ExportPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      templateId: string | null
      name: string
      type: string
      status: string
      inputData: string
      outputPath: string | null
      outputUrl: string | null
      format: string
      width: number | null
      height: number | null
      fileSize: number | null
      errorMsg: string | null
      jobId: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["creative"]>
    composites: {}
  }

  type CreativeGetPayload<S extends boolean | null | undefined | CreativeDefaultArgs> = $Result.GetResult<Prisma.$CreativePayload, S>

  type CreativeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CreativeFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CreativeCountAggregateInputType | true
    }

  export interface CreativeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Creative'], meta: { name: 'Creative' } }
    /**
     * Find zero or one Creative that matches the filter.
     * @param {CreativeFindUniqueArgs} args - Arguments to find a Creative
     * @example
     * // Get one Creative
     * const creative = await prisma.creative.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CreativeFindUniqueArgs>(args: SelectSubset<T, CreativeFindUniqueArgs<ExtArgs>>): Prisma__CreativeClient<$Result.GetResult<Prisma.$CreativePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Creative that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CreativeFindUniqueOrThrowArgs} args - Arguments to find a Creative
     * @example
     * // Get one Creative
     * const creative = await prisma.creative.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CreativeFindUniqueOrThrowArgs>(args: SelectSubset<T, CreativeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CreativeClient<$Result.GetResult<Prisma.$CreativePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Creative that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CreativeFindFirstArgs} args - Arguments to find a Creative
     * @example
     * // Get one Creative
     * const creative = await prisma.creative.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CreativeFindFirstArgs>(args?: SelectSubset<T, CreativeFindFirstArgs<ExtArgs>>): Prisma__CreativeClient<$Result.GetResult<Prisma.$CreativePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Creative that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CreativeFindFirstOrThrowArgs} args - Arguments to find a Creative
     * @example
     * // Get one Creative
     * const creative = await prisma.creative.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CreativeFindFirstOrThrowArgs>(args?: SelectSubset<T, CreativeFindFirstOrThrowArgs<ExtArgs>>): Prisma__CreativeClient<$Result.GetResult<Prisma.$CreativePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Creatives that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CreativeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Creatives
     * const creatives = await prisma.creative.findMany()
     * 
     * // Get first 10 Creatives
     * const creatives = await prisma.creative.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const creativeWithIdOnly = await prisma.creative.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CreativeFindManyArgs>(args?: SelectSubset<T, CreativeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CreativePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Creative.
     * @param {CreativeCreateArgs} args - Arguments to create a Creative.
     * @example
     * // Create one Creative
     * const Creative = await prisma.creative.create({
     *   data: {
     *     // ... data to create a Creative
     *   }
     * })
     * 
     */
    create<T extends CreativeCreateArgs>(args: SelectSubset<T, CreativeCreateArgs<ExtArgs>>): Prisma__CreativeClient<$Result.GetResult<Prisma.$CreativePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Creatives.
     * @param {CreativeCreateManyArgs} args - Arguments to create many Creatives.
     * @example
     * // Create many Creatives
     * const creative = await prisma.creative.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CreativeCreateManyArgs>(args?: SelectSubset<T, CreativeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Creatives and returns the data saved in the database.
     * @param {CreativeCreateManyAndReturnArgs} args - Arguments to create many Creatives.
     * @example
     * // Create many Creatives
     * const creative = await prisma.creative.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Creatives and only return the `id`
     * const creativeWithIdOnly = await prisma.creative.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CreativeCreateManyAndReturnArgs>(args?: SelectSubset<T, CreativeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CreativePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Creative.
     * @param {CreativeDeleteArgs} args - Arguments to delete one Creative.
     * @example
     * // Delete one Creative
     * const Creative = await prisma.creative.delete({
     *   where: {
     *     // ... filter to delete one Creative
     *   }
     * })
     * 
     */
    delete<T extends CreativeDeleteArgs>(args: SelectSubset<T, CreativeDeleteArgs<ExtArgs>>): Prisma__CreativeClient<$Result.GetResult<Prisma.$CreativePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Creative.
     * @param {CreativeUpdateArgs} args - Arguments to update one Creative.
     * @example
     * // Update one Creative
     * const creative = await prisma.creative.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CreativeUpdateArgs>(args: SelectSubset<T, CreativeUpdateArgs<ExtArgs>>): Prisma__CreativeClient<$Result.GetResult<Prisma.$CreativePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Creatives.
     * @param {CreativeDeleteManyArgs} args - Arguments to filter Creatives to delete.
     * @example
     * // Delete a few Creatives
     * const { count } = await prisma.creative.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CreativeDeleteManyArgs>(args?: SelectSubset<T, CreativeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Creatives.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CreativeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Creatives
     * const creative = await prisma.creative.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CreativeUpdateManyArgs>(args: SelectSubset<T, CreativeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Creative.
     * @param {CreativeUpsertArgs} args - Arguments to update or create a Creative.
     * @example
     * // Update or create a Creative
     * const creative = await prisma.creative.upsert({
     *   create: {
     *     // ... data to create a Creative
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Creative we want to update
     *   }
     * })
     */
    upsert<T extends CreativeUpsertArgs>(args: SelectSubset<T, CreativeUpsertArgs<ExtArgs>>): Prisma__CreativeClient<$Result.GetResult<Prisma.$CreativePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Creatives.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CreativeCountArgs} args - Arguments to filter Creatives to count.
     * @example
     * // Count the number of Creatives
     * const count = await prisma.creative.count({
     *   where: {
     *     // ... the filter for the Creatives we want to count
     *   }
     * })
    **/
    count<T extends CreativeCountArgs>(
      args?: Subset<T, CreativeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CreativeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Creative.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CreativeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CreativeAggregateArgs>(args: Subset<T, CreativeAggregateArgs>): Prisma.PrismaPromise<GetCreativeAggregateType<T>>

    /**
     * Group by Creative.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CreativeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CreativeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CreativeGroupByArgs['orderBy'] }
        : { orderBy?: CreativeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CreativeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCreativeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Creative model
   */
  readonly fields: CreativeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Creative.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CreativeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    template<T extends Creative$templateArgs<ExtArgs> = {}>(args?: Subset<T, Creative$templateArgs<ExtArgs>>): Prisma__TemplateClient<$Result.GetResult<Prisma.$TemplatePayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    exports<T extends Creative$exportsArgs<ExtArgs> = {}>(args?: Subset<T, Creative$exportsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExportPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Creative model
   */ 
  interface CreativeFieldRefs {
    readonly id: FieldRef<"Creative", 'String'>
    readonly tenantId: FieldRef<"Creative", 'String'>
    readonly templateId: FieldRef<"Creative", 'String'>
    readonly name: FieldRef<"Creative", 'String'>
    readonly type: FieldRef<"Creative", 'String'>
    readonly status: FieldRef<"Creative", 'String'>
    readonly inputData: FieldRef<"Creative", 'String'>
    readonly outputPath: FieldRef<"Creative", 'String'>
    readonly outputUrl: FieldRef<"Creative", 'String'>
    readonly format: FieldRef<"Creative", 'String'>
    readonly width: FieldRef<"Creative", 'Int'>
    readonly height: FieldRef<"Creative", 'Int'>
    readonly fileSize: FieldRef<"Creative", 'Int'>
    readonly errorMsg: FieldRef<"Creative", 'String'>
    readonly jobId: FieldRef<"Creative", 'String'>
    readonly createdAt: FieldRef<"Creative", 'DateTime'>
    readonly updatedAt: FieldRef<"Creative", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Creative findUnique
   */
  export type CreativeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Creative
     */
    select?: CreativeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CreativeInclude<ExtArgs> | null
    /**
     * Filter, which Creative to fetch.
     */
    where: CreativeWhereUniqueInput
  }

  /**
   * Creative findUniqueOrThrow
   */
  export type CreativeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Creative
     */
    select?: CreativeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CreativeInclude<ExtArgs> | null
    /**
     * Filter, which Creative to fetch.
     */
    where: CreativeWhereUniqueInput
  }

  /**
   * Creative findFirst
   */
  export type CreativeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Creative
     */
    select?: CreativeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CreativeInclude<ExtArgs> | null
    /**
     * Filter, which Creative to fetch.
     */
    where?: CreativeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Creatives to fetch.
     */
    orderBy?: CreativeOrderByWithRelationInput | CreativeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Creatives.
     */
    cursor?: CreativeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Creatives from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Creatives.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Creatives.
     */
    distinct?: CreativeScalarFieldEnum | CreativeScalarFieldEnum[]
  }

  /**
   * Creative findFirstOrThrow
   */
  export type CreativeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Creative
     */
    select?: CreativeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CreativeInclude<ExtArgs> | null
    /**
     * Filter, which Creative to fetch.
     */
    where?: CreativeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Creatives to fetch.
     */
    orderBy?: CreativeOrderByWithRelationInput | CreativeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Creatives.
     */
    cursor?: CreativeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Creatives from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Creatives.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Creatives.
     */
    distinct?: CreativeScalarFieldEnum | CreativeScalarFieldEnum[]
  }

  /**
   * Creative findMany
   */
  export type CreativeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Creative
     */
    select?: CreativeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CreativeInclude<ExtArgs> | null
    /**
     * Filter, which Creatives to fetch.
     */
    where?: CreativeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Creatives to fetch.
     */
    orderBy?: CreativeOrderByWithRelationInput | CreativeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Creatives.
     */
    cursor?: CreativeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Creatives from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Creatives.
     */
    skip?: number
    distinct?: CreativeScalarFieldEnum | CreativeScalarFieldEnum[]
  }

  /**
   * Creative create
   */
  export type CreativeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Creative
     */
    select?: CreativeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CreativeInclude<ExtArgs> | null
    /**
     * The data needed to create a Creative.
     */
    data: XOR<CreativeCreateInput, CreativeUncheckedCreateInput>
  }

  /**
   * Creative createMany
   */
  export type CreativeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Creatives.
     */
    data: CreativeCreateManyInput | CreativeCreateManyInput[]
  }

  /**
   * Creative createManyAndReturn
   */
  export type CreativeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Creative
     */
    select?: CreativeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Creatives.
     */
    data: CreativeCreateManyInput | CreativeCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CreativeIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Creative update
   */
  export type CreativeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Creative
     */
    select?: CreativeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CreativeInclude<ExtArgs> | null
    /**
     * The data needed to update a Creative.
     */
    data: XOR<CreativeUpdateInput, CreativeUncheckedUpdateInput>
    /**
     * Choose, which Creative to update.
     */
    where: CreativeWhereUniqueInput
  }

  /**
   * Creative updateMany
   */
  export type CreativeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Creatives.
     */
    data: XOR<CreativeUpdateManyMutationInput, CreativeUncheckedUpdateManyInput>
    /**
     * Filter which Creatives to update
     */
    where?: CreativeWhereInput
  }

  /**
   * Creative upsert
   */
  export type CreativeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Creative
     */
    select?: CreativeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CreativeInclude<ExtArgs> | null
    /**
     * The filter to search for the Creative to update in case it exists.
     */
    where: CreativeWhereUniqueInput
    /**
     * In case the Creative found by the `where` argument doesn't exist, create a new Creative with this data.
     */
    create: XOR<CreativeCreateInput, CreativeUncheckedCreateInput>
    /**
     * In case the Creative was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CreativeUpdateInput, CreativeUncheckedUpdateInput>
  }

  /**
   * Creative delete
   */
  export type CreativeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Creative
     */
    select?: CreativeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CreativeInclude<ExtArgs> | null
    /**
     * Filter which Creative to delete.
     */
    where: CreativeWhereUniqueInput
  }

  /**
   * Creative deleteMany
   */
  export type CreativeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Creatives to delete
     */
    where?: CreativeWhereInput
  }

  /**
   * Creative.template
   */
  export type Creative$templateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Template
     */
    select?: TemplateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TemplateInclude<ExtArgs> | null
    where?: TemplateWhereInput
  }

  /**
   * Creative.exports
   */
  export type Creative$exportsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Export
     */
    select?: ExportSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExportInclude<ExtArgs> | null
    where?: ExportWhereInput
    orderBy?: ExportOrderByWithRelationInput | ExportOrderByWithRelationInput[]
    cursor?: ExportWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ExportScalarFieldEnum | ExportScalarFieldEnum[]
  }

  /**
   * Creative without action
   */
  export type CreativeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Creative
     */
    select?: CreativeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CreativeInclude<ExtArgs> | null
  }


  /**
   * Model Export
   */

  export type AggregateExport = {
    _count: ExportCountAggregateOutputType | null
    _avg: ExportAvgAggregateOutputType | null
    _sum: ExportSumAggregateOutputType | null
    _min: ExportMinAggregateOutputType | null
    _max: ExportMaxAggregateOutputType | null
  }

  export type ExportAvgAggregateOutputType = {
    width: number | null
    height: number | null
    quality: number | null
  }

  export type ExportSumAggregateOutputType = {
    width: number | null
    height: number | null
    quality: number | null
  }

  export type ExportMinAggregateOutputType = {
    id: string | null
    creativeId: string | null
    format: string | null
    width: number | null
    height: number | null
    quality: number | null
    outputPath: string | null
    status: string | null
    createdAt: Date | null
  }

  export type ExportMaxAggregateOutputType = {
    id: string | null
    creativeId: string | null
    format: string | null
    width: number | null
    height: number | null
    quality: number | null
    outputPath: string | null
    status: string | null
    createdAt: Date | null
  }

  export type ExportCountAggregateOutputType = {
    id: number
    creativeId: number
    format: number
    width: number
    height: number
    quality: number
    outputPath: number
    status: number
    createdAt: number
    _all: number
  }


  export type ExportAvgAggregateInputType = {
    width?: true
    height?: true
    quality?: true
  }

  export type ExportSumAggregateInputType = {
    width?: true
    height?: true
    quality?: true
  }

  export type ExportMinAggregateInputType = {
    id?: true
    creativeId?: true
    format?: true
    width?: true
    height?: true
    quality?: true
    outputPath?: true
    status?: true
    createdAt?: true
  }

  export type ExportMaxAggregateInputType = {
    id?: true
    creativeId?: true
    format?: true
    width?: true
    height?: true
    quality?: true
    outputPath?: true
    status?: true
    createdAt?: true
  }

  export type ExportCountAggregateInputType = {
    id?: true
    creativeId?: true
    format?: true
    width?: true
    height?: true
    quality?: true
    outputPath?: true
    status?: true
    createdAt?: true
    _all?: true
  }

  export type ExportAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Export to aggregate.
     */
    where?: ExportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Exports to fetch.
     */
    orderBy?: ExportOrderByWithRelationInput | ExportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ExportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Exports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Exports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Exports
    **/
    _count?: true | ExportCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ExportAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ExportSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ExportMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ExportMaxAggregateInputType
  }

  export type GetExportAggregateType<T extends ExportAggregateArgs> = {
        [P in keyof T & keyof AggregateExport]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateExport[P]>
      : GetScalarType<T[P], AggregateExport[P]>
  }




  export type ExportGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ExportWhereInput
    orderBy?: ExportOrderByWithAggregationInput | ExportOrderByWithAggregationInput[]
    by: ExportScalarFieldEnum[] | ExportScalarFieldEnum
    having?: ExportScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ExportCountAggregateInputType | true
    _avg?: ExportAvgAggregateInputType
    _sum?: ExportSumAggregateInputType
    _min?: ExportMinAggregateInputType
    _max?: ExportMaxAggregateInputType
  }

  export type ExportGroupByOutputType = {
    id: string
    creativeId: string
    format: string
    width: number
    height: number
    quality: number
    outputPath: string | null
    status: string
    createdAt: Date
    _count: ExportCountAggregateOutputType | null
    _avg: ExportAvgAggregateOutputType | null
    _sum: ExportSumAggregateOutputType | null
    _min: ExportMinAggregateOutputType | null
    _max: ExportMaxAggregateOutputType | null
  }

  type GetExportGroupByPayload<T extends ExportGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ExportGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ExportGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ExportGroupByOutputType[P]>
            : GetScalarType<T[P], ExportGroupByOutputType[P]>
        }
      >
    >


  export type ExportSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    creativeId?: boolean
    format?: boolean
    width?: boolean
    height?: boolean
    quality?: boolean
    outputPath?: boolean
    status?: boolean
    createdAt?: boolean
    creative?: boolean | CreativeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["export"]>

  export type ExportSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    creativeId?: boolean
    format?: boolean
    width?: boolean
    height?: boolean
    quality?: boolean
    outputPath?: boolean
    status?: boolean
    createdAt?: boolean
    creative?: boolean | CreativeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["export"]>

  export type ExportSelectScalar = {
    id?: boolean
    creativeId?: boolean
    format?: boolean
    width?: boolean
    height?: boolean
    quality?: boolean
    outputPath?: boolean
    status?: boolean
    createdAt?: boolean
  }

  export type ExportInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    creative?: boolean | CreativeDefaultArgs<ExtArgs>
  }
  export type ExportIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    creative?: boolean | CreativeDefaultArgs<ExtArgs>
  }

  export type $ExportPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Export"
    objects: {
      creative: Prisma.$CreativePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      creativeId: string
      format: string
      width: number
      height: number
      quality: number
      outputPath: string | null
      status: string
      createdAt: Date
    }, ExtArgs["result"]["export"]>
    composites: {}
  }

  type ExportGetPayload<S extends boolean | null | undefined | ExportDefaultArgs> = $Result.GetResult<Prisma.$ExportPayload, S>

  type ExportCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ExportFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ExportCountAggregateInputType | true
    }

  export interface ExportDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Export'], meta: { name: 'Export' } }
    /**
     * Find zero or one Export that matches the filter.
     * @param {ExportFindUniqueArgs} args - Arguments to find a Export
     * @example
     * // Get one Export
     * const export = await prisma.export.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ExportFindUniqueArgs>(args: SelectSubset<T, ExportFindUniqueArgs<ExtArgs>>): Prisma__ExportClient<$Result.GetResult<Prisma.$ExportPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Export that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ExportFindUniqueOrThrowArgs} args - Arguments to find a Export
     * @example
     * // Get one Export
     * const export = await prisma.export.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ExportFindUniqueOrThrowArgs>(args: SelectSubset<T, ExportFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ExportClient<$Result.GetResult<Prisma.$ExportPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Export that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExportFindFirstArgs} args - Arguments to find a Export
     * @example
     * // Get one Export
     * const export = await prisma.export.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ExportFindFirstArgs>(args?: SelectSubset<T, ExportFindFirstArgs<ExtArgs>>): Prisma__ExportClient<$Result.GetResult<Prisma.$ExportPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Export that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExportFindFirstOrThrowArgs} args - Arguments to find a Export
     * @example
     * // Get one Export
     * const export = await prisma.export.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ExportFindFirstOrThrowArgs>(args?: SelectSubset<T, ExportFindFirstOrThrowArgs<ExtArgs>>): Prisma__ExportClient<$Result.GetResult<Prisma.$ExportPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Exports that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExportFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Exports
     * const exports = await prisma.export.findMany()
     * 
     * // Get first 10 Exports
     * const exports = await prisma.export.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const exportWithIdOnly = await prisma.export.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ExportFindManyArgs>(args?: SelectSubset<T, ExportFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExportPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Export.
     * @param {ExportCreateArgs} args - Arguments to create a Export.
     * @example
     * // Create one Export
     * const Export = await prisma.export.create({
     *   data: {
     *     // ... data to create a Export
     *   }
     * })
     * 
     */
    create<T extends ExportCreateArgs>(args: SelectSubset<T, ExportCreateArgs<ExtArgs>>): Prisma__ExportClient<$Result.GetResult<Prisma.$ExportPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Exports.
     * @param {ExportCreateManyArgs} args - Arguments to create many Exports.
     * @example
     * // Create many Exports
     * const export = await prisma.export.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ExportCreateManyArgs>(args?: SelectSubset<T, ExportCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Exports and returns the data saved in the database.
     * @param {ExportCreateManyAndReturnArgs} args - Arguments to create many Exports.
     * @example
     * // Create many Exports
     * const export = await prisma.export.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Exports and only return the `id`
     * const exportWithIdOnly = await prisma.export.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ExportCreateManyAndReturnArgs>(args?: SelectSubset<T, ExportCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExportPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Export.
     * @param {ExportDeleteArgs} args - Arguments to delete one Export.
     * @example
     * // Delete one Export
     * const Export = await prisma.export.delete({
     *   where: {
     *     // ... filter to delete one Export
     *   }
     * })
     * 
     */
    delete<T extends ExportDeleteArgs>(args: SelectSubset<T, ExportDeleteArgs<ExtArgs>>): Prisma__ExportClient<$Result.GetResult<Prisma.$ExportPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Export.
     * @param {ExportUpdateArgs} args - Arguments to update one Export.
     * @example
     * // Update one Export
     * const export = await prisma.export.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ExportUpdateArgs>(args: SelectSubset<T, ExportUpdateArgs<ExtArgs>>): Prisma__ExportClient<$Result.GetResult<Prisma.$ExportPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Exports.
     * @param {ExportDeleteManyArgs} args - Arguments to filter Exports to delete.
     * @example
     * // Delete a few Exports
     * const { count } = await prisma.export.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ExportDeleteManyArgs>(args?: SelectSubset<T, ExportDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Exports.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExportUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Exports
     * const export = await prisma.export.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ExportUpdateManyArgs>(args: SelectSubset<T, ExportUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Export.
     * @param {ExportUpsertArgs} args - Arguments to update or create a Export.
     * @example
     * // Update or create a Export
     * const export = await prisma.export.upsert({
     *   create: {
     *     // ... data to create a Export
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Export we want to update
     *   }
     * })
     */
    upsert<T extends ExportUpsertArgs>(args: SelectSubset<T, ExportUpsertArgs<ExtArgs>>): Prisma__ExportClient<$Result.GetResult<Prisma.$ExportPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Exports.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExportCountArgs} args - Arguments to filter Exports to count.
     * @example
     * // Count the number of Exports
     * const count = await prisma.export.count({
     *   where: {
     *     // ... the filter for the Exports we want to count
     *   }
     * })
    **/
    count<T extends ExportCountArgs>(
      args?: Subset<T, ExportCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ExportCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Export.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExportAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ExportAggregateArgs>(args: Subset<T, ExportAggregateArgs>): Prisma.PrismaPromise<GetExportAggregateType<T>>

    /**
     * Group by Export.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExportGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ExportGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ExportGroupByArgs['orderBy'] }
        : { orderBy?: ExportGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ExportGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetExportGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Export model
   */
  readonly fields: ExportFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Export.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ExportClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    creative<T extends CreativeDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CreativeDefaultArgs<ExtArgs>>): Prisma__CreativeClient<$Result.GetResult<Prisma.$CreativePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Export model
   */ 
  interface ExportFieldRefs {
    readonly id: FieldRef<"Export", 'String'>
    readonly creativeId: FieldRef<"Export", 'String'>
    readonly format: FieldRef<"Export", 'String'>
    readonly width: FieldRef<"Export", 'Int'>
    readonly height: FieldRef<"Export", 'Int'>
    readonly quality: FieldRef<"Export", 'Int'>
    readonly outputPath: FieldRef<"Export", 'String'>
    readonly status: FieldRef<"Export", 'String'>
    readonly createdAt: FieldRef<"Export", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Export findUnique
   */
  export type ExportFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Export
     */
    select?: ExportSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExportInclude<ExtArgs> | null
    /**
     * Filter, which Export to fetch.
     */
    where: ExportWhereUniqueInput
  }

  /**
   * Export findUniqueOrThrow
   */
  export type ExportFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Export
     */
    select?: ExportSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExportInclude<ExtArgs> | null
    /**
     * Filter, which Export to fetch.
     */
    where: ExportWhereUniqueInput
  }

  /**
   * Export findFirst
   */
  export type ExportFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Export
     */
    select?: ExportSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExportInclude<ExtArgs> | null
    /**
     * Filter, which Export to fetch.
     */
    where?: ExportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Exports to fetch.
     */
    orderBy?: ExportOrderByWithRelationInput | ExportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Exports.
     */
    cursor?: ExportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Exports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Exports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Exports.
     */
    distinct?: ExportScalarFieldEnum | ExportScalarFieldEnum[]
  }

  /**
   * Export findFirstOrThrow
   */
  export type ExportFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Export
     */
    select?: ExportSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExportInclude<ExtArgs> | null
    /**
     * Filter, which Export to fetch.
     */
    where?: ExportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Exports to fetch.
     */
    orderBy?: ExportOrderByWithRelationInput | ExportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Exports.
     */
    cursor?: ExportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Exports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Exports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Exports.
     */
    distinct?: ExportScalarFieldEnum | ExportScalarFieldEnum[]
  }

  /**
   * Export findMany
   */
  export type ExportFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Export
     */
    select?: ExportSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExportInclude<ExtArgs> | null
    /**
     * Filter, which Exports to fetch.
     */
    where?: ExportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Exports to fetch.
     */
    orderBy?: ExportOrderByWithRelationInput | ExportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Exports.
     */
    cursor?: ExportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Exports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Exports.
     */
    skip?: number
    distinct?: ExportScalarFieldEnum | ExportScalarFieldEnum[]
  }

  /**
   * Export create
   */
  export type ExportCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Export
     */
    select?: ExportSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExportInclude<ExtArgs> | null
    /**
     * The data needed to create a Export.
     */
    data: XOR<ExportCreateInput, ExportUncheckedCreateInput>
  }

  /**
   * Export createMany
   */
  export type ExportCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Exports.
     */
    data: ExportCreateManyInput | ExportCreateManyInput[]
  }

  /**
   * Export createManyAndReturn
   */
  export type ExportCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Export
     */
    select?: ExportSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Exports.
     */
    data: ExportCreateManyInput | ExportCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExportIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Export update
   */
  export type ExportUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Export
     */
    select?: ExportSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExportInclude<ExtArgs> | null
    /**
     * The data needed to update a Export.
     */
    data: XOR<ExportUpdateInput, ExportUncheckedUpdateInput>
    /**
     * Choose, which Export to update.
     */
    where: ExportWhereUniqueInput
  }

  /**
   * Export updateMany
   */
  export type ExportUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Exports.
     */
    data: XOR<ExportUpdateManyMutationInput, ExportUncheckedUpdateManyInput>
    /**
     * Filter which Exports to update
     */
    where?: ExportWhereInput
  }

  /**
   * Export upsert
   */
  export type ExportUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Export
     */
    select?: ExportSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExportInclude<ExtArgs> | null
    /**
     * The filter to search for the Export to update in case it exists.
     */
    where: ExportWhereUniqueInput
    /**
     * In case the Export found by the `where` argument doesn't exist, create a new Export with this data.
     */
    create: XOR<ExportCreateInput, ExportUncheckedCreateInput>
    /**
     * In case the Export was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ExportUpdateInput, ExportUncheckedUpdateInput>
  }

  /**
   * Export delete
   */
  export type ExportDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Export
     */
    select?: ExportSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExportInclude<ExtArgs> | null
    /**
     * Filter which Export to delete.
     */
    where: ExportWhereUniqueInput
  }

  /**
   * Export deleteMany
   */
  export type ExportDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Exports to delete
     */
    where?: ExportWhereInput
  }

  /**
   * Export without action
   */
  export type ExportDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Export
     */
    select?: ExportSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExportInclude<ExtArgs> | null
  }


  /**
   * Model DeviceFrame
   */

  export type AggregateDeviceFrame = {
    _count: DeviceFrameCountAggregateOutputType | null
    _avg: DeviceFrameAvgAggregateOutputType | null
    _sum: DeviceFrameSumAggregateOutputType | null
    _min: DeviceFrameMinAggregateOutputType | null
    _max: DeviceFrameMaxAggregateOutputType | null
  }

  export type DeviceFrameAvgAggregateOutputType = {
    screenX: number | null
    screenY: number | null
    screenW: number | null
    screenH: number | null
    cornerRadius: number | null
  }

  export type DeviceFrameSumAggregateOutputType = {
    screenX: number | null
    screenY: number | null
    screenW: number | null
    screenH: number | null
    cornerRadius: number | null
  }

  export type DeviceFrameMinAggregateOutputType = {
    id: string | null
    name: string | null
    category: string | null
    framePath: string | null
    screenX: number | null
    screenY: number | null
    screenW: number | null
    screenH: number | null
    cornerRadius: number | null
  }

  export type DeviceFrameMaxAggregateOutputType = {
    id: string | null
    name: string | null
    category: string | null
    framePath: string | null
    screenX: number | null
    screenY: number | null
    screenW: number | null
    screenH: number | null
    cornerRadius: number | null
  }

  export type DeviceFrameCountAggregateOutputType = {
    id: number
    name: number
    category: number
    framePath: number
    screenX: number
    screenY: number
    screenW: number
    screenH: number
    cornerRadius: number
    _all: number
  }


  export type DeviceFrameAvgAggregateInputType = {
    screenX?: true
    screenY?: true
    screenW?: true
    screenH?: true
    cornerRadius?: true
  }

  export type DeviceFrameSumAggregateInputType = {
    screenX?: true
    screenY?: true
    screenW?: true
    screenH?: true
    cornerRadius?: true
  }

  export type DeviceFrameMinAggregateInputType = {
    id?: true
    name?: true
    category?: true
    framePath?: true
    screenX?: true
    screenY?: true
    screenW?: true
    screenH?: true
    cornerRadius?: true
  }

  export type DeviceFrameMaxAggregateInputType = {
    id?: true
    name?: true
    category?: true
    framePath?: true
    screenX?: true
    screenY?: true
    screenW?: true
    screenH?: true
    cornerRadius?: true
  }

  export type DeviceFrameCountAggregateInputType = {
    id?: true
    name?: true
    category?: true
    framePath?: true
    screenX?: true
    screenY?: true
    screenW?: true
    screenH?: true
    cornerRadius?: true
    _all?: true
  }

  export type DeviceFrameAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DeviceFrame to aggregate.
     */
    where?: DeviceFrameWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DeviceFrames to fetch.
     */
    orderBy?: DeviceFrameOrderByWithRelationInput | DeviceFrameOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DeviceFrameWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DeviceFrames from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DeviceFrames.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DeviceFrames
    **/
    _count?: true | DeviceFrameCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DeviceFrameAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DeviceFrameSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DeviceFrameMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DeviceFrameMaxAggregateInputType
  }

  export type GetDeviceFrameAggregateType<T extends DeviceFrameAggregateArgs> = {
        [P in keyof T & keyof AggregateDeviceFrame]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDeviceFrame[P]>
      : GetScalarType<T[P], AggregateDeviceFrame[P]>
  }




  export type DeviceFrameGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DeviceFrameWhereInput
    orderBy?: DeviceFrameOrderByWithAggregationInput | DeviceFrameOrderByWithAggregationInput[]
    by: DeviceFrameScalarFieldEnum[] | DeviceFrameScalarFieldEnum
    having?: DeviceFrameScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DeviceFrameCountAggregateInputType | true
    _avg?: DeviceFrameAvgAggregateInputType
    _sum?: DeviceFrameSumAggregateInputType
    _min?: DeviceFrameMinAggregateInputType
    _max?: DeviceFrameMaxAggregateInputType
  }

  export type DeviceFrameGroupByOutputType = {
    id: string
    name: string
    category: string
    framePath: string
    screenX: number
    screenY: number
    screenW: number
    screenH: number
    cornerRadius: number
    _count: DeviceFrameCountAggregateOutputType | null
    _avg: DeviceFrameAvgAggregateOutputType | null
    _sum: DeviceFrameSumAggregateOutputType | null
    _min: DeviceFrameMinAggregateOutputType | null
    _max: DeviceFrameMaxAggregateOutputType | null
  }

  type GetDeviceFrameGroupByPayload<T extends DeviceFrameGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DeviceFrameGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DeviceFrameGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DeviceFrameGroupByOutputType[P]>
            : GetScalarType<T[P], DeviceFrameGroupByOutputType[P]>
        }
      >
    >


  export type DeviceFrameSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    category?: boolean
    framePath?: boolean
    screenX?: boolean
    screenY?: boolean
    screenW?: boolean
    screenH?: boolean
    cornerRadius?: boolean
  }, ExtArgs["result"]["deviceFrame"]>

  export type DeviceFrameSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    category?: boolean
    framePath?: boolean
    screenX?: boolean
    screenY?: boolean
    screenW?: boolean
    screenH?: boolean
    cornerRadius?: boolean
  }, ExtArgs["result"]["deviceFrame"]>

  export type DeviceFrameSelectScalar = {
    id?: boolean
    name?: boolean
    category?: boolean
    framePath?: boolean
    screenX?: boolean
    screenY?: boolean
    screenW?: boolean
    screenH?: boolean
    cornerRadius?: boolean
  }


  export type $DeviceFramePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DeviceFrame"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      category: string
      framePath: string
      screenX: number
      screenY: number
      screenW: number
      screenH: number
      cornerRadius: number
    }, ExtArgs["result"]["deviceFrame"]>
    composites: {}
  }

  type DeviceFrameGetPayload<S extends boolean | null | undefined | DeviceFrameDefaultArgs> = $Result.GetResult<Prisma.$DeviceFramePayload, S>

  type DeviceFrameCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<DeviceFrameFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: DeviceFrameCountAggregateInputType | true
    }

  export interface DeviceFrameDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DeviceFrame'], meta: { name: 'DeviceFrame' } }
    /**
     * Find zero or one DeviceFrame that matches the filter.
     * @param {DeviceFrameFindUniqueArgs} args - Arguments to find a DeviceFrame
     * @example
     * // Get one DeviceFrame
     * const deviceFrame = await prisma.deviceFrame.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DeviceFrameFindUniqueArgs>(args: SelectSubset<T, DeviceFrameFindUniqueArgs<ExtArgs>>): Prisma__DeviceFrameClient<$Result.GetResult<Prisma.$DeviceFramePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one DeviceFrame that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {DeviceFrameFindUniqueOrThrowArgs} args - Arguments to find a DeviceFrame
     * @example
     * // Get one DeviceFrame
     * const deviceFrame = await prisma.deviceFrame.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DeviceFrameFindUniqueOrThrowArgs>(args: SelectSubset<T, DeviceFrameFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DeviceFrameClient<$Result.GetResult<Prisma.$DeviceFramePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first DeviceFrame that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeviceFrameFindFirstArgs} args - Arguments to find a DeviceFrame
     * @example
     * // Get one DeviceFrame
     * const deviceFrame = await prisma.deviceFrame.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DeviceFrameFindFirstArgs>(args?: SelectSubset<T, DeviceFrameFindFirstArgs<ExtArgs>>): Prisma__DeviceFrameClient<$Result.GetResult<Prisma.$DeviceFramePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first DeviceFrame that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeviceFrameFindFirstOrThrowArgs} args - Arguments to find a DeviceFrame
     * @example
     * // Get one DeviceFrame
     * const deviceFrame = await prisma.deviceFrame.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DeviceFrameFindFirstOrThrowArgs>(args?: SelectSubset<T, DeviceFrameFindFirstOrThrowArgs<ExtArgs>>): Prisma__DeviceFrameClient<$Result.GetResult<Prisma.$DeviceFramePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more DeviceFrames that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeviceFrameFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DeviceFrames
     * const deviceFrames = await prisma.deviceFrame.findMany()
     * 
     * // Get first 10 DeviceFrames
     * const deviceFrames = await prisma.deviceFrame.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const deviceFrameWithIdOnly = await prisma.deviceFrame.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DeviceFrameFindManyArgs>(args?: SelectSubset<T, DeviceFrameFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DeviceFramePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a DeviceFrame.
     * @param {DeviceFrameCreateArgs} args - Arguments to create a DeviceFrame.
     * @example
     * // Create one DeviceFrame
     * const DeviceFrame = await prisma.deviceFrame.create({
     *   data: {
     *     // ... data to create a DeviceFrame
     *   }
     * })
     * 
     */
    create<T extends DeviceFrameCreateArgs>(args: SelectSubset<T, DeviceFrameCreateArgs<ExtArgs>>): Prisma__DeviceFrameClient<$Result.GetResult<Prisma.$DeviceFramePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many DeviceFrames.
     * @param {DeviceFrameCreateManyArgs} args - Arguments to create many DeviceFrames.
     * @example
     * // Create many DeviceFrames
     * const deviceFrame = await prisma.deviceFrame.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DeviceFrameCreateManyArgs>(args?: SelectSubset<T, DeviceFrameCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DeviceFrames and returns the data saved in the database.
     * @param {DeviceFrameCreateManyAndReturnArgs} args - Arguments to create many DeviceFrames.
     * @example
     * // Create many DeviceFrames
     * const deviceFrame = await prisma.deviceFrame.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DeviceFrames and only return the `id`
     * const deviceFrameWithIdOnly = await prisma.deviceFrame.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DeviceFrameCreateManyAndReturnArgs>(args?: SelectSubset<T, DeviceFrameCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DeviceFramePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a DeviceFrame.
     * @param {DeviceFrameDeleteArgs} args - Arguments to delete one DeviceFrame.
     * @example
     * // Delete one DeviceFrame
     * const DeviceFrame = await prisma.deviceFrame.delete({
     *   where: {
     *     // ... filter to delete one DeviceFrame
     *   }
     * })
     * 
     */
    delete<T extends DeviceFrameDeleteArgs>(args: SelectSubset<T, DeviceFrameDeleteArgs<ExtArgs>>): Prisma__DeviceFrameClient<$Result.GetResult<Prisma.$DeviceFramePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one DeviceFrame.
     * @param {DeviceFrameUpdateArgs} args - Arguments to update one DeviceFrame.
     * @example
     * // Update one DeviceFrame
     * const deviceFrame = await prisma.deviceFrame.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DeviceFrameUpdateArgs>(args: SelectSubset<T, DeviceFrameUpdateArgs<ExtArgs>>): Prisma__DeviceFrameClient<$Result.GetResult<Prisma.$DeviceFramePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more DeviceFrames.
     * @param {DeviceFrameDeleteManyArgs} args - Arguments to filter DeviceFrames to delete.
     * @example
     * // Delete a few DeviceFrames
     * const { count } = await prisma.deviceFrame.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DeviceFrameDeleteManyArgs>(args?: SelectSubset<T, DeviceFrameDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DeviceFrames.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeviceFrameUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DeviceFrames
     * const deviceFrame = await prisma.deviceFrame.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DeviceFrameUpdateManyArgs>(args: SelectSubset<T, DeviceFrameUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one DeviceFrame.
     * @param {DeviceFrameUpsertArgs} args - Arguments to update or create a DeviceFrame.
     * @example
     * // Update or create a DeviceFrame
     * const deviceFrame = await prisma.deviceFrame.upsert({
     *   create: {
     *     // ... data to create a DeviceFrame
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DeviceFrame we want to update
     *   }
     * })
     */
    upsert<T extends DeviceFrameUpsertArgs>(args: SelectSubset<T, DeviceFrameUpsertArgs<ExtArgs>>): Prisma__DeviceFrameClient<$Result.GetResult<Prisma.$DeviceFramePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of DeviceFrames.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeviceFrameCountArgs} args - Arguments to filter DeviceFrames to count.
     * @example
     * // Count the number of DeviceFrames
     * const count = await prisma.deviceFrame.count({
     *   where: {
     *     // ... the filter for the DeviceFrames we want to count
     *   }
     * })
    **/
    count<T extends DeviceFrameCountArgs>(
      args?: Subset<T, DeviceFrameCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DeviceFrameCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DeviceFrame.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeviceFrameAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DeviceFrameAggregateArgs>(args: Subset<T, DeviceFrameAggregateArgs>): Prisma.PrismaPromise<GetDeviceFrameAggregateType<T>>

    /**
     * Group by DeviceFrame.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeviceFrameGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DeviceFrameGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DeviceFrameGroupByArgs['orderBy'] }
        : { orderBy?: DeviceFrameGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DeviceFrameGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDeviceFrameGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DeviceFrame model
   */
  readonly fields: DeviceFrameFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DeviceFrame.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DeviceFrameClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DeviceFrame model
   */ 
  interface DeviceFrameFieldRefs {
    readonly id: FieldRef<"DeviceFrame", 'String'>
    readonly name: FieldRef<"DeviceFrame", 'String'>
    readonly category: FieldRef<"DeviceFrame", 'String'>
    readonly framePath: FieldRef<"DeviceFrame", 'String'>
    readonly screenX: FieldRef<"DeviceFrame", 'Int'>
    readonly screenY: FieldRef<"DeviceFrame", 'Int'>
    readonly screenW: FieldRef<"DeviceFrame", 'Int'>
    readonly screenH: FieldRef<"DeviceFrame", 'Int'>
    readonly cornerRadius: FieldRef<"DeviceFrame", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * DeviceFrame findUnique
   */
  export type DeviceFrameFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeviceFrame
     */
    select?: DeviceFrameSelect<ExtArgs> | null
    /**
     * Filter, which DeviceFrame to fetch.
     */
    where: DeviceFrameWhereUniqueInput
  }

  /**
   * DeviceFrame findUniqueOrThrow
   */
  export type DeviceFrameFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeviceFrame
     */
    select?: DeviceFrameSelect<ExtArgs> | null
    /**
     * Filter, which DeviceFrame to fetch.
     */
    where: DeviceFrameWhereUniqueInput
  }

  /**
   * DeviceFrame findFirst
   */
  export type DeviceFrameFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeviceFrame
     */
    select?: DeviceFrameSelect<ExtArgs> | null
    /**
     * Filter, which DeviceFrame to fetch.
     */
    where?: DeviceFrameWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DeviceFrames to fetch.
     */
    orderBy?: DeviceFrameOrderByWithRelationInput | DeviceFrameOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DeviceFrames.
     */
    cursor?: DeviceFrameWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DeviceFrames from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DeviceFrames.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DeviceFrames.
     */
    distinct?: DeviceFrameScalarFieldEnum | DeviceFrameScalarFieldEnum[]
  }

  /**
   * DeviceFrame findFirstOrThrow
   */
  export type DeviceFrameFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeviceFrame
     */
    select?: DeviceFrameSelect<ExtArgs> | null
    /**
     * Filter, which DeviceFrame to fetch.
     */
    where?: DeviceFrameWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DeviceFrames to fetch.
     */
    orderBy?: DeviceFrameOrderByWithRelationInput | DeviceFrameOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DeviceFrames.
     */
    cursor?: DeviceFrameWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DeviceFrames from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DeviceFrames.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DeviceFrames.
     */
    distinct?: DeviceFrameScalarFieldEnum | DeviceFrameScalarFieldEnum[]
  }

  /**
   * DeviceFrame findMany
   */
  export type DeviceFrameFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeviceFrame
     */
    select?: DeviceFrameSelect<ExtArgs> | null
    /**
     * Filter, which DeviceFrames to fetch.
     */
    where?: DeviceFrameWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DeviceFrames to fetch.
     */
    orderBy?: DeviceFrameOrderByWithRelationInput | DeviceFrameOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DeviceFrames.
     */
    cursor?: DeviceFrameWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DeviceFrames from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DeviceFrames.
     */
    skip?: number
    distinct?: DeviceFrameScalarFieldEnum | DeviceFrameScalarFieldEnum[]
  }

  /**
   * DeviceFrame create
   */
  export type DeviceFrameCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeviceFrame
     */
    select?: DeviceFrameSelect<ExtArgs> | null
    /**
     * The data needed to create a DeviceFrame.
     */
    data: XOR<DeviceFrameCreateInput, DeviceFrameUncheckedCreateInput>
  }

  /**
   * DeviceFrame createMany
   */
  export type DeviceFrameCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DeviceFrames.
     */
    data: DeviceFrameCreateManyInput | DeviceFrameCreateManyInput[]
  }

  /**
   * DeviceFrame createManyAndReturn
   */
  export type DeviceFrameCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeviceFrame
     */
    select?: DeviceFrameSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many DeviceFrames.
     */
    data: DeviceFrameCreateManyInput | DeviceFrameCreateManyInput[]
  }

  /**
   * DeviceFrame update
   */
  export type DeviceFrameUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeviceFrame
     */
    select?: DeviceFrameSelect<ExtArgs> | null
    /**
     * The data needed to update a DeviceFrame.
     */
    data: XOR<DeviceFrameUpdateInput, DeviceFrameUncheckedUpdateInput>
    /**
     * Choose, which DeviceFrame to update.
     */
    where: DeviceFrameWhereUniqueInput
  }

  /**
   * DeviceFrame updateMany
   */
  export type DeviceFrameUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DeviceFrames.
     */
    data: XOR<DeviceFrameUpdateManyMutationInput, DeviceFrameUncheckedUpdateManyInput>
    /**
     * Filter which DeviceFrames to update
     */
    where?: DeviceFrameWhereInput
  }

  /**
   * DeviceFrame upsert
   */
  export type DeviceFrameUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeviceFrame
     */
    select?: DeviceFrameSelect<ExtArgs> | null
    /**
     * The filter to search for the DeviceFrame to update in case it exists.
     */
    where: DeviceFrameWhereUniqueInput
    /**
     * In case the DeviceFrame found by the `where` argument doesn't exist, create a new DeviceFrame with this data.
     */
    create: XOR<DeviceFrameCreateInput, DeviceFrameUncheckedCreateInput>
    /**
     * In case the DeviceFrame was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DeviceFrameUpdateInput, DeviceFrameUncheckedUpdateInput>
  }

  /**
   * DeviceFrame delete
   */
  export type DeviceFrameDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeviceFrame
     */
    select?: DeviceFrameSelect<ExtArgs> | null
    /**
     * Filter which DeviceFrame to delete.
     */
    where: DeviceFrameWhereUniqueInput
  }

  /**
   * DeviceFrame deleteMany
   */
  export type DeviceFrameDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DeviceFrames to delete
     */
    where?: DeviceFrameWhereInput
  }

  /**
   * DeviceFrame without action
   */
  export type DeviceFrameDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeviceFrame
     */
    select?: DeviceFrameSelect<ExtArgs> | null
  }


  /**
   * Model AiCopyResult
   */

  export type AggregateAiCopyResult = {
    _count: AiCopyResultCountAggregateOutputType | null
    _avg: AiCopyResultAvgAggregateOutputType | null
    _sum: AiCopyResultSumAggregateOutputType | null
    _min: AiCopyResultMinAggregateOutputType | null
    _max: AiCopyResultMaxAggregateOutputType | null
  }

  export type AiCopyResultAvgAggregateOutputType = {
    tokens: number | null
  }

  export type AiCopyResultSumAggregateOutputType = {
    tokens: number | null
  }

  export type AiCopyResultMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    prompt: string | null
    context: string | null
    result: string | null
    model: string | null
    tokens: number | null
    createdAt: Date | null
  }

  export type AiCopyResultMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    prompt: string | null
    context: string | null
    result: string | null
    model: string | null
    tokens: number | null
    createdAt: Date | null
  }

  export type AiCopyResultCountAggregateOutputType = {
    id: number
    tenantId: number
    prompt: number
    context: number
    result: number
    model: number
    tokens: number
    createdAt: number
    _all: number
  }


  export type AiCopyResultAvgAggregateInputType = {
    tokens?: true
  }

  export type AiCopyResultSumAggregateInputType = {
    tokens?: true
  }

  export type AiCopyResultMinAggregateInputType = {
    id?: true
    tenantId?: true
    prompt?: true
    context?: true
    result?: true
    model?: true
    tokens?: true
    createdAt?: true
  }

  export type AiCopyResultMaxAggregateInputType = {
    id?: true
    tenantId?: true
    prompt?: true
    context?: true
    result?: true
    model?: true
    tokens?: true
    createdAt?: true
  }

  export type AiCopyResultCountAggregateInputType = {
    id?: true
    tenantId?: true
    prompt?: true
    context?: true
    result?: true
    model?: true
    tokens?: true
    createdAt?: true
    _all?: true
  }

  export type AiCopyResultAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AiCopyResult to aggregate.
     */
    where?: AiCopyResultWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AiCopyResults to fetch.
     */
    orderBy?: AiCopyResultOrderByWithRelationInput | AiCopyResultOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AiCopyResultWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AiCopyResults from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AiCopyResults.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AiCopyResults
    **/
    _count?: true | AiCopyResultCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AiCopyResultAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AiCopyResultSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AiCopyResultMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AiCopyResultMaxAggregateInputType
  }

  export type GetAiCopyResultAggregateType<T extends AiCopyResultAggregateArgs> = {
        [P in keyof T & keyof AggregateAiCopyResult]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAiCopyResult[P]>
      : GetScalarType<T[P], AggregateAiCopyResult[P]>
  }




  export type AiCopyResultGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AiCopyResultWhereInput
    orderBy?: AiCopyResultOrderByWithAggregationInput | AiCopyResultOrderByWithAggregationInput[]
    by: AiCopyResultScalarFieldEnum[] | AiCopyResultScalarFieldEnum
    having?: AiCopyResultScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AiCopyResultCountAggregateInputType | true
    _avg?: AiCopyResultAvgAggregateInputType
    _sum?: AiCopyResultSumAggregateInputType
    _min?: AiCopyResultMinAggregateInputType
    _max?: AiCopyResultMaxAggregateInputType
  }

  export type AiCopyResultGroupByOutputType = {
    id: string
    tenantId: string
    prompt: string
    context: string | null
    result: string
    model: string
    tokens: number | null
    createdAt: Date
    _count: AiCopyResultCountAggregateOutputType | null
    _avg: AiCopyResultAvgAggregateOutputType | null
    _sum: AiCopyResultSumAggregateOutputType | null
    _min: AiCopyResultMinAggregateOutputType | null
    _max: AiCopyResultMaxAggregateOutputType | null
  }

  type GetAiCopyResultGroupByPayload<T extends AiCopyResultGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AiCopyResultGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AiCopyResultGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AiCopyResultGroupByOutputType[P]>
            : GetScalarType<T[P], AiCopyResultGroupByOutputType[P]>
        }
      >
    >


  export type AiCopyResultSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    prompt?: boolean
    context?: boolean
    result?: boolean
    model?: boolean
    tokens?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["aiCopyResult"]>

  export type AiCopyResultSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    prompt?: boolean
    context?: boolean
    result?: boolean
    model?: boolean
    tokens?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["aiCopyResult"]>

  export type AiCopyResultSelectScalar = {
    id?: boolean
    tenantId?: boolean
    prompt?: boolean
    context?: boolean
    result?: boolean
    model?: boolean
    tokens?: boolean
    createdAt?: boolean
  }


  export type $AiCopyResultPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AiCopyResult"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      prompt: string
      context: string | null
      result: string
      model: string
      tokens: number | null
      createdAt: Date
    }, ExtArgs["result"]["aiCopyResult"]>
    composites: {}
  }

  type AiCopyResultGetPayload<S extends boolean | null | undefined | AiCopyResultDefaultArgs> = $Result.GetResult<Prisma.$AiCopyResultPayload, S>

  type AiCopyResultCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AiCopyResultFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AiCopyResultCountAggregateInputType | true
    }

  export interface AiCopyResultDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AiCopyResult'], meta: { name: 'AiCopyResult' } }
    /**
     * Find zero or one AiCopyResult that matches the filter.
     * @param {AiCopyResultFindUniqueArgs} args - Arguments to find a AiCopyResult
     * @example
     * // Get one AiCopyResult
     * const aiCopyResult = await prisma.aiCopyResult.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AiCopyResultFindUniqueArgs>(args: SelectSubset<T, AiCopyResultFindUniqueArgs<ExtArgs>>): Prisma__AiCopyResultClient<$Result.GetResult<Prisma.$AiCopyResultPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one AiCopyResult that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AiCopyResultFindUniqueOrThrowArgs} args - Arguments to find a AiCopyResult
     * @example
     * // Get one AiCopyResult
     * const aiCopyResult = await prisma.aiCopyResult.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AiCopyResultFindUniqueOrThrowArgs>(args: SelectSubset<T, AiCopyResultFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AiCopyResultClient<$Result.GetResult<Prisma.$AiCopyResultPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first AiCopyResult that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AiCopyResultFindFirstArgs} args - Arguments to find a AiCopyResult
     * @example
     * // Get one AiCopyResult
     * const aiCopyResult = await prisma.aiCopyResult.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AiCopyResultFindFirstArgs>(args?: SelectSubset<T, AiCopyResultFindFirstArgs<ExtArgs>>): Prisma__AiCopyResultClient<$Result.GetResult<Prisma.$AiCopyResultPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first AiCopyResult that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AiCopyResultFindFirstOrThrowArgs} args - Arguments to find a AiCopyResult
     * @example
     * // Get one AiCopyResult
     * const aiCopyResult = await prisma.aiCopyResult.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AiCopyResultFindFirstOrThrowArgs>(args?: SelectSubset<T, AiCopyResultFindFirstOrThrowArgs<ExtArgs>>): Prisma__AiCopyResultClient<$Result.GetResult<Prisma.$AiCopyResultPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more AiCopyResults that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AiCopyResultFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AiCopyResults
     * const aiCopyResults = await prisma.aiCopyResult.findMany()
     * 
     * // Get first 10 AiCopyResults
     * const aiCopyResults = await prisma.aiCopyResult.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const aiCopyResultWithIdOnly = await prisma.aiCopyResult.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AiCopyResultFindManyArgs>(args?: SelectSubset<T, AiCopyResultFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AiCopyResultPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a AiCopyResult.
     * @param {AiCopyResultCreateArgs} args - Arguments to create a AiCopyResult.
     * @example
     * // Create one AiCopyResult
     * const AiCopyResult = await prisma.aiCopyResult.create({
     *   data: {
     *     // ... data to create a AiCopyResult
     *   }
     * })
     * 
     */
    create<T extends AiCopyResultCreateArgs>(args: SelectSubset<T, AiCopyResultCreateArgs<ExtArgs>>): Prisma__AiCopyResultClient<$Result.GetResult<Prisma.$AiCopyResultPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many AiCopyResults.
     * @param {AiCopyResultCreateManyArgs} args - Arguments to create many AiCopyResults.
     * @example
     * // Create many AiCopyResults
     * const aiCopyResult = await prisma.aiCopyResult.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AiCopyResultCreateManyArgs>(args?: SelectSubset<T, AiCopyResultCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AiCopyResults and returns the data saved in the database.
     * @param {AiCopyResultCreateManyAndReturnArgs} args - Arguments to create many AiCopyResults.
     * @example
     * // Create many AiCopyResults
     * const aiCopyResult = await prisma.aiCopyResult.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AiCopyResults and only return the `id`
     * const aiCopyResultWithIdOnly = await prisma.aiCopyResult.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AiCopyResultCreateManyAndReturnArgs>(args?: SelectSubset<T, AiCopyResultCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AiCopyResultPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a AiCopyResult.
     * @param {AiCopyResultDeleteArgs} args - Arguments to delete one AiCopyResult.
     * @example
     * // Delete one AiCopyResult
     * const AiCopyResult = await prisma.aiCopyResult.delete({
     *   where: {
     *     // ... filter to delete one AiCopyResult
     *   }
     * })
     * 
     */
    delete<T extends AiCopyResultDeleteArgs>(args: SelectSubset<T, AiCopyResultDeleteArgs<ExtArgs>>): Prisma__AiCopyResultClient<$Result.GetResult<Prisma.$AiCopyResultPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one AiCopyResult.
     * @param {AiCopyResultUpdateArgs} args - Arguments to update one AiCopyResult.
     * @example
     * // Update one AiCopyResult
     * const aiCopyResult = await prisma.aiCopyResult.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AiCopyResultUpdateArgs>(args: SelectSubset<T, AiCopyResultUpdateArgs<ExtArgs>>): Prisma__AiCopyResultClient<$Result.GetResult<Prisma.$AiCopyResultPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more AiCopyResults.
     * @param {AiCopyResultDeleteManyArgs} args - Arguments to filter AiCopyResults to delete.
     * @example
     * // Delete a few AiCopyResults
     * const { count } = await prisma.aiCopyResult.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AiCopyResultDeleteManyArgs>(args?: SelectSubset<T, AiCopyResultDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AiCopyResults.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AiCopyResultUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AiCopyResults
     * const aiCopyResult = await prisma.aiCopyResult.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AiCopyResultUpdateManyArgs>(args: SelectSubset<T, AiCopyResultUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AiCopyResult.
     * @param {AiCopyResultUpsertArgs} args - Arguments to update or create a AiCopyResult.
     * @example
     * // Update or create a AiCopyResult
     * const aiCopyResult = await prisma.aiCopyResult.upsert({
     *   create: {
     *     // ... data to create a AiCopyResult
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AiCopyResult we want to update
     *   }
     * })
     */
    upsert<T extends AiCopyResultUpsertArgs>(args: SelectSubset<T, AiCopyResultUpsertArgs<ExtArgs>>): Prisma__AiCopyResultClient<$Result.GetResult<Prisma.$AiCopyResultPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of AiCopyResults.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AiCopyResultCountArgs} args - Arguments to filter AiCopyResults to count.
     * @example
     * // Count the number of AiCopyResults
     * const count = await prisma.aiCopyResult.count({
     *   where: {
     *     // ... the filter for the AiCopyResults we want to count
     *   }
     * })
    **/
    count<T extends AiCopyResultCountArgs>(
      args?: Subset<T, AiCopyResultCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AiCopyResultCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AiCopyResult.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AiCopyResultAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AiCopyResultAggregateArgs>(args: Subset<T, AiCopyResultAggregateArgs>): Prisma.PrismaPromise<GetAiCopyResultAggregateType<T>>

    /**
     * Group by AiCopyResult.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AiCopyResultGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AiCopyResultGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AiCopyResultGroupByArgs['orderBy'] }
        : { orderBy?: AiCopyResultGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AiCopyResultGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAiCopyResultGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AiCopyResult model
   */
  readonly fields: AiCopyResultFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AiCopyResult.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AiCopyResultClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AiCopyResult model
   */ 
  interface AiCopyResultFieldRefs {
    readonly id: FieldRef<"AiCopyResult", 'String'>
    readonly tenantId: FieldRef<"AiCopyResult", 'String'>
    readonly prompt: FieldRef<"AiCopyResult", 'String'>
    readonly context: FieldRef<"AiCopyResult", 'String'>
    readonly result: FieldRef<"AiCopyResult", 'String'>
    readonly model: FieldRef<"AiCopyResult", 'String'>
    readonly tokens: FieldRef<"AiCopyResult", 'Int'>
    readonly createdAt: FieldRef<"AiCopyResult", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AiCopyResult findUnique
   */
  export type AiCopyResultFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiCopyResult
     */
    select?: AiCopyResultSelect<ExtArgs> | null
    /**
     * Filter, which AiCopyResult to fetch.
     */
    where: AiCopyResultWhereUniqueInput
  }

  /**
   * AiCopyResult findUniqueOrThrow
   */
  export type AiCopyResultFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiCopyResult
     */
    select?: AiCopyResultSelect<ExtArgs> | null
    /**
     * Filter, which AiCopyResult to fetch.
     */
    where: AiCopyResultWhereUniqueInput
  }

  /**
   * AiCopyResult findFirst
   */
  export type AiCopyResultFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiCopyResult
     */
    select?: AiCopyResultSelect<ExtArgs> | null
    /**
     * Filter, which AiCopyResult to fetch.
     */
    where?: AiCopyResultWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AiCopyResults to fetch.
     */
    orderBy?: AiCopyResultOrderByWithRelationInput | AiCopyResultOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AiCopyResults.
     */
    cursor?: AiCopyResultWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AiCopyResults from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AiCopyResults.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AiCopyResults.
     */
    distinct?: AiCopyResultScalarFieldEnum | AiCopyResultScalarFieldEnum[]
  }

  /**
   * AiCopyResult findFirstOrThrow
   */
  export type AiCopyResultFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiCopyResult
     */
    select?: AiCopyResultSelect<ExtArgs> | null
    /**
     * Filter, which AiCopyResult to fetch.
     */
    where?: AiCopyResultWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AiCopyResults to fetch.
     */
    orderBy?: AiCopyResultOrderByWithRelationInput | AiCopyResultOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AiCopyResults.
     */
    cursor?: AiCopyResultWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AiCopyResults from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AiCopyResults.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AiCopyResults.
     */
    distinct?: AiCopyResultScalarFieldEnum | AiCopyResultScalarFieldEnum[]
  }

  /**
   * AiCopyResult findMany
   */
  export type AiCopyResultFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiCopyResult
     */
    select?: AiCopyResultSelect<ExtArgs> | null
    /**
     * Filter, which AiCopyResults to fetch.
     */
    where?: AiCopyResultWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AiCopyResults to fetch.
     */
    orderBy?: AiCopyResultOrderByWithRelationInput | AiCopyResultOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AiCopyResults.
     */
    cursor?: AiCopyResultWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AiCopyResults from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AiCopyResults.
     */
    skip?: number
    distinct?: AiCopyResultScalarFieldEnum | AiCopyResultScalarFieldEnum[]
  }

  /**
   * AiCopyResult create
   */
  export type AiCopyResultCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiCopyResult
     */
    select?: AiCopyResultSelect<ExtArgs> | null
    /**
     * The data needed to create a AiCopyResult.
     */
    data: XOR<AiCopyResultCreateInput, AiCopyResultUncheckedCreateInput>
  }

  /**
   * AiCopyResult createMany
   */
  export type AiCopyResultCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AiCopyResults.
     */
    data: AiCopyResultCreateManyInput | AiCopyResultCreateManyInput[]
  }

  /**
   * AiCopyResult createManyAndReturn
   */
  export type AiCopyResultCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiCopyResult
     */
    select?: AiCopyResultSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many AiCopyResults.
     */
    data: AiCopyResultCreateManyInput | AiCopyResultCreateManyInput[]
  }

  /**
   * AiCopyResult update
   */
  export type AiCopyResultUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiCopyResult
     */
    select?: AiCopyResultSelect<ExtArgs> | null
    /**
     * The data needed to update a AiCopyResult.
     */
    data: XOR<AiCopyResultUpdateInput, AiCopyResultUncheckedUpdateInput>
    /**
     * Choose, which AiCopyResult to update.
     */
    where: AiCopyResultWhereUniqueInput
  }

  /**
   * AiCopyResult updateMany
   */
  export type AiCopyResultUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AiCopyResults.
     */
    data: XOR<AiCopyResultUpdateManyMutationInput, AiCopyResultUncheckedUpdateManyInput>
    /**
     * Filter which AiCopyResults to update
     */
    where?: AiCopyResultWhereInput
  }

  /**
   * AiCopyResult upsert
   */
  export type AiCopyResultUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiCopyResult
     */
    select?: AiCopyResultSelect<ExtArgs> | null
    /**
     * The filter to search for the AiCopyResult to update in case it exists.
     */
    where: AiCopyResultWhereUniqueInput
    /**
     * In case the AiCopyResult found by the `where` argument doesn't exist, create a new AiCopyResult with this data.
     */
    create: XOR<AiCopyResultCreateInput, AiCopyResultUncheckedCreateInput>
    /**
     * In case the AiCopyResult was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AiCopyResultUpdateInput, AiCopyResultUncheckedUpdateInput>
  }

  /**
   * AiCopyResult delete
   */
  export type AiCopyResultDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiCopyResult
     */
    select?: AiCopyResultSelect<ExtArgs> | null
    /**
     * Filter which AiCopyResult to delete.
     */
    where: AiCopyResultWhereUniqueInput
  }

  /**
   * AiCopyResult deleteMany
   */
  export type AiCopyResultDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AiCopyResults to delete
     */
    where?: AiCopyResultWhereInput
  }

  /**
   * AiCopyResult without action
   */
  export type AiCopyResultDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiCopyResult
     */
    select?: AiCopyResultSelect<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const TemplateScalarFieldEnum: {
    id: 'id',
    name: 'name',
    category: 'category',
    width: 'width',
    height: 'height',
    layers: 'layers',
    thumbnail: 'thumbnail',
    isSystem: 'isSystem',
    tenantId: 'tenantId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TemplateScalarFieldEnum = (typeof TemplateScalarFieldEnum)[keyof typeof TemplateScalarFieldEnum]


  export const CreativeScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    templateId: 'templateId',
    name: 'name',
    type: 'type',
    status: 'status',
    inputData: 'inputData',
    outputPath: 'outputPath',
    outputUrl: 'outputUrl',
    format: 'format',
    width: 'width',
    height: 'height',
    fileSize: 'fileSize',
    errorMsg: 'errorMsg',
    jobId: 'jobId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CreativeScalarFieldEnum = (typeof CreativeScalarFieldEnum)[keyof typeof CreativeScalarFieldEnum]


  export const ExportScalarFieldEnum: {
    id: 'id',
    creativeId: 'creativeId',
    format: 'format',
    width: 'width',
    height: 'height',
    quality: 'quality',
    outputPath: 'outputPath',
    status: 'status',
    createdAt: 'createdAt'
  };

  export type ExportScalarFieldEnum = (typeof ExportScalarFieldEnum)[keyof typeof ExportScalarFieldEnum]


  export const DeviceFrameScalarFieldEnum: {
    id: 'id',
    name: 'name',
    category: 'category',
    framePath: 'framePath',
    screenX: 'screenX',
    screenY: 'screenY',
    screenW: 'screenW',
    screenH: 'screenH',
    cornerRadius: 'cornerRadius'
  };

  export type DeviceFrameScalarFieldEnum = (typeof DeviceFrameScalarFieldEnum)[keyof typeof DeviceFrameScalarFieldEnum]


  export const AiCopyResultScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    prompt: 'prompt',
    context: 'context',
    result: 'result',
    model: 'model',
    tokens: 'tokens',
    createdAt: 'createdAt'
  };

  export type AiCopyResultScalarFieldEnum = (typeof AiCopyResultScalarFieldEnum)[keyof typeof AiCopyResultScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type TemplateWhereInput = {
    AND?: TemplateWhereInput | TemplateWhereInput[]
    OR?: TemplateWhereInput[]
    NOT?: TemplateWhereInput | TemplateWhereInput[]
    id?: StringFilter<"Template"> | string
    name?: StringFilter<"Template"> | string
    category?: StringFilter<"Template"> | string
    width?: IntFilter<"Template"> | number
    height?: IntFilter<"Template"> | number
    layers?: StringFilter<"Template"> | string
    thumbnail?: StringNullableFilter<"Template"> | string | null
    isSystem?: BoolFilter<"Template"> | boolean
    tenantId?: StringNullableFilter<"Template"> | string | null
    createdAt?: DateTimeFilter<"Template"> | Date | string
    updatedAt?: DateTimeFilter<"Template"> | Date | string
    creatives?: CreativeListRelationFilter
  }

  export type TemplateOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    category?: SortOrder
    width?: SortOrder
    height?: SortOrder
    layers?: SortOrder
    thumbnail?: SortOrderInput | SortOrder
    isSystem?: SortOrder
    tenantId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    creatives?: CreativeOrderByRelationAggregateInput
  }

  export type TemplateWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TemplateWhereInput | TemplateWhereInput[]
    OR?: TemplateWhereInput[]
    NOT?: TemplateWhereInput | TemplateWhereInput[]
    name?: StringFilter<"Template"> | string
    category?: StringFilter<"Template"> | string
    width?: IntFilter<"Template"> | number
    height?: IntFilter<"Template"> | number
    layers?: StringFilter<"Template"> | string
    thumbnail?: StringNullableFilter<"Template"> | string | null
    isSystem?: BoolFilter<"Template"> | boolean
    tenantId?: StringNullableFilter<"Template"> | string | null
    createdAt?: DateTimeFilter<"Template"> | Date | string
    updatedAt?: DateTimeFilter<"Template"> | Date | string
    creatives?: CreativeListRelationFilter
  }, "id">

  export type TemplateOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    category?: SortOrder
    width?: SortOrder
    height?: SortOrder
    layers?: SortOrder
    thumbnail?: SortOrderInput | SortOrder
    isSystem?: SortOrder
    tenantId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TemplateCountOrderByAggregateInput
    _avg?: TemplateAvgOrderByAggregateInput
    _max?: TemplateMaxOrderByAggregateInput
    _min?: TemplateMinOrderByAggregateInput
    _sum?: TemplateSumOrderByAggregateInput
  }

  export type TemplateScalarWhereWithAggregatesInput = {
    AND?: TemplateScalarWhereWithAggregatesInput | TemplateScalarWhereWithAggregatesInput[]
    OR?: TemplateScalarWhereWithAggregatesInput[]
    NOT?: TemplateScalarWhereWithAggregatesInput | TemplateScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Template"> | string
    name?: StringWithAggregatesFilter<"Template"> | string
    category?: StringWithAggregatesFilter<"Template"> | string
    width?: IntWithAggregatesFilter<"Template"> | number
    height?: IntWithAggregatesFilter<"Template"> | number
    layers?: StringWithAggregatesFilter<"Template"> | string
    thumbnail?: StringNullableWithAggregatesFilter<"Template"> | string | null
    isSystem?: BoolWithAggregatesFilter<"Template"> | boolean
    tenantId?: StringNullableWithAggregatesFilter<"Template"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Template"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Template"> | Date | string
  }

  export type CreativeWhereInput = {
    AND?: CreativeWhereInput | CreativeWhereInput[]
    OR?: CreativeWhereInput[]
    NOT?: CreativeWhereInput | CreativeWhereInput[]
    id?: StringFilter<"Creative"> | string
    tenantId?: StringFilter<"Creative"> | string
    templateId?: StringNullableFilter<"Creative"> | string | null
    name?: StringFilter<"Creative"> | string
    type?: StringFilter<"Creative"> | string
    status?: StringFilter<"Creative"> | string
    inputData?: StringFilter<"Creative"> | string
    outputPath?: StringNullableFilter<"Creative"> | string | null
    outputUrl?: StringNullableFilter<"Creative"> | string | null
    format?: StringFilter<"Creative"> | string
    width?: IntNullableFilter<"Creative"> | number | null
    height?: IntNullableFilter<"Creative"> | number | null
    fileSize?: IntNullableFilter<"Creative"> | number | null
    errorMsg?: StringNullableFilter<"Creative"> | string | null
    jobId?: StringNullableFilter<"Creative"> | string | null
    createdAt?: DateTimeFilter<"Creative"> | Date | string
    updatedAt?: DateTimeFilter<"Creative"> | Date | string
    template?: XOR<TemplateNullableRelationFilter, TemplateWhereInput> | null
    exports?: ExportListRelationFilter
  }

  export type CreativeOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    templateId?: SortOrderInput | SortOrder
    name?: SortOrder
    type?: SortOrder
    status?: SortOrder
    inputData?: SortOrder
    outputPath?: SortOrderInput | SortOrder
    outputUrl?: SortOrderInput | SortOrder
    format?: SortOrder
    width?: SortOrderInput | SortOrder
    height?: SortOrderInput | SortOrder
    fileSize?: SortOrderInput | SortOrder
    errorMsg?: SortOrderInput | SortOrder
    jobId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    template?: TemplateOrderByWithRelationInput
    exports?: ExportOrderByRelationAggregateInput
  }

  export type CreativeWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CreativeWhereInput | CreativeWhereInput[]
    OR?: CreativeWhereInput[]
    NOT?: CreativeWhereInput | CreativeWhereInput[]
    tenantId?: StringFilter<"Creative"> | string
    templateId?: StringNullableFilter<"Creative"> | string | null
    name?: StringFilter<"Creative"> | string
    type?: StringFilter<"Creative"> | string
    status?: StringFilter<"Creative"> | string
    inputData?: StringFilter<"Creative"> | string
    outputPath?: StringNullableFilter<"Creative"> | string | null
    outputUrl?: StringNullableFilter<"Creative"> | string | null
    format?: StringFilter<"Creative"> | string
    width?: IntNullableFilter<"Creative"> | number | null
    height?: IntNullableFilter<"Creative"> | number | null
    fileSize?: IntNullableFilter<"Creative"> | number | null
    errorMsg?: StringNullableFilter<"Creative"> | string | null
    jobId?: StringNullableFilter<"Creative"> | string | null
    createdAt?: DateTimeFilter<"Creative"> | Date | string
    updatedAt?: DateTimeFilter<"Creative"> | Date | string
    template?: XOR<TemplateNullableRelationFilter, TemplateWhereInput> | null
    exports?: ExportListRelationFilter
  }, "id">

  export type CreativeOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    templateId?: SortOrderInput | SortOrder
    name?: SortOrder
    type?: SortOrder
    status?: SortOrder
    inputData?: SortOrder
    outputPath?: SortOrderInput | SortOrder
    outputUrl?: SortOrderInput | SortOrder
    format?: SortOrder
    width?: SortOrderInput | SortOrder
    height?: SortOrderInput | SortOrder
    fileSize?: SortOrderInput | SortOrder
    errorMsg?: SortOrderInput | SortOrder
    jobId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CreativeCountOrderByAggregateInput
    _avg?: CreativeAvgOrderByAggregateInput
    _max?: CreativeMaxOrderByAggregateInput
    _min?: CreativeMinOrderByAggregateInput
    _sum?: CreativeSumOrderByAggregateInput
  }

  export type CreativeScalarWhereWithAggregatesInput = {
    AND?: CreativeScalarWhereWithAggregatesInput | CreativeScalarWhereWithAggregatesInput[]
    OR?: CreativeScalarWhereWithAggregatesInput[]
    NOT?: CreativeScalarWhereWithAggregatesInput | CreativeScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Creative"> | string
    tenantId?: StringWithAggregatesFilter<"Creative"> | string
    templateId?: StringNullableWithAggregatesFilter<"Creative"> | string | null
    name?: StringWithAggregatesFilter<"Creative"> | string
    type?: StringWithAggregatesFilter<"Creative"> | string
    status?: StringWithAggregatesFilter<"Creative"> | string
    inputData?: StringWithAggregatesFilter<"Creative"> | string
    outputPath?: StringNullableWithAggregatesFilter<"Creative"> | string | null
    outputUrl?: StringNullableWithAggregatesFilter<"Creative"> | string | null
    format?: StringWithAggregatesFilter<"Creative"> | string
    width?: IntNullableWithAggregatesFilter<"Creative"> | number | null
    height?: IntNullableWithAggregatesFilter<"Creative"> | number | null
    fileSize?: IntNullableWithAggregatesFilter<"Creative"> | number | null
    errorMsg?: StringNullableWithAggregatesFilter<"Creative"> | string | null
    jobId?: StringNullableWithAggregatesFilter<"Creative"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Creative"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Creative"> | Date | string
  }

  export type ExportWhereInput = {
    AND?: ExportWhereInput | ExportWhereInput[]
    OR?: ExportWhereInput[]
    NOT?: ExportWhereInput | ExportWhereInput[]
    id?: StringFilter<"Export"> | string
    creativeId?: StringFilter<"Export"> | string
    format?: StringFilter<"Export"> | string
    width?: IntFilter<"Export"> | number
    height?: IntFilter<"Export"> | number
    quality?: IntFilter<"Export"> | number
    outputPath?: StringNullableFilter<"Export"> | string | null
    status?: StringFilter<"Export"> | string
    createdAt?: DateTimeFilter<"Export"> | Date | string
    creative?: XOR<CreativeRelationFilter, CreativeWhereInput>
  }

  export type ExportOrderByWithRelationInput = {
    id?: SortOrder
    creativeId?: SortOrder
    format?: SortOrder
    width?: SortOrder
    height?: SortOrder
    quality?: SortOrder
    outputPath?: SortOrderInput | SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    creative?: CreativeOrderByWithRelationInput
  }

  export type ExportWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ExportWhereInput | ExportWhereInput[]
    OR?: ExportWhereInput[]
    NOT?: ExportWhereInput | ExportWhereInput[]
    creativeId?: StringFilter<"Export"> | string
    format?: StringFilter<"Export"> | string
    width?: IntFilter<"Export"> | number
    height?: IntFilter<"Export"> | number
    quality?: IntFilter<"Export"> | number
    outputPath?: StringNullableFilter<"Export"> | string | null
    status?: StringFilter<"Export"> | string
    createdAt?: DateTimeFilter<"Export"> | Date | string
    creative?: XOR<CreativeRelationFilter, CreativeWhereInput>
  }, "id">

  export type ExportOrderByWithAggregationInput = {
    id?: SortOrder
    creativeId?: SortOrder
    format?: SortOrder
    width?: SortOrder
    height?: SortOrder
    quality?: SortOrder
    outputPath?: SortOrderInput | SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    _count?: ExportCountOrderByAggregateInput
    _avg?: ExportAvgOrderByAggregateInput
    _max?: ExportMaxOrderByAggregateInput
    _min?: ExportMinOrderByAggregateInput
    _sum?: ExportSumOrderByAggregateInput
  }

  export type ExportScalarWhereWithAggregatesInput = {
    AND?: ExportScalarWhereWithAggregatesInput | ExportScalarWhereWithAggregatesInput[]
    OR?: ExportScalarWhereWithAggregatesInput[]
    NOT?: ExportScalarWhereWithAggregatesInput | ExportScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Export"> | string
    creativeId?: StringWithAggregatesFilter<"Export"> | string
    format?: StringWithAggregatesFilter<"Export"> | string
    width?: IntWithAggregatesFilter<"Export"> | number
    height?: IntWithAggregatesFilter<"Export"> | number
    quality?: IntWithAggregatesFilter<"Export"> | number
    outputPath?: StringNullableWithAggregatesFilter<"Export"> | string | null
    status?: StringWithAggregatesFilter<"Export"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Export"> | Date | string
  }

  export type DeviceFrameWhereInput = {
    AND?: DeviceFrameWhereInput | DeviceFrameWhereInput[]
    OR?: DeviceFrameWhereInput[]
    NOT?: DeviceFrameWhereInput | DeviceFrameWhereInput[]
    id?: StringFilter<"DeviceFrame"> | string
    name?: StringFilter<"DeviceFrame"> | string
    category?: StringFilter<"DeviceFrame"> | string
    framePath?: StringFilter<"DeviceFrame"> | string
    screenX?: IntFilter<"DeviceFrame"> | number
    screenY?: IntFilter<"DeviceFrame"> | number
    screenW?: IntFilter<"DeviceFrame"> | number
    screenH?: IntFilter<"DeviceFrame"> | number
    cornerRadius?: IntFilter<"DeviceFrame"> | number
  }

  export type DeviceFrameOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    category?: SortOrder
    framePath?: SortOrder
    screenX?: SortOrder
    screenY?: SortOrder
    screenW?: SortOrder
    screenH?: SortOrder
    cornerRadius?: SortOrder
  }

  export type DeviceFrameWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DeviceFrameWhereInput | DeviceFrameWhereInput[]
    OR?: DeviceFrameWhereInput[]
    NOT?: DeviceFrameWhereInput | DeviceFrameWhereInput[]
    name?: StringFilter<"DeviceFrame"> | string
    category?: StringFilter<"DeviceFrame"> | string
    framePath?: StringFilter<"DeviceFrame"> | string
    screenX?: IntFilter<"DeviceFrame"> | number
    screenY?: IntFilter<"DeviceFrame"> | number
    screenW?: IntFilter<"DeviceFrame"> | number
    screenH?: IntFilter<"DeviceFrame"> | number
    cornerRadius?: IntFilter<"DeviceFrame"> | number
  }, "id">

  export type DeviceFrameOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    category?: SortOrder
    framePath?: SortOrder
    screenX?: SortOrder
    screenY?: SortOrder
    screenW?: SortOrder
    screenH?: SortOrder
    cornerRadius?: SortOrder
    _count?: DeviceFrameCountOrderByAggregateInput
    _avg?: DeviceFrameAvgOrderByAggregateInput
    _max?: DeviceFrameMaxOrderByAggregateInput
    _min?: DeviceFrameMinOrderByAggregateInput
    _sum?: DeviceFrameSumOrderByAggregateInput
  }

  export type DeviceFrameScalarWhereWithAggregatesInput = {
    AND?: DeviceFrameScalarWhereWithAggregatesInput | DeviceFrameScalarWhereWithAggregatesInput[]
    OR?: DeviceFrameScalarWhereWithAggregatesInput[]
    NOT?: DeviceFrameScalarWhereWithAggregatesInput | DeviceFrameScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DeviceFrame"> | string
    name?: StringWithAggregatesFilter<"DeviceFrame"> | string
    category?: StringWithAggregatesFilter<"DeviceFrame"> | string
    framePath?: StringWithAggregatesFilter<"DeviceFrame"> | string
    screenX?: IntWithAggregatesFilter<"DeviceFrame"> | number
    screenY?: IntWithAggregatesFilter<"DeviceFrame"> | number
    screenW?: IntWithAggregatesFilter<"DeviceFrame"> | number
    screenH?: IntWithAggregatesFilter<"DeviceFrame"> | number
    cornerRadius?: IntWithAggregatesFilter<"DeviceFrame"> | number
  }

  export type AiCopyResultWhereInput = {
    AND?: AiCopyResultWhereInput | AiCopyResultWhereInput[]
    OR?: AiCopyResultWhereInput[]
    NOT?: AiCopyResultWhereInput | AiCopyResultWhereInput[]
    id?: StringFilter<"AiCopyResult"> | string
    tenantId?: StringFilter<"AiCopyResult"> | string
    prompt?: StringFilter<"AiCopyResult"> | string
    context?: StringNullableFilter<"AiCopyResult"> | string | null
    result?: StringFilter<"AiCopyResult"> | string
    model?: StringFilter<"AiCopyResult"> | string
    tokens?: IntNullableFilter<"AiCopyResult"> | number | null
    createdAt?: DateTimeFilter<"AiCopyResult"> | Date | string
  }

  export type AiCopyResultOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    prompt?: SortOrder
    context?: SortOrderInput | SortOrder
    result?: SortOrder
    model?: SortOrder
    tokens?: SortOrderInput | SortOrder
    createdAt?: SortOrder
  }

  export type AiCopyResultWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AiCopyResultWhereInput | AiCopyResultWhereInput[]
    OR?: AiCopyResultWhereInput[]
    NOT?: AiCopyResultWhereInput | AiCopyResultWhereInput[]
    tenantId?: StringFilter<"AiCopyResult"> | string
    prompt?: StringFilter<"AiCopyResult"> | string
    context?: StringNullableFilter<"AiCopyResult"> | string | null
    result?: StringFilter<"AiCopyResult"> | string
    model?: StringFilter<"AiCopyResult"> | string
    tokens?: IntNullableFilter<"AiCopyResult"> | number | null
    createdAt?: DateTimeFilter<"AiCopyResult"> | Date | string
  }, "id">

  export type AiCopyResultOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    prompt?: SortOrder
    context?: SortOrderInput | SortOrder
    result?: SortOrder
    model?: SortOrder
    tokens?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: AiCopyResultCountOrderByAggregateInput
    _avg?: AiCopyResultAvgOrderByAggregateInput
    _max?: AiCopyResultMaxOrderByAggregateInput
    _min?: AiCopyResultMinOrderByAggregateInput
    _sum?: AiCopyResultSumOrderByAggregateInput
  }

  export type AiCopyResultScalarWhereWithAggregatesInput = {
    AND?: AiCopyResultScalarWhereWithAggregatesInput | AiCopyResultScalarWhereWithAggregatesInput[]
    OR?: AiCopyResultScalarWhereWithAggregatesInput[]
    NOT?: AiCopyResultScalarWhereWithAggregatesInput | AiCopyResultScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AiCopyResult"> | string
    tenantId?: StringWithAggregatesFilter<"AiCopyResult"> | string
    prompt?: StringWithAggregatesFilter<"AiCopyResult"> | string
    context?: StringNullableWithAggregatesFilter<"AiCopyResult"> | string | null
    result?: StringWithAggregatesFilter<"AiCopyResult"> | string
    model?: StringWithAggregatesFilter<"AiCopyResult"> | string
    tokens?: IntNullableWithAggregatesFilter<"AiCopyResult"> | number | null
    createdAt?: DateTimeWithAggregatesFilter<"AiCopyResult"> | Date | string
  }

  export type TemplateCreateInput = {
    id?: string
    name: string
    category: string
    width: number
    height: number
    layers: string
    thumbnail?: string | null
    isSystem?: boolean
    tenantId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    creatives?: CreativeCreateNestedManyWithoutTemplateInput
  }

  export type TemplateUncheckedCreateInput = {
    id?: string
    name: string
    category: string
    width: number
    height: number
    layers: string
    thumbnail?: string | null
    isSystem?: boolean
    tenantId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    creatives?: CreativeUncheckedCreateNestedManyWithoutTemplateInput
  }

  export type TemplateUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    layers?: StringFieldUpdateOperationsInput | string
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    isSystem?: BoolFieldUpdateOperationsInput | boolean
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    creatives?: CreativeUpdateManyWithoutTemplateNestedInput
  }

  export type TemplateUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    layers?: StringFieldUpdateOperationsInput | string
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    isSystem?: BoolFieldUpdateOperationsInput | boolean
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    creatives?: CreativeUncheckedUpdateManyWithoutTemplateNestedInput
  }

  export type TemplateCreateManyInput = {
    id?: string
    name: string
    category: string
    width: number
    height: number
    layers: string
    thumbnail?: string | null
    isSystem?: boolean
    tenantId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TemplateUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    layers?: StringFieldUpdateOperationsInput | string
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    isSystem?: BoolFieldUpdateOperationsInput | boolean
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TemplateUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    layers?: StringFieldUpdateOperationsInput | string
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    isSystem?: BoolFieldUpdateOperationsInput | boolean
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CreativeCreateInput = {
    id?: string
    tenantId: string
    name: string
    type: string
    status?: string
    inputData: string
    outputPath?: string | null
    outputUrl?: string | null
    format?: string
    width?: number | null
    height?: number | null
    fileSize?: number | null
    errorMsg?: string | null
    jobId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    template?: TemplateCreateNestedOneWithoutCreativesInput
    exports?: ExportCreateNestedManyWithoutCreativeInput
  }

  export type CreativeUncheckedCreateInput = {
    id?: string
    tenantId: string
    templateId?: string | null
    name: string
    type: string
    status?: string
    inputData: string
    outputPath?: string | null
    outputUrl?: string | null
    format?: string
    width?: number | null
    height?: number | null
    fileSize?: number | null
    errorMsg?: string | null
    jobId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    exports?: ExportUncheckedCreateNestedManyWithoutCreativeInput
  }

  export type CreativeUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    inputData?: StringFieldUpdateOperationsInput | string
    outputPath?: NullableStringFieldUpdateOperationsInput | string | null
    outputUrl?: NullableStringFieldUpdateOperationsInput | string | null
    format?: StringFieldUpdateOperationsInput | string
    width?: NullableIntFieldUpdateOperationsInput | number | null
    height?: NullableIntFieldUpdateOperationsInput | number | null
    fileSize?: NullableIntFieldUpdateOperationsInput | number | null
    errorMsg?: NullableStringFieldUpdateOperationsInput | string | null
    jobId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    template?: TemplateUpdateOneWithoutCreativesNestedInput
    exports?: ExportUpdateManyWithoutCreativeNestedInput
  }

  export type CreativeUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    templateId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    inputData?: StringFieldUpdateOperationsInput | string
    outputPath?: NullableStringFieldUpdateOperationsInput | string | null
    outputUrl?: NullableStringFieldUpdateOperationsInput | string | null
    format?: StringFieldUpdateOperationsInput | string
    width?: NullableIntFieldUpdateOperationsInput | number | null
    height?: NullableIntFieldUpdateOperationsInput | number | null
    fileSize?: NullableIntFieldUpdateOperationsInput | number | null
    errorMsg?: NullableStringFieldUpdateOperationsInput | string | null
    jobId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    exports?: ExportUncheckedUpdateManyWithoutCreativeNestedInput
  }

  export type CreativeCreateManyInput = {
    id?: string
    tenantId: string
    templateId?: string | null
    name: string
    type: string
    status?: string
    inputData: string
    outputPath?: string | null
    outputUrl?: string | null
    format?: string
    width?: number | null
    height?: number | null
    fileSize?: number | null
    errorMsg?: string | null
    jobId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CreativeUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    inputData?: StringFieldUpdateOperationsInput | string
    outputPath?: NullableStringFieldUpdateOperationsInput | string | null
    outputUrl?: NullableStringFieldUpdateOperationsInput | string | null
    format?: StringFieldUpdateOperationsInput | string
    width?: NullableIntFieldUpdateOperationsInput | number | null
    height?: NullableIntFieldUpdateOperationsInput | number | null
    fileSize?: NullableIntFieldUpdateOperationsInput | number | null
    errorMsg?: NullableStringFieldUpdateOperationsInput | string | null
    jobId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CreativeUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    templateId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    inputData?: StringFieldUpdateOperationsInput | string
    outputPath?: NullableStringFieldUpdateOperationsInput | string | null
    outputUrl?: NullableStringFieldUpdateOperationsInput | string | null
    format?: StringFieldUpdateOperationsInput | string
    width?: NullableIntFieldUpdateOperationsInput | number | null
    height?: NullableIntFieldUpdateOperationsInput | number | null
    fileSize?: NullableIntFieldUpdateOperationsInput | number | null
    errorMsg?: NullableStringFieldUpdateOperationsInput | string | null
    jobId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ExportCreateInput = {
    id?: string
    format: string
    width: number
    height: number
    quality?: number
    outputPath?: string | null
    status?: string
    createdAt?: Date | string
    creative: CreativeCreateNestedOneWithoutExportsInput
  }

  export type ExportUncheckedCreateInput = {
    id?: string
    creativeId: string
    format: string
    width: number
    height: number
    quality?: number
    outputPath?: string | null
    status?: string
    createdAt?: Date | string
  }

  export type ExportUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    format?: StringFieldUpdateOperationsInput | string
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    quality?: IntFieldUpdateOperationsInput | number
    outputPath?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    creative?: CreativeUpdateOneRequiredWithoutExportsNestedInput
  }

  export type ExportUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    creativeId?: StringFieldUpdateOperationsInput | string
    format?: StringFieldUpdateOperationsInput | string
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    quality?: IntFieldUpdateOperationsInput | number
    outputPath?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ExportCreateManyInput = {
    id?: string
    creativeId: string
    format: string
    width: number
    height: number
    quality?: number
    outputPath?: string | null
    status?: string
    createdAt?: Date | string
  }

  export type ExportUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    format?: StringFieldUpdateOperationsInput | string
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    quality?: IntFieldUpdateOperationsInput | number
    outputPath?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ExportUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    creativeId?: StringFieldUpdateOperationsInput | string
    format?: StringFieldUpdateOperationsInput | string
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    quality?: IntFieldUpdateOperationsInput | number
    outputPath?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DeviceFrameCreateInput = {
    id?: string
    name: string
    category: string
    framePath: string
    screenX: number
    screenY: number
    screenW: number
    screenH: number
    cornerRadius?: number
  }

  export type DeviceFrameUncheckedCreateInput = {
    id?: string
    name: string
    category: string
    framePath: string
    screenX: number
    screenY: number
    screenW: number
    screenH: number
    cornerRadius?: number
  }

  export type DeviceFrameUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    framePath?: StringFieldUpdateOperationsInput | string
    screenX?: IntFieldUpdateOperationsInput | number
    screenY?: IntFieldUpdateOperationsInput | number
    screenW?: IntFieldUpdateOperationsInput | number
    screenH?: IntFieldUpdateOperationsInput | number
    cornerRadius?: IntFieldUpdateOperationsInput | number
  }

  export type DeviceFrameUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    framePath?: StringFieldUpdateOperationsInput | string
    screenX?: IntFieldUpdateOperationsInput | number
    screenY?: IntFieldUpdateOperationsInput | number
    screenW?: IntFieldUpdateOperationsInput | number
    screenH?: IntFieldUpdateOperationsInput | number
    cornerRadius?: IntFieldUpdateOperationsInput | number
  }

  export type DeviceFrameCreateManyInput = {
    id?: string
    name: string
    category: string
    framePath: string
    screenX: number
    screenY: number
    screenW: number
    screenH: number
    cornerRadius?: number
  }

  export type DeviceFrameUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    framePath?: StringFieldUpdateOperationsInput | string
    screenX?: IntFieldUpdateOperationsInput | number
    screenY?: IntFieldUpdateOperationsInput | number
    screenW?: IntFieldUpdateOperationsInput | number
    screenH?: IntFieldUpdateOperationsInput | number
    cornerRadius?: IntFieldUpdateOperationsInput | number
  }

  export type DeviceFrameUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    framePath?: StringFieldUpdateOperationsInput | string
    screenX?: IntFieldUpdateOperationsInput | number
    screenY?: IntFieldUpdateOperationsInput | number
    screenW?: IntFieldUpdateOperationsInput | number
    screenH?: IntFieldUpdateOperationsInput | number
    cornerRadius?: IntFieldUpdateOperationsInput | number
  }

  export type AiCopyResultCreateInput = {
    id?: string
    tenantId: string
    prompt: string
    context?: string | null
    result: string
    model?: string
    tokens?: number | null
    createdAt?: Date | string
  }

  export type AiCopyResultUncheckedCreateInput = {
    id?: string
    tenantId: string
    prompt: string
    context?: string | null
    result: string
    model?: string
    tokens?: number | null
    createdAt?: Date | string
  }

  export type AiCopyResultUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    prompt?: StringFieldUpdateOperationsInput | string
    context?: NullableStringFieldUpdateOperationsInput | string | null
    result?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    tokens?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AiCopyResultUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    prompt?: StringFieldUpdateOperationsInput | string
    context?: NullableStringFieldUpdateOperationsInput | string | null
    result?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    tokens?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AiCopyResultCreateManyInput = {
    id?: string
    tenantId: string
    prompt: string
    context?: string | null
    result: string
    model?: string
    tokens?: number | null
    createdAt?: Date | string
  }

  export type AiCopyResultUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    prompt?: StringFieldUpdateOperationsInput | string
    context?: NullableStringFieldUpdateOperationsInput | string | null
    result?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    tokens?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AiCopyResultUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    prompt?: StringFieldUpdateOperationsInput | string
    context?: NullableStringFieldUpdateOperationsInput | string | null
    result?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    tokens?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type CreativeListRelationFilter = {
    every?: CreativeWhereInput
    some?: CreativeWhereInput
    none?: CreativeWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type CreativeOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TemplateCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    category?: SortOrder
    width?: SortOrder
    height?: SortOrder
    layers?: SortOrder
    thumbnail?: SortOrder
    isSystem?: SortOrder
    tenantId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TemplateAvgOrderByAggregateInput = {
    width?: SortOrder
    height?: SortOrder
  }

  export type TemplateMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    category?: SortOrder
    width?: SortOrder
    height?: SortOrder
    layers?: SortOrder
    thumbnail?: SortOrder
    isSystem?: SortOrder
    tenantId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TemplateMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    category?: SortOrder
    width?: SortOrder
    height?: SortOrder
    layers?: SortOrder
    thumbnail?: SortOrder
    isSystem?: SortOrder
    tenantId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TemplateSumOrderByAggregateInput = {
    width?: SortOrder
    height?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type TemplateNullableRelationFilter = {
    is?: TemplateWhereInput | null
    isNot?: TemplateWhereInput | null
  }

  export type ExportListRelationFilter = {
    every?: ExportWhereInput
    some?: ExportWhereInput
    none?: ExportWhereInput
  }

  export type ExportOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CreativeCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    templateId?: SortOrder
    name?: SortOrder
    type?: SortOrder
    status?: SortOrder
    inputData?: SortOrder
    outputPath?: SortOrder
    outputUrl?: SortOrder
    format?: SortOrder
    width?: SortOrder
    height?: SortOrder
    fileSize?: SortOrder
    errorMsg?: SortOrder
    jobId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CreativeAvgOrderByAggregateInput = {
    width?: SortOrder
    height?: SortOrder
    fileSize?: SortOrder
  }

  export type CreativeMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    templateId?: SortOrder
    name?: SortOrder
    type?: SortOrder
    status?: SortOrder
    inputData?: SortOrder
    outputPath?: SortOrder
    outputUrl?: SortOrder
    format?: SortOrder
    width?: SortOrder
    height?: SortOrder
    fileSize?: SortOrder
    errorMsg?: SortOrder
    jobId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CreativeMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    templateId?: SortOrder
    name?: SortOrder
    type?: SortOrder
    status?: SortOrder
    inputData?: SortOrder
    outputPath?: SortOrder
    outputUrl?: SortOrder
    format?: SortOrder
    width?: SortOrder
    height?: SortOrder
    fileSize?: SortOrder
    errorMsg?: SortOrder
    jobId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CreativeSumOrderByAggregateInput = {
    width?: SortOrder
    height?: SortOrder
    fileSize?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type CreativeRelationFilter = {
    is?: CreativeWhereInput
    isNot?: CreativeWhereInput
  }

  export type ExportCountOrderByAggregateInput = {
    id?: SortOrder
    creativeId?: SortOrder
    format?: SortOrder
    width?: SortOrder
    height?: SortOrder
    quality?: SortOrder
    outputPath?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
  }

  export type ExportAvgOrderByAggregateInput = {
    width?: SortOrder
    height?: SortOrder
    quality?: SortOrder
  }

  export type ExportMaxOrderByAggregateInput = {
    id?: SortOrder
    creativeId?: SortOrder
    format?: SortOrder
    width?: SortOrder
    height?: SortOrder
    quality?: SortOrder
    outputPath?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
  }

  export type ExportMinOrderByAggregateInput = {
    id?: SortOrder
    creativeId?: SortOrder
    format?: SortOrder
    width?: SortOrder
    height?: SortOrder
    quality?: SortOrder
    outputPath?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
  }

  export type ExportSumOrderByAggregateInput = {
    width?: SortOrder
    height?: SortOrder
    quality?: SortOrder
  }

  export type DeviceFrameCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    category?: SortOrder
    framePath?: SortOrder
    screenX?: SortOrder
    screenY?: SortOrder
    screenW?: SortOrder
    screenH?: SortOrder
    cornerRadius?: SortOrder
  }

  export type DeviceFrameAvgOrderByAggregateInput = {
    screenX?: SortOrder
    screenY?: SortOrder
    screenW?: SortOrder
    screenH?: SortOrder
    cornerRadius?: SortOrder
  }

  export type DeviceFrameMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    category?: SortOrder
    framePath?: SortOrder
    screenX?: SortOrder
    screenY?: SortOrder
    screenW?: SortOrder
    screenH?: SortOrder
    cornerRadius?: SortOrder
  }

  export type DeviceFrameMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    category?: SortOrder
    framePath?: SortOrder
    screenX?: SortOrder
    screenY?: SortOrder
    screenW?: SortOrder
    screenH?: SortOrder
    cornerRadius?: SortOrder
  }

  export type DeviceFrameSumOrderByAggregateInput = {
    screenX?: SortOrder
    screenY?: SortOrder
    screenW?: SortOrder
    screenH?: SortOrder
    cornerRadius?: SortOrder
  }

  export type AiCopyResultCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    prompt?: SortOrder
    context?: SortOrder
    result?: SortOrder
    model?: SortOrder
    tokens?: SortOrder
    createdAt?: SortOrder
  }

  export type AiCopyResultAvgOrderByAggregateInput = {
    tokens?: SortOrder
  }

  export type AiCopyResultMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    prompt?: SortOrder
    context?: SortOrder
    result?: SortOrder
    model?: SortOrder
    tokens?: SortOrder
    createdAt?: SortOrder
  }

  export type AiCopyResultMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    prompt?: SortOrder
    context?: SortOrder
    result?: SortOrder
    model?: SortOrder
    tokens?: SortOrder
    createdAt?: SortOrder
  }

  export type AiCopyResultSumOrderByAggregateInput = {
    tokens?: SortOrder
  }

  export type CreativeCreateNestedManyWithoutTemplateInput = {
    create?: XOR<CreativeCreateWithoutTemplateInput, CreativeUncheckedCreateWithoutTemplateInput> | CreativeCreateWithoutTemplateInput[] | CreativeUncheckedCreateWithoutTemplateInput[]
    connectOrCreate?: CreativeCreateOrConnectWithoutTemplateInput | CreativeCreateOrConnectWithoutTemplateInput[]
    createMany?: CreativeCreateManyTemplateInputEnvelope
    connect?: CreativeWhereUniqueInput | CreativeWhereUniqueInput[]
  }

  export type CreativeUncheckedCreateNestedManyWithoutTemplateInput = {
    create?: XOR<CreativeCreateWithoutTemplateInput, CreativeUncheckedCreateWithoutTemplateInput> | CreativeCreateWithoutTemplateInput[] | CreativeUncheckedCreateWithoutTemplateInput[]
    connectOrCreate?: CreativeCreateOrConnectWithoutTemplateInput | CreativeCreateOrConnectWithoutTemplateInput[]
    createMany?: CreativeCreateManyTemplateInputEnvelope
    connect?: CreativeWhereUniqueInput | CreativeWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type CreativeUpdateManyWithoutTemplateNestedInput = {
    create?: XOR<CreativeCreateWithoutTemplateInput, CreativeUncheckedCreateWithoutTemplateInput> | CreativeCreateWithoutTemplateInput[] | CreativeUncheckedCreateWithoutTemplateInput[]
    connectOrCreate?: CreativeCreateOrConnectWithoutTemplateInput | CreativeCreateOrConnectWithoutTemplateInput[]
    upsert?: CreativeUpsertWithWhereUniqueWithoutTemplateInput | CreativeUpsertWithWhereUniqueWithoutTemplateInput[]
    createMany?: CreativeCreateManyTemplateInputEnvelope
    set?: CreativeWhereUniqueInput | CreativeWhereUniqueInput[]
    disconnect?: CreativeWhereUniqueInput | CreativeWhereUniqueInput[]
    delete?: CreativeWhereUniqueInput | CreativeWhereUniqueInput[]
    connect?: CreativeWhereUniqueInput | CreativeWhereUniqueInput[]
    update?: CreativeUpdateWithWhereUniqueWithoutTemplateInput | CreativeUpdateWithWhereUniqueWithoutTemplateInput[]
    updateMany?: CreativeUpdateManyWithWhereWithoutTemplateInput | CreativeUpdateManyWithWhereWithoutTemplateInput[]
    deleteMany?: CreativeScalarWhereInput | CreativeScalarWhereInput[]
  }

  export type CreativeUncheckedUpdateManyWithoutTemplateNestedInput = {
    create?: XOR<CreativeCreateWithoutTemplateInput, CreativeUncheckedCreateWithoutTemplateInput> | CreativeCreateWithoutTemplateInput[] | CreativeUncheckedCreateWithoutTemplateInput[]
    connectOrCreate?: CreativeCreateOrConnectWithoutTemplateInput | CreativeCreateOrConnectWithoutTemplateInput[]
    upsert?: CreativeUpsertWithWhereUniqueWithoutTemplateInput | CreativeUpsertWithWhereUniqueWithoutTemplateInput[]
    createMany?: CreativeCreateManyTemplateInputEnvelope
    set?: CreativeWhereUniqueInput | CreativeWhereUniqueInput[]
    disconnect?: CreativeWhereUniqueInput | CreativeWhereUniqueInput[]
    delete?: CreativeWhereUniqueInput | CreativeWhereUniqueInput[]
    connect?: CreativeWhereUniqueInput | CreativeWhereUniqueInput[]
    update?: CreativeUpdateWithWhereUniqueWithoutTemplateInput | CreativeUpdateWithWhereUniqueWithoutTemplateInput[]
    updateMany?: CreativeUpdateManyWithWhereWithoutTemplateInput | CreativeUpdateManyWithWhereWithoutTemplateInput[]
    deleteMany?: CreativeScalarWhereInput | CreativeScalarWhereInput[]
  }

  export type TemplateCreateNestedOneWithoutCreativesInput = {
    create?: XOR<TemplateCreateWithoutCreativesInput, TemplateUncheckedCreateWithoutCreativesInput>
    connectOrCreate?: TemplateCreateOrConnectWithoutCreativesInput
    connect?: TemplateWhereUniqueInput
  }

  export type ExportCreateNestedManyWithoutCreativeInput = {
    create?: XOR<ExportCreateWithoutCreativeInput, ExportUncheckedCreateWithoutCreativeInput> | ExportCreateWithoutCreativeInput[] | ExportUncheckedCreateWithoutCreativeInput[]
    connectOrCreate?: ExportCreateOrConnectWithoutCreativeInput | ExportCreateOrConnectWithoutCreativeInput[]
    createMany?: ExportCreateManyCreativeInputEnvelope
    connect?: ExportWhereUniqueInput | ExportWhereUniqueInput[]
  }

  export type ExportUncheckedCreateNestedManyWithoutCreativeInput = {
    create?: XOR<ExportCreateWithoutCreativeInput, ExportUncheckedCreateWithoutCreativeInput> | ExportCreateWithoutCreativeInput[] | ExportUncheckedCreateWithoutCreativeInput[]
    connectOrCreate?: ExportCreateOrConnectWithoutCreativeInput | ExportCreateOrConnectWithoutCreativeInput[]
    createMany?: ExportCreateManyCreativeInputEnvelope
    connect?: ExportWhereUniqueInput | ExportWhereUniqueInput[]
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type TemplateUpdateOneWithoutCreativesNestedInput = {
    create?: XOR<TemplateCreateWithoutCreativesInput, TemplateUncheckedCreateWithoutCreativesInput>
    connectOrCreate?: TemplateCreateOrConnectWithoutCreativesInput
    upsert?: TemplateUpsertWithoutCreativesInput
    disconnect?: TemplateWhereInput | boolean
    delete?: TemplateWhereInput | boolean
    connect?: TemplateWhereUniqueInput
    update?: XOR<XOR<TemplateUpdateToOneWithWhereWithoutCreativesInput, TemplateUpdateWithoutCreativesInput>, TemplateUncheckedUpdateWithoutCreativesInput>
  }

  export type ExportUpdateManyWithoutCreativeNestedInput = {
    create?: XOR<ExportCreateWithoutCreativeInput, ExportUncheckedCreateWithoutCreativeInput> | ExportCreateWithoutCreativeInput[] | ExportUncheckedCreateWithoutCreativeInput[]
    connectOrCreate?: ExportCreateOrConnectWithoutCreativeInput | ExportCreateOrConnectWithoutCreativeInput[]
    upsert?: ExportUpsertWithWhereUniqueWithoutCreativeInput | ExportUpsertWithWhereUniqueWithoutCreativeInput[]
    createMany?: ExportCreateManyCreativeInputEnvelope
    set?: ExportWhereUniqueInput | ExportWhereUniqueInput[]
    disconnect?: ExportWhereUniqueInput | ExportWhereUniqueInput[]
    delete?: ExportWhereUniqueInput | ExportWhereUniqueInput[]
    connect?: ExportWhereUniqueInput | ExportWhereUniqueInput[]
    update?: ExportUpdateWithWhereUniqueWithoutCreativeInput | ExportUpdateWithWhereUniqueWithoutCreativeInput[]
    updateMany?: ExportUpdateManyWithWhereWithoutCreativeInput | ExportUpdateManyWithWhereWithoutCreativeInput[]
    deleteMany?: ExportScalarWhereInput | ExportScalarWhereInput[]
  }

  export type ExportUncheckedUpdateManyWithoutCreativeNestedInput = {
    create?: XOR<ExportCreateWithoutCreativeInput, ExportUncheckedCreateWithoutCreativeInput> | ExportCreateWithoutCreativeInput[] | ExportUncheckedCreateWithoutCreativeInput[]
    connectOrCreate?: ExportCreateOrConnectWithoutCreativeInput | ExportCreateOrConnectWithoutCreativeInput[]
    upsert?: ExportUpsertWithWhereUniqueWithoutCreativeInput | ExportUpsertWithWhereUniqueWithoutCreativeInput[]
    createMany?: ExportCreateManyCreativeInputEnvelope
    set?: ExportWhereUniqueInput | ExportWhereUniqueInput[]
    disconnect?: ExportWhereUniqueInput | ExportWhereUniqueInput[]
    delete?: ExportWhereUniqueInput | ExportWhereUniqueInput[]
    connect?: ExportWhereUniqueInput | ExportWhereUniqueInput[]
    update?: ExportUpdateWithWhereUniqueWithoutCreativeInput | ExportUpdateWithWhereUniqueWithoutCreativeInput[]
    updateMany?: ExportUpdateManyWithWhereWithoutCreativeInput | ExportUpdateManyWithWhereWithoutCreativeInput[]
    deleteMany?: ExportScalarWhereInput | ExportScalarWhereInput[]
  }

  export type CreativeCreateNestedOneWithoutExportsInput = {
    create?: XOR<CreativeCreateWithoutExportsInput, CreativeUncheckedCreateWithoutExportsInput>
    connectOrCreate?: CreativeCreateOrConnectWithoutExportsInput
    connect?: CreativeWhereUniqueInput
  }

  export type CreativeUpdateOneRequiredWithoutExportsNestedInput = {
    create?: XOR<CreativeCreateWithoutExportsInput, CreativeUncheckedCreateWithoutExportsInput>
    connectOrCreate?: CreativeCreateOrConnectWithoutExportsInput
    upsert?: CreativeUpsertWithoutExportsInput
    connect?: CreativeWhereUniqueInput
    update?: XOR<XOR<CreativeUpdateToOneWithWhereWithoutExportsInput, CreativeUpdateWithoutExportsInput>, CreativeUncheckedUpdateWithoutExportsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type CreativeCreateWithoutTemplateInput = {
    id?: string
    tenantId: string
    name: string
    type: string
    status?: string
    inputData: string
    outputPath?: string | null
    outputUrl?: string | null
    format?: string
    width?: number | null
    height?: number | null
    fileSize?: number | null
    errorMsg?: string | null
    jobId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    exports?: ExportCreateNestedManyWithoutCreativeInput
  }

  export type CreativeUncheckedCreateWithoutTemplateInput = {
    id?: string
    tenantId: string
    name: string
    type: string
    status?: string
    inputData: string
    outputPath?: string | null
    outputUrl?: string | null
    format?: string
    width?: number | null
    height?: number | null
    fileSize?: number | null
    errorMsg?: string | null
    jobId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    exports?: ExportUncheckedCreateNestedManyWithoutCreativeInput
  }

  export type CreativeCreateOrConnectWithoutTemplateInput = {
    where: CreativeWhereUniqueInput
    create: XOR<CreativeCreateWithoutTemplateInput, CreativeUncheckedCreateWithoutTemplateInput>
  }

  export type CreativeCreateManyTemplateInputEnvelope = {
    data: CreativeCreateManyTemplateInput | CreativeCreateManyTemplateInput[]
  }

  export type CreativeUpsertWithWhereUniqueWithoutTemplateInput = {
    where: CreativeWhereUniqueInput
    update: XOR<CreativeUpdateWithoutTemplateInput, CreativeUncheckedUpdateWithoutTemplateInput>
    create: XOR<CreativeCreateWithoutTemplateInput, CreativeUncheckedCreateWithoutTemplateInput>
  }

  export type CreativeUpdateWithWhereUniqueWithoutTemplateInput = {
    where: CreativeWhereUniqueInput
    data: XOR<CreativeUpdateWithoutTemplateInput, CreativeUncheckedUpdateWithoutTemplateInput>
  }

  export type CreativeUpdateManyWithWhereWithoutTemplateInput = {
    where: CreativeScalarWhereInput
    data: XOR<CreativeUpdateManyMutationInput, CreativeUncheckedUpdateManyWithoutTemplateInput>
  }

  export type CreativeScalarWhereInput = {
    AND?: CreativeScalarWhereInput | CreativeScalarWhereInput[]
    OR?: CreativeScalarWhereInput[]
    NOT?: CreativeScalarWhereInput | CreativeScalarWhereInput[]
    id?: StringFilter<"Creative"> | string
    tenantId?: StringFilter<"Creative"> | string
    templateId?: StringNullableFilter<"Creative"> | string | null
    name?: StringFilter<"Creative"> | string
    type?: StringFilter<"Creative"> | string
    status?: StringFilter<"Creative"> | string
    inputData?: StringFilter<"Creative"> | string
    outputPath?: StringNullableFilter<"Creative"> | string | null
    outputUrl?: StringNullableFilter<"Creative"> | string | null
    format?: StringFilter<"Creative"> | string
    width?: IntNullableFilter<"Creative"> | number | null
    height?: IntNullableFilter<"Creative"> | number | null
    fileSize?: IntNullableFilter<"Creative"> | number | null
    errorMsg?: StringNullableFilter<"Creative"> | string | null
    jobId?: StringNullableFilter<"Creative"> | string | null
    createdAt?: DateTimeFilter<"Creative"> | Date | string
    updatedAt?: DateTimeFilter<"Creative"> | Date | string
  }

  export type TemplateCreateWithoutCreativesInput = {
    id?: string
    name: string
    category: string
    width: number
    height: number
    layers: string
    thumbnail?: string | null
    isSystem?: boolean
    tenantId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TemplateUncheckedCreateWithoutCreativesInput = {
    id?: string
    name: string
    category: string
    width: number
    height: number
    layers: string
    thumbnail?: string | null
    isSystem?: boolean
    tenantId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TemplateCreateOrConnectWithoutCreativesInput = {
    where: TemplateWhereUniqueInput
    create: XOR<TemplateCreateWithoutCreativesInput, TemplateUncheckedCreateWithoutCreativesInput>
  }

  export type ExportCreateWithoutCreativeInput = {
    id?: string
    format: string
    width: number
    height: number
    quality?: number
    outputPath?: string | null
    status?: string
    createdAt?: Date | string
  }

  export type ExportUncheckedCreateWithoutCreativeInput = {
    id?: string
    format: string
    width: number
    height: number
    quality?: number
    outputPath?: string | null
    status?: string
    createdAt?: Date | string
  }

  export type ExportCreateOrConnectWithoutCreativeInput = {
    where: ExportWhereUniqueInput
    create: XOR<ExportCreateWithoutCreativeInput, ExportUncheckedCreateWithoutCreativeInput>
  }

  export type ExportCreateManyCreativeInputEnvelope = {
    data: ExportCreateManyCreativeInput | ExportCreateManyCreativeInput[]
  }

  export type TemplateUpsertWithoutCreativesInput = {
    update: XOR<TemplateUpdateWithoutCreativesInput, TemplateUncheckedUpdateWithoutCreativesInput>
    create: XOR<TemplateCreateWithoutCreativesInput, TemplateUncheckedCreateWithoutCreativesInput>
    where?: TemplateWhereInput
  }

  export type TemplateUpdateToOneWithWhereWithoutCreativesInput = {
    where?: TemplateWhereInput
    data: XOR<TemplateUpdateWithoutCreativesInput, TemplateUncheckedUpdateWithoutCreativesInput>
  }

  export type TemplateUpdateWithoutCreativesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    layers?: StringFieldUpdateOperationsInput | string
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    isSystem?: BoolFieldUpdateOperationsInput | boolean
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TemplateUncheckedUpdateWithoutCreativesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    layers?: StringFieldUpdateOperationsInput | string
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    isSystem?: BoolFieldUpdateOperationsInput | boolean
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ExportUpsertWithWhereUniqueWithoutCreativeInput = {
    where: ExportWhereUniqueInput
    update: XOR<ExportUpdateWithoutCreativeInput, ExportUncheckedUpdateWithoutCreativeInput>
    create: XOR<ExportCreateWithoutCreativeInput, ExportUncheckedCreateWithoutCreativeInput>
  }

  export type ExportUpdateWithWhereUniqueWithoutCreativeInput = {
    where: ExportWhereUniqueInput
    data: XOR<ExportUpdateWithoutCreativeInput, ExportUncheckedUpdateWithoutCreativeInput>
  }

  export type ExportUpdateManyWithWhereWithoutCreativeInput = {
    where: ExportScalarWhereInput
    data: XOR<ExportUpdateManyMutationInput, ExportUncheckedUpdateManyWithoutCreativeInput>
  }

  export type ExportScalarWhereInput = {
    AND?: ExportScalarWhereInput | ExportScalarWhereInput[]
    OR?: ExportScalarWhereInput[]
    NOT?: ExportScalarWhereInput | ExportScalarWhereInput[]
    id?: StringFilter<"Export"> | string
    creativeId?: StringFilter<"Export"> | string
    format?: StringFilter<"Export"> | string
    width?: IntFilter<"Export"> | number
    height?: IntFilter<"Export"> | number
    quality?: IntFilter<"Export"> | number
    outputPath?: StringNullableFilter<"Export"> | string | null
    status?: StringFilter<"Export"> | string
    createdAt?: DateTimeFilter<"Export"> | Date | string
  }

  export type CreativeCreateWithoutExportsInput = {
    id?: string
    tenantId: string
    name: string
    type: string
    status?: string
    inputData: string
    outputPath?: string | null
    outputUrl?: string | null
    format?: string
    width?: number | null
    height?: number | null
    fileSize?: number | null
    errorMsg?: string | null
    jobId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    template?: TemplateCreateNestedOneWithoutCreativesInput
  }

  export type CreativeUncheckedCreateWithoutExportsInput = {
    id?: string
    tenantId: string
    templateId?: string | null
    name: string
    type: string
    status?: string
    inputData: string
    outputPath?: string | null
    outputUrl?: string | null
    format?: string
    width?: number | null
    height?: number | null
    fileSize?: number | null
    errorMsg?: string | null
    jobId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CreativeCreateOrConnectWithoutExportsInput = {
    where: CreativeWhereUniqueInput
    create: XOR<CreativeCreateWithoutExportsInput, CreativeUncheckedCreateWithoutExportsInput>
  }

  export type CreativeUpsertWithoutExportsInput = {
    update: XOR<CreativeUpdateWithoutExportsInput, CreativeUncheckedUpdateWithoutExportsInput>
    create: XOR<CreativeCreateWithoutExportsInput, CreativeUncheckedCreateWithoutExportsInput>
    where?: CreativeWhereInput
  }

  export type CreativeUpdateToOneWithWhereWithoutExportsInput = {
    where?: CreativeWhereInput
    data: XOR<CreativeUpdateWithoutExportsInput, CreativeUncheckedUpdateWithoutExportsInput>
  }

  export type CreativeUpdateWithoutExportsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    inputData?: StringFieldUpdateOperationsInput | string
    outputPath?: NullableStringFieldUpdateOperationsInput | string | null
    outputUrl?: NullableStringFieldUpdateOperationsInput | string | null
    format?: StringFieldUpdateOperationsInput | string
    width?: NullableIntFieldUpdateOperationsInput | number | null
    height?: NullableIntFieldUpdateOperationsInput | number | null
    fileSize?: NullableIntFieldUpdateOperationsInput | number | null
    errorMsg?: NullableStringFieldUpdateOperationsInput | string | null
    jobId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    template?: TemplateUpdateOneWithoutCreativesNestedInput
  }

  export type CreativeUncheckedUpdateWithoutExportsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    templateId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    inputData?: StringFieldUpdateOperationsInput | string
    outputPath?: NullableStringFieldUpdateOperationsInput | string | null
    outputUrl?: NullableStringFieldUpdateOperationsInput | string | null
    format?: StringFieldUpdateOperationsInput | string
    width?: NullableIntFieldUpdateOperationsInput | number | null
    height?: NullableIntFieldUpdateOperationsInput | number | null
    fileSize?: NullableIntFieldUpdateOperationsInput | number | null
    errorMsg?: NullableStringFieldUpdateOperationsInput | string | null
    jobId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CreativeCreateManyTemplateInput = {
    id?: string
    tenantId: string
    name: string
    type: string
    status?: string
    inputData: string
    outputPath?: string | null
    outputUrl?: string | null
    format?: string
    width?: number | null
    height?: number | null
    fileSize?: number | null
    errorMsg?: string | null
    jobId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CreativeUpdateWithoutTemplateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    inputData?: StringFieldUpdateOperationsInput | string
    outputPath?: NullableStringFieldUpdateOperationsInput | string | null
    outputUrl?: NullableStringFieldUpdateOperationsInput | string | null
    format?: StringFieldUpdateOperationsInput | string
    width?: NullableIntFieldUpdateOperationsInput | number | null
    height?: NullableIntFieldUpdateOperationsInput | number | null
    fileSize?: NullableIntFieldUpdateOperationsInput | number | null
    errorMsg?: NullableStringFieldUpdateOperationsInput | string | null
    jobId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    exports?: ExportUpdateManyWithoutCreativeNestedInput
  }

  export type CreativeUncheckedUpdateWithoutTemplateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    inputData?: StringFieldUpdateOperationsInput | string
    outputPath?: NullableStringFieldUpdateOperationsInput | string | null
    outputUrl?: NullableStringFieldUpdateOperationsInput | string | null
    format?: StringFieldUpdateOperationsInput | string
    width?: NullableIntFieldUpdateOperationsInput | number | null
    height?: NullableIntFieldUpdateOperationsInput | number | null
    fileSize?: NullableIntFieldUpdateOperationsInput | number | null
    errorMsg?: NullableStringFieldUpdateOperationsInput | string | null
    jobId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    exports?: ExportUncheckedUpdateManyWithoutCreativeNestedInput
  }

  export type CreativeUncheckedUpdateManyWithoutTemplateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    inputData?: StringFieldUpdateOperationsInput | string
    outputPath?: NullableStringFieldUpdateOperationsInput | string | null
    outputUrl?: NullableStringFieldUpdateOperationsInput | string | null
    format?: StringFieldUpdateOperationsInput | string
    width?: NullableIntFieldUpdateOperationsInput | number | null
    height?: NullableIntFieldUpdateOperationsInput | number | null
    fileSize?: NullableIntFieldUpdateOperationsInput | number | null
    errorMsg?: NullableStringFieldUpdateOperationsInput | string | null
    jobId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ExportCreateManyCreativeInput = {
    id?: string
    format: string
    width: number
    height: number
    quality?: number
    outputPath?: string | null
    status?: string
    createdAt?: Date | string
  }

  export type ExportUpdateWithoutCreativeInput = {
    id?: StringFieldUpdateOperationsInput | string
    format?: StringFieldUpdateOperationsInput | string
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    quality?: IntFieldUpdateOperationsInput | number
    outputPath?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ExportUncheckedUpdateWithoutCreativeInput = {
    id?: StringFieldUpdateOperationsInput | string
    format?: StringFieldUpdateOperationsInput | string
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    quality?: IntFieldUpdateOperationsInput | number
    outputPath?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ExportUncheckedUpdateManyWithoutCreativeInput = {
    id?: StringFieldUpdateOperationsInput | string
    format?: StringFieldUpdateOperationsInput | string
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    quality?: IntFieldUpdateOperationsInput | number
    outputPath?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use TemplateCountOutputTypeDefaultArgs instead
     */
    export type TemplateCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TemplateCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CreativeCountOutputTypeDefaultArgs instead
     */
    export type CreativeCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CreativeCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TemplateDefaultArgs instead
     */
    export type TemplateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TemplateDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CreativeDefaultArgs instead
     */
    export type CreativeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CreativeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ExportDefaultArgs instead
     */
    export type ExportArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ExportDefaultArgs<ExtArgs>
    /**
     * @deprecated Use DeviceFrameDefaultArgs instead
     */
    export type DeviceFrameArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = DeviceFrameDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AiCopyResultDefaultArgs instead
     */
    export type AiCopyResultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AiCopyResultDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}