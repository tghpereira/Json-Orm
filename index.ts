const data: IUser[] = [];
for (let i = 0; i < 105000; i++) {
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



function checkNotOperator<T>(value: T | NotOperator<T>): value is NotOperator<T> {
    return value instanceof NotOperator;
}

function match<T>(item: T, criteria: TWhere<T>): boolean {
    for (const key in criteria) {
        if (criteria.hasOwnProperty(key)) {
            const target = criteria[key];
            const value = item[key as keyof T];

            if (checkNotOperator(target)) {
                if (target.value === value) {
                    return false;
                }
            } else if (typeof target === 'object') {
                if (!match(value, target)) {
                    return false;
                }
            } else {
                if (target !== value) {
                    return false;
                }
            }
        }
    }
    return true;
}

function search<T>(data: T[], criteria: TWhere<T>, callback: (item: T) => void) {
    for (const item of data) {
        if (match(item, criteria)) {
            callback(item);
        }
    }
}

function many<T>(criteria: TWhere<T>): T[] {
    const results: T[] = [];
    search(data, criteria, item => {
        results.push(item as T);
    });
    return results;
}

function one<T>(criteria: TWhere<T>): T | null {
    for (const item of data) {
        if (match(item, criteria)) {
            return item as T;
        }
    }
    return null;
}

function Not<T>(arg: T) {
    return new NotOperator<T>(arg);
}

setTimeout(() => {
    const start = Date.now();
    const user = one<IUser>({ calendar: { time: { test: { value: 'Test 46800' } } } });
    const end = Date.now();
    const execution = end - start;
    console.log(`Finded ${JSON.stringify(user)} records of ${data.length} in ${execution} ms.`);
}, 3000);

setTimeout(() => {
    const start = Date.now();
    const users = many<IUser>({ calendar: { time: { hour: 12 } } });
    console.log(users.length);
    const end = Date.now();
    const execution = end - start;
    console.log(`Finded ${users.length} records of ${data.length} in ${execution} ms.`);
}, 3500);
