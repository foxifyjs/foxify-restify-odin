declare global {
    namespace NodeJS {
        interface Global {
            __MONGO_DB_NAME__: string;
            __MONGO_CONNECTION__: any;
        }
    }
}
export {};
