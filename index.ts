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
                value: string
            }
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

const data: IUser[] = [
    { id: 1, nome: 'João', idade: 25, calendar: { day: 1, time: { hour: 10, minute: 30, test: { value: 'a'} } } },
    { id: 2, nome: 'Maria', idade: 30, calendar: { day: 2, time: { hour: 9, minute: 45,  test: { value: 'b'} } } },
    { id: 3, nome: 'Maria', idade: 28, calendar: { day: 3, time: { hour: 14, minute: 0 ,  test: { value: 'c'}} } },
];

function checkNotOperator<T>(value: T | NotOperator<T>): value is NotOperator<T> {
    return value instanceof NotOperator;
}

function match<T>(item: T, criteria: TWhere<T>): boolean {
    for (const key in criteria) {
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
    let result: T | null = null;
    search(data, criteria, item => {
        if (!result) {
            result = item as T;
        }
    });
    return result;
}

function Not<T>(arg: T) {
    return new NotOperator<T>(arg);
}


const users = many<IUser>({ idade: Not(28), nome: 'Maria', calendar: { day: 2 } });
console.log(users);

const user = one<IUser>({ calendar: { time: { test: { value: 'a'}} } });
console.log(user);
