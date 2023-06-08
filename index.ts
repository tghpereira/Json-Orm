interface IUser {
  id: number;
  nome: string;
  idade: number;
  calendar: {
    day: number;
    time: {
      hour: number;
      minute: number;
      test: {
        value: string;
      };
    };
  };
}

const data: IUser[] = [];
for (let i = 0; i < 1000000; i++) {
  const user: IUser = {
    id: i + 1,
    nome: `User ${i + 1}`,
    idade: Math.floor(Math.random() * 100) + 1,
    calendar: {
      day: Math.floor(Math.random() * 31) + 1,
      time: {
        hour: Math.floor(Math.random() * 24),
        minute: Math.floor(Math.random() * 60),
        test: {
          value: `Test ${i + 1}`,
        },
      },
    },
  };

  data.push(user);
}

type TNotOperator<T> = { value: T };

type TWhere<T> = {
  [K in keyof T]?: T[K] | TNotOperator<T[K]> | TWhere<T[K]>;
};

class NotOperator<T> implements TNotOperator<T> {
  value: T;
  constructor(value: T) {
    this.value = value;
  }
}

function checkNotOperator<T>(value: T | TNotOperator<T>): value is TNotOperator<T> {
  return value instanceof NotOperator;
}

function match<T>(item: T, where: Partial<TWhere<T>>): boolean {
  for (const key in where) {
    const target = where[key];
    const value = item[key as keyof T];
    if (checkNotOperator(target)) {
      if (target.value === value) return false;
    }
    else if (typeof target === 'object') {
      if (!match(value, target)) return false;
    }
    else if (target !== value) return false;
  }
  return true;
}

function search<T>(data: T[], where: Partial<TWhere<T>>, callback: (item: T) => void) {
  for (const item of data) if (match(item, where)) callback(item);
}

function many<T>(where: Partial<TWhere<T>>): T[] {
  const results: T[] = [];
  search(data, where, item => results.push(item as T));
  return results;
}

function one<T>(where: Partial<TWhere<T>>): T | null {
  for (const item of data) if (match(item, where)) return item as T;
  return null;
}

function Not<T>(arg: T) {
  return new NotOperator<T>(arg);
}

setTimeout(() => {
  const start = Date.now();
  const user = one<IUser>({ calendar: { time: { test: { value: 'Test 368756' } } } });
  const end = Date.now();
  const execution = end - start;
  console.log(`Finded ${JSON.stringify(user)} records of ${data.length} in ${execution} ms.`);
}, 3000); 

setTimeout(() => {
  const start = Date.now();
  const users = many<IUser>({ calendar: { time: { hour: Not(12) } } });
  console.log(users.length);
  const end = Date.now();
  const execution = end - start;
  console.log(`Finded ${users.length} records of ${data.length} in ${execution} ms.`);
}, 3500);
