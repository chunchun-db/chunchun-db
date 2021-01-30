import { connect as connectToDb, IDbClient } from '@chunchun-db/client';

export class DbService {
    private static instance: DbService;

    static getInstance(): DbService {
        if (!DbService.instance) {
            DbService.instance = new DbService();
        }

        return DbService.instance;
    }

    private dbClient?: IDbClient;

    public get isConnected() {
        return !!this.dbClient;
    }

    async connect({ hostName, port }: { hostName: string; port: number }) {
        this.dbClient = await connectToDb({ host: hostName, port });
    }

    async getAllDatabases() {
        return this.dbClient?.getAllDatabases();
    }
}
